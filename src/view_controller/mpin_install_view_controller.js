/**
 * InstallViewController<br>
 * This method is a constructor of InstallViewController.<br>
 * Defines common constants shared in instance methods.<br>
 * Creates HTML from "viewTemplate" argument and language resources.<br>
 *
 * @constructor
 * @param {object} viewTemplate - "handlebarsjs" object for including html
 */
InstallViewController = function(viewTemplate) {
  this._initWithView(viewTemplate, Mpin.Resources.getResource());
  this._viewId = 'mpinInstallView';

  this._viewType = Mpin.ViewType.Default;

  this._getActivationCodeButtonId = 'mpinInstallGetActivationCode';
  this._activationButtonId = 'mpinInstallActivateButton';

  this._infoId = 'mpinInstallInfo';
  this._infoTextId = 'mpinInstallInfoText';

  this._userIdInputId = 'mpinInstallUserIdInput';
  this._pinCodeInputId = 'mpinInstallPinCodeInput';
  this._pinCodeInputForErrorId = 'mpinInstallPinCodePlaceHolder';
  this._userIdFixedId = 'mpinInstallUserIdFixed';


  this._activationCodeInputErrorId = 'mpinInstallActivationCodeInputError';
  this._userIdInputErrorId = 'mpinInstallUserIdInputError';
  this._pinCodeInputErrorId = 'mpinInstallPinCodeInputError';

  this._activationCodeInputId = 'mpinInstallActivationCodeInput';
  var core = Mpin.Core.sharedInstance();
  this._activationCodeMaxLength = Mpin.Config.sharedInstance().activationCodeLength + 2; // activation 12 + '-' * 2

  this._installUserId = '';
  this._pinRecommendedLength = Mpin.Config.sharedInstance().pinMinLength;
  this._pinCodePlaceHolderId = 'mpinInstallPinCodePlaceHolder';
  this._pinCodeLabelId = 'mpinInstallPinCodeLabel';
};
Mpin.inherits(InstallViewController, ViewController);

/**
 * Called after the HTML view is loaded to browser screen. <br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
InstallViewController.prototype.viewDidLoad = function() {
  // set event listner
  Mpin.Logger.debug('InstallViewController viewDidLoad');

  // super call
  ViewController.prototype.viewDidLoad.call(this);

  Mpin.Utility.addEvent('click', document.getElementById(this._getActivationCodeButtonId), this.setupWithUserId.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._activationButtonId), this.registerPIN.bind(this));

  this._installUserIdInput = document.getElementById(this._userIdInputId);

  if (this.viewControllerManager.deviceType == Mpin.DeviceType.PC) {
    Mpin.Utility.addEvent('keyup', document.getElementById(this._activationCodeInputId), this._assistActivationCodeInput.bind(this));
    Mpin.Utility.addEvent('keydown', document.getElementById(this._activationCodeInputId), this._assistActivationCodeInput.bind(this));
  } else {
    // SP
  }

  Mpin.Utility.addEvent('change', document.getElementById(this._activationCodeInputId), this._assistActivationCodeInput.bind(this));
  document.getElementById(this._activationCodeInputId).maxLength = this._activationCodeMaxLength;
};

InstallViewController.prototype.reloadable = function() {
  return false;
};

/**
 * This method formats the user’s input to the correct activation-code format — 'xxxx-xxxx-xxxx’ — as they type <br>
 * (PC) Called while the user inputs activation code, and after the user finished input.<br>
 * (SP) Called after the user finished input.<br>
 */
InstallViewController.prototype._assistActivationCodeInput = function() {
  var actCodeInput = document.getElementById(this._activationCodeInputId);

  if (!actCodeInput) {
    Mpin.Logger.error('Input object not found');
    return;
  }

  var mouseEvent = arguments[0];
  var targetId = mouseEvent.target.id;
  var target = document.getElementById(targetId);
  if (!targetId || !target) {
    Mpin.Logger.error('target not found');
  }

  var str = this._getActivationCode(actCodeInput.value);
  str = this._getActivationCodeDisplay(str);
  actCodeInput.value = str;
};

/**
 * Get the real activation code string from the value such as 'xxxx-xxxx-xxxx'.<br>
 * 
 * @param {string} activationCodeInput - input box value
 * @return {string} real activation code string 'xxxxxxxxxxxx'
 *
 * @example
 * Input: "1234-5678-9012"
 * Output: "123456789012"
 */
