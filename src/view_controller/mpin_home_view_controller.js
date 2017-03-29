/**
 * HomeViewController<br>
 * This method is a constructor of HomeViewController.<br>
 * Defines common constants shared in instance methods.<br>
 * Creates HTML from "viewTemplate" argument and language resources.<br>
 *
 * @constructor
 * @param {object} viewTemplate - "handlebarsjs" object for including html
 */
HomeViewController = function(viewTemplate) {
  this._initWithView(viewTemplate, Mpin.Resources.getResource());
  this._viewId = 'mpinHomeView';

  this._viewType = Mpin.ViewType.Default;

  this._menuTargetId = 'mpinHomeMenuTarget';
  this._mobileMenuId = 'mpinHomeMenuMobile';
  this._dropDownMenuId  = 'menuHomeDropDownMenu';
  this._loginErrorId = 'mpinHomeLoginError';
  this._renewMessageId = 'mpinHomeRenewMessage';
  this._loginPinCodeInputId = 'mpinHomeLoginPinCodeInput';
  this._loginPinCodeInputForErrorId = 'mpinHomeLoginPinCodePlaceHolder';

  this._goToMobileButtonId = 'mpinHomeGoToMobileButton';
  this._mpinLoginButtonId = 'mpinHomeLoginMpinLogin';

  this._goToInstallButtonId = 'mpinHomeGoToInstallViewButton';
  this._goToDeleteButtonId = 'mpinHomeGoToDeleteViewButton';

  this._deleteButtonId = 'mpinHomeDeleteButton';
  this._renewButtonId = 'mpinHomeRenewButton';

  this._selectedUserid = '';

  this._pinRecommendedLength = Mpin.Config.sharedInstance().pinMinLength;
  this._pinCodeInputId = 'mpinHomeLoginPinCodeInput';
  this._pinCodeLabelId = 'mpinHomePinCodeLabel';
  this._pinCodePlaceHolderId = 'mpinHomeLoginPinCodePlaceHolder';

  this._mode = '';
  this._ModeLoginView = 'ModeLoginView';
  this._ModeRenewView = 'ModeRenewView';
  this._ModeMobileLoginView = '_ModeMobileLoginView';
};
Mpin.inherits(HomeViewController, ViewController);

/**
 * Called after the HTML view is loaded to browser screen. <br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
HomeViewController.prototype.viewDidLoad = function() {
  Mpin.Logger.debug('HomeViewController viewDidLoad');

  // super call
  ViewController.prototype.viewDidLoad.call(this);

  // Menu
  Mpin.Utility.addEvent('click', document.getElementById(this._mobileMenuId), this._menuDidSelected.bind(this));
  
  // Menu Actions
  Mpin.Utility.addEvent('click', document.getElementById(this._mpinLoginButtonId), this._loginChallenge.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._goToMobileButtonId), this._goToMobileLoginView.bind(this));


  // footer menu
  Mpin.Utility.addEvent('click', document.getElementById(this._goToInstallButtonId), this._goToInstallView.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._goToDeleteButtonId), this._goToDeleteView.bind(this));

  Mpin.Utility.addEvent('click', document.getElementById(this._deleteButtonId), this._deleteUserId.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._renewButtonId), this._renewUserId.bind(this));

  this._selectionTarget = document.getElementById(this._menuTargetId);

  var self = this;
  Mpin.Utility.addEvent('keypress', document.getElementById(this._loginPinCodeInputId), function (e) {
    if (e.keyCode === 13) {
      Mpin.Logger.info("enter submit");
      document.getElementById(self._mpinLoginButtonId).click();
    }
  });
};

/**
 * Transition to the Add ID screen, and the Login session is cancelled.<br>
 * Called after pressing the Add ID button in the bottom menu.<br>
 */
HomeViewController.prototype._goToInstallView = function() {
  var installVC = new InstallViewController(Mpin.ViewManager.views.install);
  this.viewControllerManager.push(installVC, true);
};
/**
 * Transition to the Delete ID screen, and the Login session is cancelled.<br>
 * Called from the Delete ID button in bottom menu.<br>
 * If User ID is currently selected in the menu, the ID is passed to the Delete ID screen, where it is set as the default menu selection.<br>
 * If no ID was selected, no ID is passed to the Delete ID screen.<br>
 * 
 */
HomeViewController.prototype._goToDeleteView = function() {
  var deleteVC = new DeleteViewController(Mpin.ViewManager.views.delete);
  var userId = this._selectionTarget.dataset.userId;
  if (userId) {
    deleteVC._deleteUserId = userId;
    Mpin.Logger.warn('userId: ' + userId + ' passed');
  }
  this.viewControllerManager.push(deleteVC, true);
};

