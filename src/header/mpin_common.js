var Mpin = Mpin || {};

Mpin.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
};

Mpin.LogLevel = {
  Debug: 4,
  Info: 3,
  Warn: 2,
  Error: 1,
  None: 0
};

Mpin.DeviceType = {
  PC: "PC",
  SP: "SP"
};

Mpin.States = {
  invalid: "INVALID",
  start: "STARTED",
  active: "ACTIVATED",
  register: "REGISTERED",
  block: "BLOCKED"
};

Mpin.Errors = {
  // same as mpinjs(headless mpin)
  missingUserId: {code: 0, type: "MISSING_USERID"},
  invalidUserId: {code: 1, type: "INVALID_USERID"},
  missingParams: {code: 2, type: "MISSING_PARAMETERS"},
  identityNotVerified: {code: 3, type: "IDENTITY_NOT_VERIFIED"},
  identityMissing: {code: 4, type: "IDENTITY_MISSING"},
  wrongPin: {code: 5, type: "WRONG_PIN"},
  wrongFlow: {code: 6, type: "WRONG_FLOW"},
  userRevoked: {code: 7, type: "USER_REVOKED"},
  timeoutFinish: {code: 8, type: "TIMEOUT_FINISH"},
  requestExpired: {code: 9, type: "REQUEST_EXPIRED"},
  identityNotAuthorized: {code: 10, type: "IDENTITY_NOT_AUTHORIZED"},
  incorrectAccessNumber: {code: 11, type: "INCORRECT_ACCESS_NUMBER"},

  missingActivationCode: {code: 12, type: "MISSING_ACTIVATION_CODE"},
  invalidActivationCode: {code: 13, type: "INVALID_ACTIVATION_CODE"},
  maxAttemptsCountOver: {code: 14, type: "MAX_ATTEMPTS_COUNT_OVER"},


  // this client's original
  missingPin: {code: 1000, type: "MISSING_PIN"},
  missingAuthData: {code: 1001, type: "MISSING_AUTH_DATA"},
  wrongIntegration: {code: 1002, type: "WRONG_INTEGRATION"},
  invalidPin: {code: 1003, type: "INVALID_PIN"},
  missingAccessNumber: {code: 1004, type: "MISSING_ACCESS_NUMBER"},
  internalServerError: {code: 1005, type: "INTERNAL_SERVER_ERROR"},
  unknownError: {code: 2000, type: "UNKNOWN_ERROR"}
};

Mpin.ValidateUserIdFormatType = {
  valid: 'Mpin.Utility.validateUserIdFormatType.valid',
  notEmailInvalid: 'Mpin.Utility.validateUserIdFormatType.notEmailInvalid',
  emptyInvalid: 'Mpin.Utility.validateUserIdFormatType.emptyInvalid'
};

Mpin.ValidatePinCodeFormatType = {
  valid: 'Mpin.Utility.validatePinCodeFormatType.valid',
  notDigitInvalid: 'Mpin.Utility.validatePinCodeFormatType.notDigitInvalid',
  notAsciiInvalid: 'Mpin.Utility.validatePinCodeFormatType.notAsciiInvalid',
  notAlphanumericInvalid: 'Mpin.Utility.validatePinCodeFormatType.notAlphaNumericInvalid',
  emptyInvalid: 'Mpin.Utility.validatePinCodeFormatType.emptyInvalid',
  shortInvalid: 'Mpin.Utility.validatePinCodeFormatType.shortInvalid',
  longInvalid: 'Mpin.Utility.validatePinCodeFormatType.longInvalid'
};

Mpin.ValidateActivationCodeFormatType = {
  valid: 'Mpin.Utility.validateActivationCodeFormatType.valid',
  not12DigitsInvalid: 'Mpin.Utility.validateActivationCodeFormatType.not12DigitsInvalid',
  emptyInvalid: 'Mpin.Utility.validateActivationCodeFormatType.emptyInvalid'
};
