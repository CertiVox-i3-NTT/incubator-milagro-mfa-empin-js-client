var Mpin = Mpin || {};

ViewControllerManager = function() {
  this.config = Mpin.Config.sharedInstance();

  // Judge User Agent
  var ua = window.navigator.userAgent.toLowerCase();
  var isTablet = (ua.indexOf("windows") != -1 && ua.indexOf("touch") != -1)
        || ua.indexOf("ipad") != -1
        || (ua.indexOf("android") != -1 && ua.indexOf("mobile") == -1)
        || (ua.indexOf("firefox") != -1 && ua.indexOf("tablet") != -1)
        || ua.indexOf("kindle") != -1
        || ua.indexOf("silk") != -1
        || ua.indexOf("playbook") != -1;

  var isMobile = (ua.indexOf("windows") != -1 && ua.indexOf("phone") != -1)
        || ua.indexOf("iphone") != -1
        || ua.indexOf("ipod") != -1
        || (ua.indexOf("android") != -1 && ua.indexOf("mobile") != -1)
        || (ua.indexOf("firefox") != -1 && ua.indexOf("mobile") != -1)
        || ua.indexOf("blackberry") != -1;
  if (isTablet || isMobile) {
    this.deviceType = Mpin.DeviceType.SP;
  } else {
    this.deviceType = Mpin.DeviceType.PC;
  }

  // view port
  this._beforeOverFlow = '';
  this._beforeViewPort = null;
  this._viewPortContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';

  // Manager View Controller
  this.currentViewController = null;
  this.beforeViewController = null;

  // Blur
  this._blurClass = 'mpin-blur';

  // Manage View
  this._isShown = false;
  this.target = document.getElementById(this.config.clientId);
  if (!this.target) {
    Mpin.Logger.info('Client tag not found, new create');
    this.target = document.createElement('DIV');
    this.target.id = this.config.clientId;
  }
  this.target.classList.add('mpin-hide');
  document.body.appendChild(this.target);

  var viewTemplate = Mpin.ViewManager.views.manager;
  var resources = Mpin.Resources.getResource();
  var managerView = viewTemplate(resources);
  this.target.insertAdjacentHTML('beforeend', managerView);


  // For block view && loading view
  this._blockCount = 0;
  this._loadingCount = 0;

  this._mutex = Mpin.Utility.createMutex();

  // object
  this._mpinLoadingView = document.getElementById('mpinLoadingView');
  this._mpinWrapper = document.getElementById('mpinWrapper');
  this._mpinWrapperVirtual = document.getElementById('mpinWrapperVirtual');
  this._mpinBlockView = document.getElementById('mpinBlockView');
  this._mpinLoadingView = document.getElementById('mpinLoadingView');
  this._mpinContentsVirtual = document.getElementById('mpinContentsVirtual');
  this._mpinContents = document.getElementById('mpinContents');
  this._mpinToolbarVirtual = document.getElementById('mpinToolbarVirtual');
  this._mpinToolbar = document.getElementById('mpinToolbar');
  this._mpinBackButton = document.getElementById('mpinManagerBack');
  this._mpinBackButtonImage = document.getElementById('mpinManagerBackImage');
  this._mpinCloseButton = document.getElementById('mpinManagerClose');
  this._mpinCloseButtonImage = document.getElementById('mpinManagerCloseImage');
  this._mpinMessage = document.getElementById('mpinMessage');
  this._mpinTitle = document.getElementById('mpinManagerTitle');

  var self = this;
  this._mpinWrapperVirtual.addEventListener('scroll', function() {
    self._mpinWrapper.scrollTop = self._mpinWrapperVirtual.scrollTop;
  });

  // Action
  Mpin.Utility.addEvent('click', self._mpinBackButton, function() {
    self.back();
  });
  Mpin.Utility.addEvent('click', self._mpinCloseButton, function() {
    self.currentViewController.viewWillRemoved();

    var view = document.getElementById(self.currentViewController._viewId);
    Mpin.Utility.removeElement(view);
    self.currentViewController.viewDidRemoved();
    self.currentViewController = null;
    self.beforeViewController = null;
    
    self.hide();
  });

  Mpin.Utility.addEvent('mouseover', self._mpinCloseButton, function() {
    self._mpinCloseButtonImage.src = self.config.imageBaseURL + '/close_on.png';
  });
  Mpin.Utility.addEvent('mouseout', self._mpinCloseButton, function() {
    self._mpinCloseButtonImage.src = self.config.imageBaseURL + '/close.png';
  });
  Mpin.Utility.addEvent('mouseover', self._mpinBackButton, function() {
    self._mpinBackButtonImage.src = self.config.imageBaseURL + '/back_on.png';
  });
  Mpin.Utility.addEvent('mouseout', self._mpinBackButton, function() {
    self._mpinBackButtonImage.src = self.config.imageBaseURL + '/back.png';
  });
};

