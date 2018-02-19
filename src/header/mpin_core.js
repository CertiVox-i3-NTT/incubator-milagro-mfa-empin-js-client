var Mpin = Mpin || {};

// Constructor
Mpin.Core = function() {
  this._userId = null; // for setup
  this._loginUser = {
    userId: null
  }; // for login

  this.config = Mpin.Config.sharedInstance();
  this.config.info();

  this._mpin = new mpinjs({
    server: this.config.rpaBaseURL,
    authProtocols: this.config.authProtocols
  });
  this._mpin.init(function (err, data) {
    if (err) {
      Mpin.Logger.error("Wrong setup : ", err);
    }
  });

  this._storage = Mpin.Storage.sharedInstance();
  this._mutex = Mpin.Utility.createMutex();
};

// Return singleton
Mpin.Core.sharedInstance = function() {
  if (!this._sharedInstance) {
    this._sharedInstance = new Mpin.Core();
  }
  return this._sharedInstance;
};

Mpin.Core.prototype.reload = function() {
  Mpin.Logger.debug('core reload');
  if (this._mutex.try()) {
    this._mpin.restore();
    this._mpin.recover();
    this._storage.reload();

    this._mutex.release();
    if (this._mutex.getPending()) {
      this.reload();
    }
  }
};

Mpin.Core.prototype.checkServerConnection = function() {
  if (this._mpin.ready === undefined) {
    return false;
  } else {
    return true;
  }
};

// Setup
Mpin.Core.prototype.setupWithUserId = function(userId, callBack) {
  var self = this;

  if (userId) {
    self._mpin.makeNewUser(userId);
    self._storage.notify();
    self._mpin.startRegistration(userId, function (err, data) {
      self._storage.notify();
      if (err) {
        callBack(err, data);
        return;
      }
      self._userId = userId;
      callBack(null, data);
    }, true);
  } else {
    callBack(Mpin.Errors.missingUserId, null);
  }
};

Mpin.Core.prototype.getActivationCodeAdhoc = function() {
  return this._mpin.getActivationCodeAdhoc(this._userId);
};

Mpin.Core.prototype.activate = function(activationCodeStr, pin, callBack) {
  var self = this;
  if (!pin) {
    callBack(Mpin.Errors.missingPin, null);
    return;
  }

  activationCode = parseInt(activationCodeStr, 10);
  Mpin.Logger.info('Activation Code Input: ', activationCode);
  if (!activationCode) {
    callBack(Mpin.Errors.missingActivationCode, null);
    return;
  }

  self._mpin.confirmRegistration(self._userId, function (err, data) {
    if (err) {
      callBack(err, data);
      return;
    }

    self._mpin.activationCodeVerify(self._userId, activationCode, function(err, data) {
      if (err) {
        callBack(err, data);
        return;
      }
      Mpin.Logger.info('Activation Verify Success');
 
      var finish = self._mpin.finishRegistration(self._userId, pin, activationCode);
      self._storage.notify();
      if (finish !== true) {
        callBack(finish, null);
      } else {
        self._storage.setDefaultIdentity(self._userId);
        callBack(null, null);
      }
    });
  });
};


// Login
Mpin.Core.prototype.readyToLogin = function(userId) {
  this._setUser(userId);
};

Mpin.Core.prototype._setUser = function(userId) {
  // Reset Login Info
  this._loginUser = {
    userId: userId
  };
};

Mpin.Core.prototype.loginWithPin = function(pinCodeInput, callBack) {
  var self = this;
  var user = self._loginUser;
  if (!user) {
    callBack(Mpin.Errors.missingUserId , null);
    return;
  }

  self._mpin.startAuthentication(user.userId, function (err, data) {
    if (err) {
      callBack(err, data);
      return;
    }

    self._mpin.finishAuthentication(user.userId, pinCodeInput, function (authError, authData) {
      if (authError) {
        callBack(authError, authData);
        return;
      }

      Mpin.Logger.info('auth response:', authData);
      if (!user.userId) {
        callBack(Mpin.Errors.missingUserId, authData);
      } else if (!authData.authOTT) {
        callBack(Mpin.Errors.missingAuthData, authData);
      } else {
        self._storage.setDefaultIdentity(user.userId);
        self._loginChallengeToWebApp(user.userId, authData, callBack);
      }
    });
  });
};

// Mobile Login
Mpin.Core.prototype.getAccessNumber = function(callBack) {
  this._mpin.getAccessNumber(function(error, data) {
    if (error) {
      callBack(error, data);
      return;
    }
    Mpin.Logger.info('Get accessNumber info: ', data);
    var accessNumber = data.accessNumber;
    callBack(null, {accessNumber: accessNumber});
  });
};

Mpin.Core.prototype.updateStatus = function (statusData) {
  var statusText;

  switch (statusData.status) {
    case "wid":
      statusText = "<span>Code scanned.<br/>Waiting for authentication...</span>";
      break;
    case "user":
      statusText = "<span>Authenticating user:<br/>" + statusData.userId + "</span>";
      break;
    case "expired":
      statusText = "<span>Authentication expired!</span>";
      break;
  }
};

Mpin.Core.prototype.waitForMobileAuth = function(timeoutSeconds, requestSeconds, callBack) {
  if (!timeoutSeconds) {
    callBack(true, null);
    return;
  } else if (!requestSeconds) {
    callBack(true, null);
    return;
  }

  var self = this;
  self._mpin.waitForMobileAuth(timeoutSeconds, requestSeconds, function(authError, responseData) {
    if (authError) {
      callBack(authError, authData);
      return;
    }

    var authData = responseData.mpinResponse;
    Mpin.Logger.info('auth response', authData);
    if (!authData.userId) {
      callBack(Mpin.Errors.missingUserId, authData);
    } else if (!authData.authOTT) {
      callBack(Mpin.Errors.missingAuthData, authData);
    } else {
      self._storage.setMobileMenuDefault();
      self._loginChallengeToWebApp(authData.userId, authData, callBack);
    }
  }, function (responseData) {
    return self.updateStatus(responseData);
  });
};