/**
 * This method confirms whether or not the current screen should be displayed.<br>
 * If no ID registered, the user is redirected to the initial screen.<br>
 * If registered ID exists, this view show as first screen.<br>
 */
HomeViewController.prototype.validate = function() {
  if (Mpin.Core.sharedInstance().userExist()) {
    return true;
  } else {
    // no account
    return false;
  }
};

/**
 * Called when the HTML view is about to appear on the screen.<br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
HomeViewController.prototype.viewWillAppear = function() {
  Mpin.Logger.debug('HomeViewController viewWillAppear');

  // super call
  ViewController.prototype.viewWillAppear.call(this);

  this._loadMenuLogins.call(this);

  // Initial state

  var defaultMenu = Mpin.Core.sharedInstance().getDefaultMenu();
  Mpin.Logger.info('defaultMenu: ', defaultMenu);
  if (defaultMenu.mobileMenuDefaultSet) {
    document.getElementById(this._mobileMenuId).click();
    this._showMobileLoginView();

  } else if (defaultMenu.defaultIdentity) {
    this._selectIdentity(defaultMenu.defaultIdentity);
    this._showLoginView();
  } else {
    // no default account
    this._showLoginView();
  }

};

HomeViewController.prototype.viewDidAppear = function() {
  Mpin.Logger.debug('HomeViewController viewDidAppear');

  // super call
  ViewController.prototype.viewDidAppear.call(this);
  if (this._mode == this._ModeLoginView) {
    this._focusPIN();
  }
};

HomeViewController.prototype._selectIdentity = function(identity) {
  var search = document.getElementsByClassName('mpin-home-menu-login');
  for (var i = 0; i < search.length; i++) {
    target = search[i].firstChild;
    if (target.dataset.menuLoginId == identity) {
      Mpin.Logger.debug('click menu: ' + identity);
      target.click();
      return;
    }
  }
};

HomeViewController.prototype._focusPIN = function() {
  document.getElementById(this._loginPinCodeInputId).focus();
};

/**
 * Load (Reload) only registred ID.<br>
 * Registered ID are grouped together and displayed as selections in a login menu.<br>
 * Reload this method after registered ID is deleted or created.<br>
 */
HomeViewController.prototype._loadMenuLogins = function() {

  // Reset accounts
  var deleteTarget = document.getElementsByClassName('mpin-home-menu-login');
  for (var i = deleteTarget.length - 1; i >= 0; i--) {
    Mpin.Utility.removeElement(deleteTarget[i]);
  }

  // get accunts
  var core = Mpin.Core.sharedInstance();
  var accounts = core.getAccounts();
  var index = 0;
  for (var userId in accounts) {
    var idMenu = this._createIdMenu(index, userId);
    document.getElementById(this._dropDownMenuId).insertAdjacentHTML('afterbegin', idMenu);
    index++;
  }

  // Set Menu
  var menuLogins = document.getElementsByClassName('mpin-home-menu-login');
  for (i = 0; i < menuLogins.length; i++) {
    var menuLogin = menuLogins[i].firstChild;
    Mpin.Utility.addEvent('click', menuLogin, this._menuDidSelected.bind(this));
  }
};

/**
 * Returns login menu HTML tag.<br>
 * Create HTML tag with parameters of index, userId.<br>
 *
 * @param {integer} index - index of login menu
 * @param {string} userId - MPIN User Id (Email) string
 * @return {string} HTML tag
 */
HomeViewController.prototype._createIdMenu = function(index, userId) {
  var aId = 'mpinHomeMenuLogin_' + index;
  var liClassString = 'secondary mpin-home-menu-login';
  var aClassString = 'mpin-menu mpin-home-menu';

  var tag = '';
  tag += '<li class="' + liClassString + '">';
  tag += '<a id="' + aId + '" class="' + aClassString + '" data-menu-category="login" data-menu-login-id="' + userId + '" href="javascript:void(0)">';
  tag += userId;
  tag += '</a>';
  tag += '</li>';
  return tag;
};

/**
 * Callback for selection for menu<br>
 * When the Login ID menu are selected, show login inteface for the selected ID.<br>
 * When the Mobile Login menu area selected, show mobile login interface.<br>
 */
HomeViewController.prototype._menuDidSelected = function() {
  var mouseEvent = arguments[0];

  var targetId = mouseEvent.target.id;
  var target = document.getElementById(targetId);
  if (!targetId || !target) {
    Mpin.Logger.error('target not found');
  }

  this._selectionTarget.dataset.userId = target.innerHTML;
  this._selectionTarget.innerHTML = target.innerHTML;


  // change view
  var category = target.dataset.menuCategory;
  if (category == 'login') {
    Mpin.Logger.debug('menu selected: login');
    var loginId = target.dataset.menuLoginId;
    this._showLoginView(loginId);

  } else if (category == 'mobile') {
    Mpin.Logger.debug('menu selected: mobile');
    this._showMobileLoginView();
  }
};