// Display Control
ViewControllerManager.prototype.show = function() {
  var baseTags = document.body.children;
  for (var i = 0; i < baseTags.length; i++) {
    var t = baseTags[i];
    if (t.id == this.config.clientId) continue;
    t.classList.add(this._blurClass);
  }


  this._isShown = true;
  Mpin.Utility.show(this.target);

  // Stop scroll of base page
  this._beforeOverFlow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // Fix window scale
  var viewport = document.querySelector("meta[name=viewport]");
  if (!viewport) {
    Mpin.Logger.debug('add viewport');

    var metaTag = document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = this._viewPortContent;

    var head = document.getElementsByTagName('head');
    if (head) {
      head[0].appendChild(metaTag);
    } else {
      Mpin.Logger.error('head tag not found');
    }

    this._beforeViewPort = null;
  } else {
    Mpin.Logger.debug('change viewport');
    this._beforeViewPort = viewport.getAttribute('content');
    viewport.setAttribute('content', this._viewPortContent);
  }
};
ViewControllerManager.prototype.hide = function() {
  var baseTags = document.body.children;
  for (var i = 0; i < baseTags.length; i++) {
    var t = baseTags[i];
    if (t.id == this.config.clientId) continue;
    t.classList.remove(this._blurClass);
  }

  this._isShown = false;
  Mpin.Utility.hide(this.target);
  document.body.style.overflow = this._beforeOverFlow;

  var viewport;
  if (this._beforeViewPort === null) {
    // Delete viewport meta tag
    viewport = document.querySelector("meta[name=viewport]");
    Mpin.Utility.removeElement(viewport);
  } else {
    // Undo viewport
    viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content', this._beforeViewPort);
  }
};

// Private

// screen <<< new view <<<
ViewControllerManager.prototype.push = function(nextViewController, animation, initial) {
  var self = this;

  animation = (typeof animation !== 'undefined' ? animation : true);
  initial = (typeof initial !== 'undefined' ? initial : false);

  var pushNewView = function() {
    self.currentViewController = nextViewController;
    nextViewController.viewControllerManager = self;

    // Add view
    var viewHTML = nextViewController.view;
    self._mpinContentsVirtual.insertAdjacentHTML('beforeend', viewHTML);
    var viewId = nextViewController._viewId;
    var view = document.getElementById(viewId);
    view.style.marginLeft = '-5000px'; // out of window

    nextViewController.viewDidLoad();
    nextViewController.viewWillAppear();

    self._pushFromRight(nextViewController, function() {
      if (initial) {
        Mpin.Utility.hide(self._mpinBackButton);
      } else {
        Mpin.Utility.show(self._mpinBackButton);
      }
      self._showOverFlow();
      nextViewController.viewDidAppear();
    }, animation);

  };

  this._hideOverFlow();
  if (self.currentViewController) {
    // pop
    Mpin.Logger.debug('pop currentVC');
    self._popToLeft(self.currentViewController, function() {
      self.beforeViewController = self.currentViewController;

      self.beforeViewController.viewWillRemoved();
      var view = document.getElementById(self.currentViewController._viewId);
      Mpin.Utility.removeElement(view);
      self.beforeViewController.viewDidRemoved();

      pushNewView();
    }, animation);
  } else {
    pushNewView();
  }

  return;
};