InstallViewController.prototype._getActivationCode = function(activationCodeInput) {
  if (!activationCodeInput) {
    Mpin.Logger.debug('Activation Code Input not found');
    return '';
  }

  // remove space
  activationCodeInput = activationCodeInput.trim();

  return activationCodeInput.split('-').join('');
};

/**
 * Get hyphen-formatted value for the activation code.<br>
 * 
 * @param {string} activationCode real activation code string 'xxxxxxxxxxxx'
 * @return {string} Activation Code string formatted as 'xxxxxxxxxxxx'
 *
 * @example
 * Input: "123456789012"
 * Output: "1234-5678-9012"
 */
InstallViewController.prototype._getActivationCodeDisplay = function(activationCode) {
  if (!activationCode) {
    Mpin.Logger.debug('Activation Code not found');
    return '';
  }

  var str = activationCode + ""; // format number -> string
  if (str.length >= 9) {
    str = str.substring(0, 4) + '-' + str.substring(4, 8) + '-' + str.substring(8, 12);
  } else if (str.length >= 5) {
    str = str.substring(0, 4) + '-' + str.substring(4, 8);
  }
  return str;
};

/**
 * Called when the HTML view is about to appear on the screen.<br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
InstallViewController.prototype.viewWillAppear = function() {
  Mpin.Logger.debug('InstallViewController viewWillAppear');

  // super call
  ViewController.prototype.viewWillAppear.call(this);

  var secondViews = document.getElementsByClassName('mpin-second-view');
  for (var i = 0; i < secondViews.length; i++) {
    Mpin.Utility.hide(secondViews[i]);
  }

  this.resetAllErrorMessage();

  // initial Set id
  if (this._installUserId !== '') {
    Mpin.Logger.info(this._installUserId);
  }
  if (this._installUserId) {
    this._installUserIdInput.value = this._installUserId;
    Mpin.Logger.warn(this._installUserIdInput.value);
  }
};

InstallViewController.prototype.viewDidAppear = function() {
  Mpin.Logger.debug('InstallViewController viewDidAppear');

  // super call
  ViewController.prototype.viewDidAppear.call(this);
  document.getElementById(this._userIdInputId).focus();
};


/**
 * Callback for the setup button.<br>
 * Start MPIN ID registration for the User ID.<br>
 * Get MPIN ID for the User ID and send the activation code via email.<br>
 * If RPA server has 'forceActive = True', get the activation code directly via HTTP.<br>
 *
 * @throws {Mpin.Errors.invalidUserId}
 * @throws {Mpin.Errors.missingUserId}
 * @throws {Mpin.Errors.internalServerError}
 * @throws {Mpin.Errors.unknownError}
 */
InstallViewController.prototype.setupWithUserId = function() {
  var self = this;
  var core = Mpin.Core.sharedInstance();
  var resource = Mpin.Resources.getResource();
  var userIdInput = document.getElementById(this._userIdInputId).value;

  self.resetAllErrorMessage();
  self.viewControllerManager.blockView();

  // User Id Validation
  switch (core.validateUserIdFormat(userIdInput)) {
    case Mpin.ValidateUserIdFormatType.valid:
      break;
    case Mpin.ValidateUserIdFormatType.notEmailInvalid:
      if (!Mpin.Config.sharedInstance().skipUserIdValidation) {
        self.setErrorMessage(self._userIdInputErrorId, resource.install_error_userid_invalid, true);
        self.setErrorInput(self._userIdInputId);
        self.viewControllerManager.releaseView();
        Mpin.Logger.error('Invalid UserId: ', Mpin.Errors.invalidUserId);
        return;
      }
      break;
    case Mpin.ValidateUserIdFormatType.emptyInvalid:
      self.setErrorMessage(self._userIdInputErrorId, resource.install_error_userid_empty, true);
      self.setErrorInput(self._userIdInputId);
      self.viewControllerManager.releaseView();
      Mpin.Logger.error('UserId Not found: ', Mpin.Errors.missingUserId);
      return;
    default:
      Mpin.Logger.error('Unknown case: ' + core.validateUserIdFormat(userIdInput));
  }

  core.setupWithUserId(userIdInput, function(error, data) {
    if (error) {
      if (error.code) {
        Mpin.Logger.error('Setup Failed', error);
      } else {
        if (error.status == 500) {
          Mpin.Logger.error('Setup Failed:', Mpin.Errors.internalServerError);
        } else {
          Mpin.Logger.error('Setup Failed:', Mpin.Errors.unknownError);
        }
      }

      if (error.code == Mpin.Errors.invalidUserId.code) {
        // setup failed
        self.setErrorMessage(self._userIdInputErrorId, resource.install_error_userid_invalid, true);
        self.setErrorInput(self._userIdInputId);
      } else {
        // other errors
        self.setErrorMessage(self._userIdInputErrorId, resource.install_error_general_error, true);
        self.setErrorInput(self._userIdInputId);
      }
      self.viewControllerManager.releaseView();
      return;
    }

    // success callback
    self.activationDidSent.call(self, userIdInput);
    self.viewControllerManager.releaseView();
  });

};