/**
 * Attempt to login via MPIN. This method is called after the user selects an ID and enters their PIN.<br>
 * Calculate secret key from ID and PIN, and retrieve authentication data from the MPIN Server.<br>
 * Try to login via MPIN via webapp API and LDAP-proxy.<br>
 * Upon login success, transitions to web app home screen.<br>
 * Upon login failure, shows error message.<br>
 * When failed to login three times in a row, show renewal ID interface and delete ID interface.<br>
 *
 * @throws {Mpin.Errors.wrongPin}
 * @throws {Mpin.Errors.maxAttemptsCountOver}
 * @throws {Mpin.Errors.missingUserId}
 * @throws {Mpin.Errors.missingAuthData}
 * @throws {Mpin.Errors.wrongIntegration}
 */
HomeViewController.prototype._loginChallenge = function() {
  var core = Mpin.Core.sharedInstance();
  var self = this;
  var pinCodeInput = document.getElementById(this._loginPinCodeInputId).value;
  var resource = Mpin.Resources.getResource();

  self.resetAllErrorMessage(false);


  var userId = this._selectionTarget.dataset.userId;
  if (!userId) {
    Mpin.Logger.error('UserId Not Found', Mpin.Errors.missingUserId);
    self.setErrorMessage(self._loginErrorId, resource.home_error_user_id_empty, true);
    return;
  }
  
  // Pin Code Validation
  var pinErrorMessage = '';
  var validateResults = core.validatePinCodeFormat(pinCodeInput);
  for (var i = 0; i < validateResults.length; i++) {
    var value = validateResults[i];
    if (value == Mpin.ValidatePinCodeFormatType.valid) {
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid) {
      pinErrorMessage = resource.home_error_pincode_not_alphanumeric;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.invalidPin);
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.emptyInvalid) {
      pinErrorMessage = resource.home_error_pincode_empty;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.missingPin);
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.shortInvalid) {
      // pinErrorMessage = resource.home_error_pincode_invalid; // don't check length
      continue;
    } else if (value == Mpin.ValidatePinCodeFormatType.longInvalid) {
      // pinErrorMessage = resource.home_error_pincode_invalid; // don't check length
      continue;
    } else {
      Mpin.Logger.error('Unknown case: ' + value);
    }
  }

  if (pinErrorMessage !== '') {
    self.setErrorMessage(self._loginErrorId, pinErrorMessage, true);
    self.setErrorInput(this._loginPinCodeInputForErrorId);
    return;
  }

  self.viewControllerManager.showLoadingView();
  self.viewControllerManager.updateContentSize(null, false);
  core.loginWithPin(pinCodeInput, function(error, data) {
    if (error) {
      if (error.code) {
        Mpin.Logger.error('Login Failed:', error);
      } else {
        if (error.status == 500) {
          Mpin.Logger.error('Login Failed:', Mpin.Errors.internalServerError);
        } else {
          Mpin.Logger.error('Login Failed:', Mpin.Errors.unknownError);
        }
      }
      switch (error.code) {
        case Mpin.Errors.wrongPin.code:
          self.setErrorMessage.call(self, self._loginErrorId, resource.home_error_pincode_invalid, true);
          self.setErrorInput(self._loginPinCodeInputForErrorId);
          break;

        case Mpin.Errors.maxAttemptsCountOver.code:
          var messageText = resource.home_error_delete_or_renew.mpin_format(self._selectedUserId);
          self.setErrorMessage.call(self, self._renewMessageId, messageText);
          self._showRenewView();
          break;

        case Mpin.Errors.missingUserId.code:
        case Mpin.Errors.missingAuthData.code:
        case Mpin.Errors.wrongIntegration.code:
          self.setErrorMessage.call(self, self._loginErrorId, resource.home_error_general_error, true);
          break;

        default:
          self.setErrorMessage.call(self, self._loginErrorId, resource.home_error_general_error, true);
          self.setErrorInput(self._loginPinCodeInputForErrorId);
      }

      self.viewControllerManager.hideLoadingView();
      return;
    }

    // success
    Mpin.Logger.info('Login Success');
    self.viewControllerManager.hideLoadingView();
    self.viewControllerManager.blockView(); // while user waiting screen change
  });
};


// Login View -----------------------------------------------------------
// Show login view
// userId can be nullable
/**
 * Show the MPIN Login interface view.<br>
 * Hide other menu views.<br>
 *
 * @param {string} userId - MPIN User Id (Email) string
 */