ViewControllerManager.prototype.back = function(viewController, animation) {
  var self = this;

  animation = (typeof animation !== 'undefined' ? animation : true);

  if (!self.beforeViewController && !viewController) {
    Mpin.Logger.error('back failed');
    return;
  }
  var nextViewController;
  if (viewController) {
    nextViewController = viewController;
    nextViewController.viewControllerManager = self;
  } else {
    nextViewController = self.beforeViewController;
  }

  Mpin.Utility.hide(self._mpinBackButton);

  this._hideOverFlow();
  self._popToRight(self.currentViewController, function() {
    self.currentViewController.viewWillRemoved();
    var view = document.getElementById(self.currentViewController._viewId);
    Mpin.Utility.removeElement(view);
    self.currentViewController.viewDidRemoved();

    if (!nextViewController.validate()) {
      if (Mpin.Core.sharedInstance().userExist()) {
        var homeVC = new HomeViewController(Mpin.ViewManager.views.home);
        homeVC.viewControllerManager = self;
        nextViewController = homeVC;
      } else {
        var initialVC = new InitialViewController(Mpin.ViewManager.views.initial);
        initialVC.viewControllerManager = self;
        nextViewController = initialVC;
      }
    }

    self.currentViewController = nextViewController;

    // Add view
    var viewHTML = nextViewController.view;
    self._mpinContentsVirtual.insertAdjacentHTML('beforeend', viewHTML);
    var viewId = nextViewController._viewId;
    var newView = document.getElementById(viewId);
    newView.style.marginLeft = '-5000px'; // out of window

    nextViewController.viewDidLoad();
    nextViewController.viewWillAppear();

    self._pushFromLeft(nextViewController, function() {
      self._showOverFlow();
      nextViewController.viewDidAppear();
      self.beforeViewController = null;
    }, animation);


  }, animation);

  return;
};



ViewControllerManager.prototype._pushFromRight = function(viewController, callBack, animation) {
  Mpin.Logger.debug('_pushFromRightAnimate');
  animation = (typeof animation !== 'undefined' ? animation : true);
  var self = this;
  var viewId = viewController._viewId;
  var target = document.getElementById(viewId);

  self.changeContentSize(self.getHeight(target), function() {
    if (animation) {
      self._viewMoveAnimation(viewController, 500, 0, callBack);
    } else {
      self._viewMove(viewController, 0, callBack);
    }
  });
};
ViewControllerManager.prototype._pushFromLeft = function(viewController, callBack, animation) {
  Mpin.Logger.debug('_pushFromLeftAnimate');
  animation = (typeof animation !== 'undefined' ? animation : true);
  var self = this;
  var viewId = viewController._viewId;
  var target = document.getElementById(viewId);

  self.changeContentSize(self.getHeight(target), function() {
    if (animation) {
      self._viewMoveAnimation(viewController, -500, 0, callBack);
    } else {
      self._viewMove(viewController, 0, callBack);
    }
  });
};
ViewControllerManager.prototype._popToRight = function(viewController, callBack, animation) {
  Mpin.Logger.debug('_popToRightAnimate');
  animation = (typeof animation !== 'undefined' ? animation : true);
  var self = this;
  var viewId = viewController._viewId;
  var target = document.getElementById(viewId);

  if (animation) {
    self._viewMoveAnimation(viewController, 0, 500, callBack);
  } else {
    self._viewMove(viewController, 500, callBack);
  }
};
ViewControllerManager.prototype._popToLeft = function(viewController, callBack, animation) {
  Mpin.Logger.debug('_popToLeftAnimate');
  animation = (typeof animation !== 'undefined' ? animation : true);
  var self = this;
  var viewId = viewController._viewId;
  var target = document.getElementById(viewId);

  if (animation) {
    self._viewMoveAnimation(viewController, 0, -500, callBack);
  } else {
    self._viewMove(viewController, -500, callBack);
  }
};