/**
 * Called after succeeded to start registration.<br>
 * Show the interface for input the Activation Code and PIN code<br>
 * If RPA server has 'forceActive = True', show the Activation Code on the screen.<br>
 *
 * @param {string} userIdInput - User Id(Email)
 */
InstallViewController.prototype.activationDidSent = function(userIdInput) {
  var core = Mpin.Core.sharedInstance();
  var resource = Mpin.Resources.getResource();

  this.resetAllErrorMessage();

  var messageText = resource.install_send_activation_code_text;
  this.setInfoMessage(messageText);

  var activationCodeAdhoc = core.getActivationCodeAdhoc();
  var activationCodeAdhocDisplay;
  if (activationCodeAdhoc) {
    Mpin.Logger.info('Activation Code Received: ', activationCodeAdhoc);
    activationCodeAdhoc = Mpin.Utility.zeroPaddingString(activationCodeAdhoc, 12);
    activationCodeAdhocDisplay = this._getActivationCodeDisplay(activationCodeAdhoc);
  }

  if (activationCodeAdhocDisplay) {
    messageText = resource.install_activation_code_debug_text.mpin_format('<span id="mpinDebugActivationCodeValue">' + activationCodeAdhocDisplay + '</span>');
    this.addInfoMessage(messageText);
    document.getElementById(this._activationCodeInputId).value = activationCodeAdhocDisplay;
  }

  document.getElementById(this._userIdFixedId).innerHTML = userIdInput;


  var firstViews = document.getElementsByClassName('mpin-first-view');
  for (var i = 0; i < firstViews.length; i++) {
    Mpin.Utility.hide(firstViews[i]);
  }
  var secondViews = document.getElementsByClassName('mpin-second-view');
  for (i = 0; i < secondViews.length; i++) {
    Mpin.Utility.readyShow(secondViews[i]);
  }
  this.viewControllerManager.updateContentSize(function() {
    for (var i = 0; i < secondViews.length; i++) {
      Mpin.Utility.show(secondViews[i]);
    }
  });
  
};

/**
 * Callback for activation button<br>
 * Calculate the private key from the Activation Code, and ask for MPIN server if private key is correct.<br>
 * If private key is correct, divide private key to PIN and Token and save Token in browser local storage.<br>
 *
 * @throws {Mpin.Errors.invalidActivationCode}
 * @throws {Mpin.Errors.missingActivationCode}
 * @throws {Mpin.Errors.invalidPin}
 * @throws {Mpin.Errors.missingPin}
 * @throws {Mpin.Errors.internalServerError}
 * @throws {Mpin.Errors.unknownError}
 */