HomeViewController.prototype._showLoginView = function(userId) {
  this._mode = this._ModeLoginView;
  this._hideRenewView();
  this._hideMobileLoginView();

  var views = document.getElementsByClassName('login-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.show(views[i]);
  }

  if (userId) {
    this._selectedUserId = userId;
    Mpin.Core.sharedInstance().readyToLogin(userId);
  }
  document.getElementById(this._loginPinCodeInputId).value = '';
  this.setErrorMessage(this._loginErrorId, '', false);
  this.clearErrorInput(this._loginPinCodeInputId);

  this.viewControllerManager.updateContentSize(null);

  this._focusPIN();
};

/**
 * Hide the MPIN Login interface view.<br>
 * Called when other interface views show.<br>
 */
HomeViewController.prototype._hideLoginView = function() {
  var views = document.getElementsByClassName('login-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.hide(views[i]);
  }
  document.getElementById(this._loginPinCodeInputId).value = '';
  this.setErrorMessage(this._loginErrorId, '', false);
  this.clearErrorInput(this._loginPinCodeInputId);
};

// Renew View -----------------------------------------------------------
// Show renew view
/**
 * Show the Renewal or Delete ID interface view.<br>
 * Hide other menu views.<br>
 * Show this view when the user failed to login three times in a row.<br>
 */
HomeViewController.prototype._showRenewView = function(userId) {
  this._mode = this._ModeRenewView;
  this._hideLoginView();
  this._hideMobileLoginView();

  var views = document.getElementsByClassName('renew-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.show(views[i]);
  }

  this.viewControllerManager.updateContentSize(null);

};
/**
 * Hide the MPIN Login interface view.<br>
 * Called when other interface views show.<br>
 */
HomeViewController.prototype._hideRenewView = function() {
  var views = document.getElementsByClassName('renew-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.hide(views[i]);
  }
};
/**
 * Delete MPIN ID<br>
 * Called when user failed to login three times in a row and press the delete button.<br>
 * If no registered ID exist after delete, transition to the Initial screen.<br>
 */

HomeViewController.prototype._deleteUserId = function() {
  var resource = Mpin.Resources.getResource();

  Mpin.Logger.warn('renew user id');
  var userId = this._selectionTarget.dataset.userId;
  if (!userId) {
    Mpin.Logger.error('user id not found, delete failed');
    return;
  }

  var core = Mpin.Core.sharedInstance();
  core.deleteAccount(userId);
  if (core.userExist()) {
    this._selectionTarget.innerHTML = resource.home_select_menu_default_text;
    delete this._selectionTarget.dataset.userId;
    this._loadMenuLogins();

    var defaultMenu = Mpin.Core.sharedInstance().getDefaultMenu();
    Mpin.Logger.info('defaultMenu: ', defaultMenu);
    if (defaultMenu.defaultIdentity) {
      this._selectIdentity(defaultMenu.defaultIdentity);
      this._showLoginView();
    } else {
      // no default account
      this._showLoginView();
    }

  } else {
    var initialVC = new InitialViewController(Mpin.ViewManager.views.initial);
    this.viewControllerManager.back(initialVC);
  }
};

/**
 * Renew MPIN ID.<br>
 * Called when user fails to login three times in a row, and user presses the renew button.<br>
 * Transition to Install Screen and set renewed ID as input box default selection.<br>
 */
HomeViewController.prototype._renewUserId = function() {
  Mpin.Logger.warn('renew user id');
  var userId = this._selectionTarget.dataset.userId;
  if (!userId) {
    Mpin.Logger.error('user id not found');
    return;
  }

  var installVC = new InstallViewController(Mpin.ViewManager.views.install);
  installVC._installUserId = userId;
  this.viewControllerManager.push(installVC, true);
};


// Mobile View -----------------------------------------------------------

// Show mobile view
/**
 * Show the Mobile Login interface view.<br>
 * Hide other menu views.<br>
 */
HomeViewController.prototype._showMobileLoginView = function(userId) {
  this._mode = this._ModeMobileLoginView;
  this._hideLoginView();
  this._hideRenewView();

  var views = document.getElementsByClassName('mobile-login-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.show(views[i]);
  }

  this.viewControllerManager.updateContentSize(null);
};

/**
 * Hide the Mobile Login interface view.<br>
 * Called when other interface views show.<br>
 */

HomeViewController.prototype._hideMobileLoginView = function() {
  var views = document.getElementsByClassName('mobile-login-view');
  for (var i = 0; i < views.length; i++) {
    Mpin.Utility.hide(views[i]);
  }
};

/**
 * Transition to the Mobile Login screen.<br>
 * Called after pressing the button in Mobile Login interface view.<br>
 */
HomeViewController.prototype._goToMobileLoginView = function() {
  var mobileLoginVC = new MobileLoginViewController(Mpin.ViewManager.views.mobile_login);
  this.viewControllerManager.push(mobileLoginVC, true);
};

