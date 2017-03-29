Mpin.ViewType = {
  Default: "Default",
  MobileLogin: "MobileLogin"
};

ViewController = function() {
  // not called
};

ViewController.prototype._initWithView = function(viewTemplate, resources) {
  var resource = Mpin.Resources.getResource();
  if (!viewTemplate) {
    Mpin.Logger.fatal('invalid parameter');
  }
  this.viewControllerManager = null;
  this._viewId = null;
  this._infoMessageId = null;
  this._errorMessageId = null;
  this.view = viewTemplate(resources);

    // title
  this._defaultTitle = resource.manager_default_title;
  this._loginFromMobileTitle = resource.manager_mobile_title;
};

ViewController.prototype.reloadable = function() {
  return true;
};
ViewController.prototype.shouldKeep = function() {
  return true;
};

ViewController.prototype.validate = function() {
  return true;
};
// called before hiding view
ViewController.prototype.viewWillRemoved = function() {
  Mpin.Logger.debug('ViewController: viewWillRemoved');
};
// called after hiding view
ViewController.prototype.viewDidRemoved = function() {
  Mpin.Logger.debug('ViewController: viewDidRemoved');
  Mpin.Core.sharedInstance().reload();
};
// called after html loaded
ViewController.prototype.viewDidLoad = function() {
  Mpin.Logger.debug('ViewController: viewDidLoad');
  var self = this;

  self.setDropdown();

  if (this._pinCodeInputId && this._pinCodePlaceHolderId && this._pinRecommendedLength && this._pinCodeLabelId) {
    Mpin.Utility.addEvent('keyup', document.getElementById(this._pinCodeInputId), this._pinInputChanged.bind(this));
    Mpin.Utility.addEvent('keydown', document.getElementById(this._pinCodeInputId), this._pinInputChanged.bind(this));
    Mpin.Utility.addEvent('change', document.getElementById(this._pinCodeInputId), this._pinInputChanged.bind(this));
  }
};

ViewController.prototype._pinInputChanged = function() {
  var pinCodeInput = document.getElementById(this._pinCodeInputId);
  var pinCodePlaceHolder = document.getElementById(this._pinCodePlaceHolderId);
  var pinCodeLabel = document.getElementById(this._pinCodeLabelId);

  if (pinCodeInput.value === '') {
    pinCodePlaceHolder.value = '';
    pinCodeLabel.value = '';
    pinCodeLabel.classList.remove('mpin-label-off');
    pinCodeLabel.classList.add('mpin-label-on');
  } else {
    pinCodePlaceHolder.value = 'x'.repeat(this._pinRecommendedLength); // shown as password symbol
    pinCodeLabel.value = 'x';
    pinCodeLabel.classList.remove('mpin-label-on');
    pinCodeLabel.classList.add('mpin-label-off');
  }
};

// called before showing view
ViewController.prototype.viewWillAppear = function() {
  Mpin.Logger.debug('ViewController: viewWillAppear');

  // set title
  switch (this._viewType) {
    case Mpin.ViewType.Default:
      this.viewControllerManager.setTitle(this._defaultTitle);
      break;
    case Mpin.ViewType.MobileLogin:
      this.viewControllerManager.setTitle(this._loginFromMobileTitle);
      break;
    default:
      Mpin.Logger.error('Unknown case: ' + this._viewType);
  }
};
// called after showing view
ViewController.prototype.viewDidAppear = function() {
  Mpin.Logger.debug('ViewController: viewDidAppear');
};
ViewController.prototype._pop = function() {
  this.viewControllerManager.pop(this._viewId);
};

// Message -----------------------------------------------------------
// Info Message
ViewController.prototype.setInfoMessage = function(messageText, updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(this._infoTextId);
  var targetWrapper = document.getElementById(this._infoId);
  if (!target || !targetWrapper) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = messageText;
  Mpin.Utility.show(targetWrapper);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};
ViewController.prototype.addInfoMessage = function(messageText, updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(this._infoTextId);
  var targetWrapper = document.getElementById(this._infoId);
  if (!target || !targetWrapper) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = target.innerHTML + messageText;
  Mpin.Utility.show(targetWrapper);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};
ViewController.prototype.resetInfoMessage = function(updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(this._infoTextId);
  var targetWrapper = document.getElementById(this._infoId);
  if (!target || !targetWrapper) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = '';
  Mpin.Utility.hide(targetWrapper);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};

// Error Message
ViewController.prototype.setErrorMessage = function(id, messageText, updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(id);
  if (!target) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = messageText;
  Mpin.Utility.show(target);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};
ViewController.prototype.addErrorMessage = function(id, messageText, updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(id);
  if (!target) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = target.innerHTML + messageText;
  Mpin.Utility.show(target);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};
ViewController.prototype.resetErrorMessage = function(id, updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);
  var target = document.getElementById(id);
  if (!target) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.innerHTML = '';
  Mpin.Utility.hide(target);
  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};
// Error input
ViewController.prototype.setErrorInput = function(id) {
  var target = document.getElementById(id);
  if (!target) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.classList.add("mpin-input-error");
};
ViewController.prototype.clearErrorInput = function(id) {
  var target = document.getElementById(id);
  if (!target) {
    Mpin.Logger.warn('error target not found');
    return;
  }

  target.classList.remove("mpin-input-error");
};

ViewController.prototype.resetAllErrorMessage = function(updateContentSize) {
  updateContentSize = (typeof updateContentSize !== 'undefined' ? updateContentSize : false);

  var errorInputs = document.getElementsByClassName('mpin-input-error');
  for (var i = errorInputs.length - 1; i >= 0; i--) {
    errorInputs[i].classList.remove('mpin-input-error');
  }

  var errorMessages = document.getElementsByClassName('mpin-error-message');
  for (i = 0; i < errorMessages.length; i++) {
    errorMessages[i].innerHTML = '';
    Mpin.Utility.hide(errorMessages[i]);
  }

  if (updateContentSize) {
    this.viewControllerManager.updateContentSize(null);
  }
};

// action
ViewController.prototype.setDropdown = function() {
  var dropdowns = document.getElementsByClassName('mpin-dropdown-toggle');
  for (var i = 0; i < dropdowns.length; i++) {
    dropdowns[i].addEventListener('click', function() {
      var parent = this.parentNode;

      if (parent.className.indexOf('mpin-open') > -1) {
        parent.classList.remove('mpin-open');
      } else {
        parent.classList.add('mpin-open');

        var menus = document.getElementsByClassName('mpin-menu');
        for (var i = 0; i < menus.length; i++) {
          var menu = menus[i];
          menu.addEventListener('click', function() {
            parent.classList.remove('mpin-open');
          });
        }
      }
    });
  }
};
