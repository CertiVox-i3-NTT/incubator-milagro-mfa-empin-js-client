/**
 * InitialViewController<br>
 * This method is a constructor of InitialViewController.<br>
 * Defines common constants shared in instance methods.<br>
 * Creates HTML from "viewTemplate" argument and language resources.<br>
 *
 * @constructor
 * @param {object} viewTemplate - "handlebarsjs" object for including html
 */
InitialViewController = function(viewTemplate) {
  this._initWithView(viewTemplate, Mpin.Resources.getResource());
  this._viewId = 'mpinInitialView';

  this._viewType = Mpin.ViewType.Default;

  this._menuTarget = 'mpinInitialMenuTarget';
  this._goToInstallButtonId = 'mpinInitialGoToInstallButton';
  this._goToMobileButtonId = 'mpinInitialViewGoToMobileButton';
  this._mobileMenuId = 'mpinInitialMobileButton';
  this._installButtonId = 'mpinInitialInstallButton';
};
Mpin.inherits(InitialViewController, ViewController);

/**
 * Called after the HTML view is loaded to browser screen. <br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
InitialViewController.prototype.viewDidLoad = function() {
  Mpin.Logger.debug('HomeViewController viewDidLoad');

  // super call
  ViewController.prototype.viewDidLoad.call(this);
  
  // Menu Actions
  Mpin.Utility.addEvent('click', document.getElementById(this._goToInstallButtonId), this._goToInstallView.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._goToMobileButtonId), this._goToMobileView.bind(this));
};

/**
 * Called when the HTML view is about to appear on the screen.<br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
InitialViewController.prototype.viewWillAppear = function() {
  Mpin.Logger.debug('InitialViewController viewWillAppear');

  ViewController.prototype.viewWillAppear.call(this);

  // Set Menu
  var menus = document.getElementsByClassName('mpin-initial-menu');
  for (var i = 0; i < menus.length; i++) {
    var menu = menus[i];
    Mpin.Utility.addEvent('click', menu, this._menuDidSelected.bind(this));
  }

  // initial state
  var defaultMenu = Mpin.Core.sharedInstance().getDefaultMenu();
  if (defaultMenu.mobileMenuDefaultSet) {
    var target = document.getElementById(this._mobileMenuId);
    target.click();
    this._showMobileMenuView();

  } else {
    // no default account
    document.getElementById(this._installButtonId).click();
    this._showInstallMenuView();
  }

};

InitialViewController.prototype.reloadable = function() {
  return true;
};

InitialViewController.prototype.shouldKeep = function() {
  return false;
};

/**
 * Callback for the install button.<br>
 * Transition to the Add ID screen.<br>
 */
InitialViewController.prototype._goToInstallView = function() {
  var installVC = new InstallViewController(Mpin.ViewManager.views.install);
  this.viewControllerManager.push(installVC, true);
};

/**
 * Callback for the mobile login button.<br>
 * Transition to the Mobile Login screen.<br>
 */
InitialViewController.prototype._goToMobileView = function() {
  var mobileLoginVC = new MobileLoginViewController(Mpin.ViewManager.views.mobile_login);
  this.viewControllerManager.push(mobileLoginVC, true);
};

/**
 * Callback for menu-item selection<br>
 * When an ID is selected from the menu, show interface view for the menu.<br>
 */
InitialViewController.prototype._menuDidSelected = function() {
  var mouseEvent = arguments[0];
  var targetId = mouseEvent.target.id;
  var target = document.getElementById(targetId);
  if (!targetId || !target) {
    Mpin.Logger.error('target not found');
  }

  var selectionTarget = document.getElementById(this._menuTarget);
  selectionTarget.dataset.menu = target.dataset.menu; // install / mobile
  selectionTarget.innerHTML = target.innerHTML;

  switch (target.dataset.menu) {
    case 'install':
      Mpin.Logger.debug('install');
      this._showInstallMenuView();
      break;
    case 'mobile':
      this._showMobileMenuView();
      Mpin.Logger.debug('mobile');
      break;
    default:
      Mpin.Logger.error('Unknown case: ' + target.dataset.menu);
  }
};

/**
 * Show the Install interface view.<br>
 * Hide other menu views.<br>
 */
InitialViewController.prototype._showInstallMenuView = function() {
  Mpin.Logger.debug('show install menu view');

  var mobileViews = document.getElementsByClassName('mobile-menu-view');
  for (var i = 0; i < mobileViews.length; i++) {
    Mpin.Utility.hide(mobileViews[i]);
  }

  var installViews = document.getElementsByClassName('install-menu-view');
  for (i = 0; i < installViews.length; i++) {
    Mpin.Utility.show(installViews[i]);
  }

};

/**
 * Show the Mobile Login interface view.<br>
 * Hide other menu views.<br>
 */
InitialViewController.prototype._showMobileMenuView = function() {
  Mpin.Logger.debug('show mobile menu view');
  var installViews = document.getElementsByClassName('install-menu-view');
  for (var i = 0; i < installViews.length; i++) {
    Mpin.Utility.hide(installViews[i]);
  }

  var mobileViews = document.getElementsByClassName('mobile-menu-view');
  for (i = 0; i < mobileViews.length; i++) {
    Mpin.Utility.show(mobileViews[i]);
  }
};


