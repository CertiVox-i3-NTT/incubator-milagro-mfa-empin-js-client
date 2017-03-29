var Mpin = Mpin || {};

Mpin.Storage = function() {
  this._localStorageKey = 'mpinClient';
  this._version = '1.0.1'; // version format must be x.x.x (ex 2.3.3)
  this._storageNotificationKey = 'mpinClientNotification';
  this._identifier = (new Date()).getTime();
  this._notificationCounter = 0;

  this.loadStorage();
};

// Return singleton
Mpin.Storage.sharedInstance = function() {
  if (!this._instance) {
    this._instance = new Mpin.Storage();
  }

  return this._instance;
};

Mpin.Storage.prototype.shouldRefreshWithEvent = function(event) {
  if (event.key == this._storageNotificationKey) {
    try {
      var notification = JSON.parse(event.newValue);
      if (notification.identifier != this._identifier) {
        return true;
      }
    } catch (e) {
      Mpin.Logger.error(e);
    }
  }
  return false;
};

Mpin.Storage.prototype._getDefaultStorage = function() {
  return JSON.stringify({
    defaultIdentity: "",
    version: this._version,
    mobileMenuDefaultSet: false
  });
};

Mpin.Storage.prototype._migrationStorage = function(beforeStorageJSON) {
  var beforeStorage;
  try {
    beforeStorage = JSON.parse(beforeStorageJSON);
  } catch (e) {
    Mpin.Logger.error(e);
    beforeStorage = JSON.parse(this._getDefaultStorage());
  }
  var beforeVersionNum = this._getVersionInteger(beforeStorage.version);
  var afterStorage = beforeStorage;

  // version check and migration
  if (beforeVersionNum < 101) {
    afterStorage.version = '1.0.1';
    afterStorage.mobileMenuDefaultSet = false;
  }
  return JSON.stringify(afterStorage);
};

Mpin.Storage.prototype._getVersionInteger = function(versionString) {
  var num = parseInt(versionString.split('.').join(''), 10);
  if (isNaN(num)) {
    Mpin.Logger.error('Failed to parse version string');
    return 0;
  }
  return num;
};

Mpin.Storage.prototype.reload = function() {
  this.loadStorage();
};

Mpin.Storage.prototype.loadStorage = function() {

  if (!this._check()) {
    return false;
  }

  if (typeof (localStorage[this._localStorageKey]) === "undefined") {
    Mpin.Logger.debug('Storage not found, create new storage');
    this._setItem(this._localStorageKey, this._getDefaultStorage());
  } else {
    Mpin.Logger.debug('Storage found');
    var beforeStorage = this._getItem(this._localStorageKey);
    this._setItem(this._localStorageKey, this._migrationStorage(beforeStorage));
  }

  try{
    this._mpin = JSON.parse(this._getItem(this._localStorageKey));
  } catch (e) {
    Mpin.Logger.error(e);
    this._setItem(this._localStorageKey, this._getDefaultStorage());
    this._mpin = JSON.parse(this._getItem(this._localStorageKey));
  }
  return true;
};

Mpin.Storage.prototype.dropStorage = function() {
  this._clear();
  this.loadStorage();
};
Mpin.Storage.prototype.getDefaultMenu = function () {
  return {
    defaultIdentity: this._mpin.defaultIdentity,
    mobileMenuDefaultSet: this._mpin.mobileMenuDefaultSet
  };
};
Mpin.Storage.prototype.setDefaultIdentity = function (uId) {
  this._mpin.mobileMenuDefaultSet = false;
  this._mpin.defaultIdentity = uId;
  this.save();
};
Mpin.Storage.prototype.setMobileMenuDefault = function () {
  this._mpin.mobileMenuDefaultSet = true;
  this.save();
};
Mpin.Storage.prototype.resetDefaultIdentity = function () {
  this._mpin.defaultIdentity = "";
  this.save();
};
Mpin.Storage.prototype.save = function () {
  this._setItem(this._localStorageKey, JSON.stringify(this._mpin));
};
Mpin.Storage.prototype.notify = function() {
  var notification = JSON.stringify({
    identifier: this._identifier,
    version: this._version,
    counter: ++this._notificationCounter
  });
  window.localStorage.setItem(this._storageNotificationKey, notification);
};

// browser local storage operation
Mpin.Storage.prototype._check = function() {
  if (window.localStorage) {
    return true;
  } else {
    Mpin.Logger.error("localStorage is not usable.");
    return false;
  }
};
Mpin.Storage.prototype._setItem = function(key, val) {
  if (this._getItem(key) != val) {
    window.localStorage.setItem(key, val);
    this.notify();
  }
  return true;
};
Mpin.Storage.prototype._getItem = function(key) {
  if (this._check()) {
    return window.localStorage.getItem(key);
  } else {
    return false;
  }
};
Mpin.Storage.prototype._removeItem = function(key) {
  if (this._check()) {
    window.localStorage.removeItem(key);
    this.notify();
  }
};
Mpin.Storage.prototype._clear = function() {
  if (this._check()) {
    window.localStorage.clear();
    this.notify();
  }
};