ViewControllerManager.prototype._viewMove = function(viewController, endMarginLeft, callBack) {
  var self = this;
  if (!viewController) {
    Mpin.Logger.warn('viewController not found');
    return;
  }

  var target = document.getElementById(viewController._viewId);
  if (!target) {
    Mpin.Logger.warn('object not found');
    return;
  }

  self.blockView();
  target.style.marginLeft = endMarginLeft + 'px';
  var wait = 1;
  setTimeout(function() {
    callBack && callBack();
    self.releaseView();
  }, wait);
};

ViewControllerManager.prototype._viewMoveAnimation = function(viewController, startMarginLeft, endMarginLeft, callBack) {
  var self = this;
  if (!viewController) {
    Mpin.Logger.warn('viewController not found');
    return;
  }

  var target = document.getElementById(viewController._viewId);
  if (!target) {
    Mpin.Logger.warn('object not found');
    return;
  }

  self.blockView();
  Mpin.Utility.runAnimation(200, startMarginLeft, endMarginLeft, function(currentValue) {
    target.style.marginLeft = currentValue + 'px';
  }, function() {
    callBack && callBack();
    self.releaseView();
  });
};


ViewControllerManager.prototype.changeContentSize = function(endHeight, callBack, animation) {
  var startHeight = this.getHeight(this._mpinContents);
  this._animateContentSize(startHeight, endHeight, callBack, animation);
  Mpin.Logger.debug('change content height: ' + startHeight + ' -> ' + endHeight);
};

ViewControllerManager.prototype.updateContentSize = function(callBack, animation) {
  var endHeight = this.getHeight(this._mpinContentsVirtual);
  var startHeight = this.getHeight(this._mpinContents);
  this._animateContentSize(startHeight, endHeight, callBack, animation);
  Mpin.Logger.debug('update content height: ' + startHeight + ' -> ' + endHeight);
};
ViewControllerManager.prototype._animateContentSize = function(startHeight, endHeight, callBack, animation) {
  animation = (typeof animation !== 'undefined' ? animation : true);

  var self = this;
  var currentHeight = startHeight;

  if (animation) {
    self.blockView();
    Mpin.Utility.runAnimation(100, startHeight, endHeight, function(currentValue) {
      self._mpinContents.style.height = currentValue + 'px';
    }, function() {
      callBack && callBack();
      self.releaseView();
    });
  } else {
    self._mpinContents.style.height = endHeight + 'px';
    self.blockView();
    callBack && callBack();
    self.releaseView();
    return;
  }
};


ViewControllerManager.prototype.getHeight = function(object) {
  // don't use scrollHeight (for too long popup menu)
  return Math.max(
      object.offsetHeight,
      object.clientHeight
  );
};