InstallViewController.prototype.registerPIN = function() {
  var actCodeInputDisplay = document.getElementById(this._activationCodeInputId).value;
  var actCodeInput = this._getActivationCode(actCodeInputDisplay);
  var pinCodeInput = document.getElementById(this._pinCodeInputId).value;
  var core = Mpin.Core.sharedInstance();
  var self = this;
  var resource = Mpin.Resources.getResource();

  self.viewControllerManager.showLoadingView();
  self.resetAllErrorMessage();

  // Validation
  var validationFailed = false;

  // Activation Code Validation
  switch (core.validateActivationCodeFormat(actCodeInput)) {
    case Mpin.ValidateActivationCodeFormatType.valid:
      break;
    case Mpin.ValidateActivationCodeFormatType.not12DigitsInvalid:
      self.setErrorMessage(self._activationCodeInputErrorId, resource.install_error_activation_code_format_invalid);
      self.setErrorInput(self._activationCodeInputId);
      validationFailed = true;
      Mpin.Logger.error('Activation Code Invalid', Mpin.Errors.invalidActivationCode);
     break;
    case Mpin.ValidateActivationCodeFormatType.emptyInvalid:
      self.setErrorMessage(self._activationCodeInputErrorId, resource.install_error_activation_code_empty);
      self.setErrorInput(self._activationCodeInputId);
      validationFailed = true;
      Mpin.Logger.error('Activation Code Invalid', Mpin.Errors.missingActivationCode);
      break;
    default:
      Mpin.Logger.error('Unknown case: ' + core.validateActivationCodeFormat(actCodeInput));
  }

  // Pin Code Validation
  var pinErrorMessage = '';
  var validateResults = core.validatePinCodeFormat(pinCodeInput);
  for (var i = 0; i < validateResults.length; i++) {
    var value = validateResults[i];
    if (value == Mpin.ValidatePinCodeFormatType.valid) {
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid) {
      pinErrorMessage = resource.install_error_pincode_not_alphanumeric;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.invalidPin);
      validationFailed = true;
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.emptyInvalid) {
      pinErrorMessage = resource.install_error_pincode_empty;
      validationFailed = true;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.missingPin);
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.shortInvalid) {
      pinErrorMessage = resource.install_error_pincode_too_short.mpin_format(Mpin.Config.sharedInstance().pinMinLength);
      validationFailed = true;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.invalidPin);
      break;
    } else if (value == Mpin.ValidatePinCodeFormatType.longInvalid) {
      pinErrorMessage = resource.install_error_pincode_too_long.mpin_format(Mpin.Config.sharedInstance().pinMaxLength);
      validationFailed = true;
      Mpin.Logger.error('Pin Code Invalid', Mpin.Errors.invalidPin);
      break;
    } else {
      Mpin.Logger.error('Unknown case: ' + value);
    }
  }

  if (pinErrorMessage !== '') {
    self.setErrorMessage(self._pinCodeInputErrorId, pinErrorMessage);
    self.setErrorInput(self._pinCodeInputForErrorId);
  }

  self.viewControllerManager.updateContentSize(null);
  if (validationFailed) {
    self.viewControllerManager.hideLoadingView();
    return;
  }

  core.activate(actCodeInput, pinCodeInput, function(error, data) {
    if (error) {
      if (error.code) {
        Mpin.Logger.error('Registration Failed', error);
      } else {
        if (error.status == 500) {
          Mpin.Logger.error('Registration Failed:', Mpin.Errors.internalServerError);
        } else {
          Mpin.Logger.error('Registration Failed:', Mpin.Errors.unknownError);
        }
      }

      if (error.code == Mpin.Errors.invalidActivationCode.code) {
        self.setErrorMessage(self._activationCodeInputErrorId, resource.install_error_activation_code_invalid, true);
        self.setErrorInput(self._activationCodeInputId);
      } else if (error.code == Mpin.Errors.missingActivationCode.code) {
        self.setErrorMessage(self._activationCodeInputErrorId, resource.install_error_activation_code_format_invalid, true);
        self.setErrorInput(self._activationCodeInputId);
      } else if (error.code == Mpin.Errors.timeoutFinish.code) {
        self.setErrorMessage(self._pinCodeInputErrorId, resource.install_error_timeout_finish, true);
      } else if (error.code == Mpin.Errors.maxAttemptsCountOver.code) {
        self.setErrorMessage(self._activationCodeInputErrorId, resource.install_error_activation_code_max_attempts_count_over, true);
        self.setErrorInput(self._activationCodeInputId);
      } else {
        // other error
        self.setErrorMessage(self._pinCodeInputErrorId, resource.install_error_general_error, true);
      }
      self.viewControllerManager.hideLoadingView();
      return;
    }

    // success
    Mpin.Logger.info('Registration Finish');
    var homeVC = new HomeViewController(Mpin.ViewManager.views.home);
    self.viewControllerManager.hideLoadingView();
    self.viewControllerManager.back(homeVC, true);

  });
};

