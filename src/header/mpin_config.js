var Mpin = Mpin || {};

Mpin.Config = function() {
  // Default settings
  this.loginButtonId = 'mpinLoginButton';
  this.clientId = 'mpinClient';
  this.usernameId = 'username';
  this.passwordId = 'password';
  this.loginFormId = 'login-form';
  this.language = 'en'; // default en

  this.imageBaseURL = "@@IMAGE_BASE_URL";
  this.rpaBaseURL = "@@RPA_BASE_URL";

  this.authProtocols = ["1pass"];
  this.initialShowing = true;
  this.skipUserIdValidation = false;
  this.pinMaxLength = 10;
  this.pinMinLength = 4;
  this.activationCodeLength = 12;
};

// [WARNING] Static configs is NOT changable after build
//  * Static config is loaded before HTML contents load
//  * To load config from html tag dynamically, HTML contents must be loaded
Mpin.Config.Static = {
  logLevel: Mpin.LogLevel.Debug
};

Mpin.Config.sharedInstance = function() {
  if (!this._sharedInstance) {
    var config = new Mpin.Config();
    config.overwriteWithTagOption();
    this._sharedInstance = config;
  }
  return this._sharedInstance;
};

Mpin.Config.prototype.info = function() {
  Mpin.Logger.info('========== Mpin Config ==========');
  Mpin.Logger.info('initialShowing: ' + this.initialShowing);
  Mpin.Logger.info('skipUserIdValidation: ' + this.skipUserIdValidation);
  Mpin.Logger.info('pinMaxLength: ' + this.pinMaxLength);
  Mpin.Logger.info('pinMinLength: ' + this.pinMinLength);
  Mpin.Logger.info('language: ' + this.language);
  Mpin.Logger.info('rpaBaseURL: ' + this.rpaBaseURL);
  Mpin.Logger.info('imageBaseURL: ' + this.imageBaseURL);
  Mpin.Logger.info('loginFormId: ' + this.loginFormId);
  Mpin.Logger.info('usernameId: ' + this.usernameId);
  Mpin.Logger.info('passwordId: ' + this.passwordId);
  Mpin.Logger.info('=================================');
};

Mpin.Config.prototype.overwriteWithTagOption = function() {
  // Client settings (html data attr)
  var clientSettings = document.getElementById(this.clientId);
  if (!clientSettings) {
    Mpin.Logger.info(this.clientId + ' tag not found');
    Mpin.Logger.info('Client uses default settings');
    return;
  }

  if (clientSettings.dataset.mpinInitialShowing == 'on') {
    this.initialShowing = true;
  } else if (clientSettings.dataset.mpinInitialShowing == 'off') {
    this.initialShowing = false;
  }
  if (clientSettings.dataset.mpinSkipUserIdValidation == 'on') {
    this.skipUserIdValidation = true;
  } else if (clientSettings.dataset.mpinSkipUserIdValidation == 'off') {
    this.skipUserIdValidation = false;
  }
  if (clientSettings.dataset.mpinPinMaxLength) {
    this.pinMaxLength = parseInt(clientSettings.dataset.mpinPinMaxLength, 10);
  }
  if (clientSettings.dataset.mpinPinMinLength) {
    this.pinMinLength = parseInt(clientSettings.dataset.mpinPinMinLength, 10);
  }
  if (clientSettings.dataset.mpinLanguage) {
    this.language = clientSettings.dataset.mpinLanguage;
  }

  // Server URL
  if (clientSettings.dataset.mpinRpaBaseUrl) {
    this.rpaBaseURL = clientSettings.dataset.mpinRpaBaseUrl;
  }
  if (clientSettings.dataset.mpinImageBaseUrl) {
    this.imageBaseURL = clientSettings.dataset.mpinImageBaseUrl;
  }

  // ID set 
  if (clientSettings.dataset.mpinFormId) {
    this.loginFormId = clientSettings.dataset.mpinFormId;
  }
  if (clientSettings.dataset.mpinUsernameId) {
    this.usernameId = clientSettings.dataset.mpinUsernameId;
  }
  if (clientSettings.dataset.mpinPasswordId) {
    this.passwordId = clientSettings.dataset.mpinPasswordId;
  }
};