// Block View
// Block user action while animating
// use blockview / releaseview for short time blocking
// use showLoadingView / hideLoadingView for long time blocking
ViewControllerManager.prototype.blockView = function() {
  this._blockCount++;
  Mpin.Logger.debug('block view, block count: ' + this._blockCount);

  if (this._blockCount > 0) {
    Mpin.Utility.show(this._mpinBlockView);
  }
};
ViewControllerManager.prototype.releaseView = function() {
  this._blockCount--;
  Mpin.Logger.debug('release view, block count: ' + this._blockCount);
  if (this._blockCount === 0) {
    Mpin.Utility.hide(this._mpinBlockView);
  } else if (this._blockCount < 0) {
    Mpin.Logger.error('blockCount is invalid');
  }
};
ViewControllerManager.prototype.showLoadingView = function() {
  this._loadingCount++;
  Mpin.Logger.debug('show loading view, loading count: ' + this._loadingCount);

  if (this._loadingCount > 0) {
    Mpin.Utility.show(this._mpinLoadingView);
    this._mpinLoadingView.scrollTop = this._mpinWrapperVirtual.scrollTop;
    this._mpinLoadingView.style.overflow = 'hidden';

    // reload animation
    // For CSS bug: display property's change cause to stop animation
    var dot1 = document.getElementById('mpin-spinner-dot1');
    var dot2 = document.getElementById('mpin-spinner-dot2');
    dot1.classList.remove('dot1');
    dot2.classList.remove('dot2');

    dot1.offsetWidth = dot1.offsetWidth;
    dot2.offsetWidth = dot2.offsetWidth;

    dot1.classList.add('dot1');
    dot2.classList.add('dot2');
  }
};
ViewControllerManager.prototype.hideLoadingView = function() {
  this._loadingCount--;
  Mpin.Logger.debug('hide loading view, loading count: ' + this._loadingCount);
  if (this._loadingCount === 0) {
    Mpin.Utility.hide(this._mpinLoadingView);
    this._mpinLoadingView.style.overflow = '';
  } else if (this._loadingCount < 0) {
    Mpin.Logger.error('loadingCount is invalid');
  }
};
// todo: animation class
ViewControllerManager.prototype.fadeOut = function(callBack) {
  this._animateOpacity(1, 0, callBack);
};
ViewControllerManager.prototype.fadeIn = function(callBack) {
  this._animateOpacity(0, 1, callBack);
};
ViewControllerManager.prototype._animateOpacity = function(startOpacity, endOpacity, callBack) {
  var self = this;

  self.blockView();
  Mpin.Utility.runAnimation(100, startOpacity, endOpacity, function(currentValue) {
    self._mpinToolbarVirtual.style.opacity = currentValue;
    self._mpinContentsVirtual.style.opacity = currentValue;
  }, function() {
    callBack && callBack();
    self.releaseView();
  });
};


// title
ViewControllerManager.prototype.setTitle = function(titleText) {
  this._mpinTitle.innerHTML = titleText;
};

// overflow toggle
// set 'overflow: hidden' only when side scroll animation
// css can't do 'overflow-x: hidden' && 'overflow-y: visible' 
ViewControllerManager.prototype._hideOverFlow = function() {
  this._mpinContentsVirtual.classList.add('mpin-overflow-x-hidden');
};

ViewControllerManager.prototype._showOverFlow = function() {
  this._mpinContentsVirtual.classList.remove('mpin-overflow-x-hidden');
};

ViewControllerManager.prototype.refresh = function() {
  Mpin.Logger.debug('view refresh');
  var self = this;

  if (self._mutex.try()) {
    if (self.currentViewController.reloadable()) {
      self._reload(function() {
        self._mutex.release();
        if (self._mutex.getPending()) {
          self.refresh();
        }
      });
    } else {
      self._mutex.release();
    }
  }
};
ViewControllerManager.prototype._reload = function(callBack) {
  var self = this;

  // remove old view start
  self.blockView();
  self.currentViewController.viewWillRemoved();
  self.fadeOut(function() {
    var oldView = document.getElementById(self.currentViewController._viewId);
    Mpin.Utility.removeElement(oldView);
    self.currentViewController.viewDidRemoved();
    // remove old view finish

    // check viewcontroller can be shown
    if (!self.currentViewController.shouldKeep() || !self.currentViewController.validate()) {
      if (Mpin.Core.sharedInstance().userExist()) {
        var homeVC = new HomeViewController(Mpin.ViewManager.views.home);
        self.currentViewController = homeVC;
      } else {
        var initialVC = new InitialViewController(Mpin.ViewManager.views.initial);
        self.currentViewController = initialVC;
      }
      self.currentViewController.viewControllerManager = self;
      self.beforeViewController = null;
      Mpin.Utility.hide(self._mpinBackButton);
    }

    // insert new view start
    var viewHTML = self.currentViewController.view;
    self._mpinContentsVirtual.insertAdjacentHTML('beforeend', viewHTML);
    var newView = document.getElementById(self.currentViewController._viewId);
    self.currentViewController.viewDidLoad();
    self.currentViewController.viewWillAppear();
    self.fadeIn(function() {
      self.currentViewController.viewDidAppear();
      self.updateContentSize(function() {
        self.releaseView();
        // insert new view finish

        callBack && callBack();
      }, true);
    });
  });
};