Mpin.Core.prototype.cancelMobileAuth = function() {
  this._mpin.cancelMobileAuth();
};

Mpin.Core.prototype._loginChallengeToWebApp = function(userId, authData, callBack) {
  Mpin.Logger.info('Login to web app...');
  if (!userId) {
    return callBack(Mpin.Errors.missingUserId, null);
  } else if (!authData || !authData.authOTT) {
    return callBack(Mpin.Errors.missingAuthData, null);
  }


  var userNameInput = this.config.usernameId && document.getElementById(this.config.usernameId);
  var passwordInput = this.config.passwordId && document.getElementById(this.config.passwordId);
  var loginForm = this.config.loginFormId && document.getElementById(this.config.loginFormId);
  if (userNameInput && passwordInput && loginForm) {
    callBack(null, {userId: userId, authData: authData});

    var pass = "{MPIN}" + authData.authOTT;
    userNameInput.value = userId;
    passwordInput.value = pass;
    loginForm.submit();
  } else {
    callBack(Mpin.Errors.wrongIntegration, null);
  }
};

// Validation
Mpin.Core.prototype.validateUserIdFormat = function(userId) {
  // empty
  if (!userId || userId === '') return Mpin.ValidateUserIdFormatType.emptyInvalid;

  // not email
  var emailExp = this._mpin.settings.verifyIdentityRegex;
  if (!emailExp || emailExp === '') emailExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!userId.match(emailExp)) {
    return Mpin.ValidateUserIdFormatType.notEmailInvalid;
  }

  return Mpin.ValidateUserIdFormatType.valid;
};

// Validation
Mpin.Core.prototype.validatePinCodeFormat = function(pinCode) {
  var result = [];
  // empty
  if (!pinCode || pinCode === '') {
    result.push(Mpin.ValidatePinCodeFormatType.emptyInvalid);
    return result;
  }

  pinCode = pinCode.toString();

  // too short
  if (pinCode.length < this.config.pinMinLength) {
    result.push(Mpin.ValidatePinCodeFormatType.shortInvalid);
  }

  // too long
  if (pinCode.length > this.config.pinMaxLength) {
    result.push(Mpin.ValidatePinCodeFormatType.longInvalid);
  }

  // not digit
  // var digitExp = /^[0-9]{4}$/;

  // not ascii
  // var asciiExp = /^[\x20-\x7E]+$/;

  // not alpha numeric
  var alphaNumericExp = /^[a-zA-Z0-9]+$/;
  if (!pinCode.match(alphaNumericExp)) {
    result.push(Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid);
  }

  if (result.length > 0) {
    // error
    return result;
  } else {
    result.push(Mpin.ValidatePinCodeFormatType.valid);
    return result;
  }
};

// Input: "001234417654"
Mpin.Core.prototype.validateActivationCodeFormat = function(actCodeInput) {
  // empty
  if (!actCodeInput || actCodeInput === '') return Mpin.ValidateActivationCodeFormatType.emptyInvalid;

  // not 12 digits
  if (actCodeInput.length != this.config.activationCodeLength) return Mpin.ValidateActivationCodeFormatType.not12DigitsInvalid;

  // not half number
  var halfNumberExp = /^[0-9]+$/;
  if (!actCodeInput.match(halfNumberExp)) return Mpin.ValidateActivationCodeFormatType.not12DigitsInvalid;

  // cannot parse as integer
  activationCode = parseInt(actCodeInput, 10);
  if (!activationCode) return Mpin.ValidateActivationCodeFormatType.not12DigitsInvalid;

  return Mpin.ValidateActivationCodeFormatType.valid;
};

// Storage Management
Mpin.Core.prototype.getAccounts = function() {
  // get registerd id list
  var mpinUsers = this._mpin.listUsers(), htmlList;
  var result = {};
  for (var i = 0; i < mpinUsers.length; i++) {
    var mpinUser = mpinUsers[i];
    if (mpinUser.state === Mpin.States.register) {
      result[mpinUser.userId] = mpinUser;
    }
  }

  Mpin.Logger.info('All mpinUsers: ', mpinUsers);
  Mpin.Logger.info('Registered mpinUsers: ', result);

  return result;
};

Mpin.Core.prototype.userExist = function() {
  var accounts = this.getAccounts();
  if (Object.keys(accounts).length > 0) return true;
  else return false;
};

Mpin.Core.prototype.deleteAllUser = function() {
  var mpinUsers = this._mpin.listUsers();
  for (var i = 0; i < mpinUsers.length; i++) {
    var mpinUser = mpinUsers[i];
    this._mpin.deleteUser(mpinUser.userId);
  }
  this._storage.resetDefaultIdentity();
  this._storage.notify();
};

Mpin.Core.prototype.deleteAccount = function(userId) {
  Mpin.Logger.debug('deleteAccount: ' + userId);
  this._mpin.deleteUser(userId);

  var defaultMenu = this._storage.getDefaultMenu();
  if (userId == defaultMenu.defaultIdentity) {
    this._storage.resetDefaultIdentity();
  }
  this._storage.notify();
};

Mpin.Core.prototype.getDefaultMenu = function() {
  // Get defualt User
  return this._storage.getDefaultMenu();
};
