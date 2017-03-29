var wait = 500;


// Input Data
var mpinId = '7b226d6f62696c65223a20302c2022697373756564223a2022323031352d31322d31352030393a35343a34302e313039303833222c2022757365724944223a20226d70696e2e636c69656e74406d70696e2e746573742e636f6d222c202273616c74223a20223936653332313733626134396466353561353866623566393366383437303462227d';
var token = '0414dfd78fe17259b68324f7ef589984b3f504abf038d0fede565ffd48d84d98630a88f2e1829574aaa1bce9315d4cd4a46dd2734779329d1ffd136571a416d35f';
var userId = 'mpin.client@mpin.test.com';
var pinStr = '1111';

module('Setup First time', {
  setup: function () {
    Mpin.Core.sharedInstance().deleteAllUser();
    Mpin.Core._sharedInstance = null; // init
  },
  teardown: function () {
    Mpin.Core.sharedInstance().deleteAllUser();
    Mpin.Core._sharedInstance = null; // init
  }
});

QUnit.test("Load config", function(assert) {
  var core = Mpin.Core.sharedInstance();
  assert.notEqual(core.config, null);
});

QUnit.test("Load config", function(assert) {
  var core = Mpin.Core.sharedInstance();
  var config = Mpin.Config.sharedInstance();
  assert.deepEqual(core.config, config);
});

QUnit.asyncTest("Server Connection: SetupWithUserId", function(assert) {
  var core = Mpin.Core.sharedInstance();

  assert.equal(core._userId, null);
  // wait request to client settings
  setTimeout(function() {
    core.setupWithUserId(userId, function() {
      start();
      assert.equal(core._userId, userId);
    }, function() {
      start();
    });
  }, wait);
});

QUnit.asyncTest("Server Connection: SetupWithUserId", function(assert) {
  var core = Mpin.Core.sharedInstance();

  assert.equal(core._userId, null, "Before setup start");
  assert.deepEqual(core.getAccounts(), {}, "Before setup start, accounts empty");
  // wait request to client settings
  setTimeout(function() {
    core.setupWithUserId(userId, function() {
      var actCode = core.getActivationCodeAdhoc();

      assert.equal(core._userId, userId, "Set up for userId");
      assert.notEqual(actCode, false, "Get adhoc activation code");

      core.activate(actCode, pinStr, function(error, data) {
        if (error) {
          assert.ok(false, 'Setup must be completed');
          start();
          return;
        }

        var accounts = core.getAccounts();
        var count = 0;

        assert.notEqual(accounts, {}, "Created one account");
        for (var key in accounts) {
          if (accounts.hasOwnProperty(key)) {
            count++;
          }
        }
        assert.equal(count, 1, "Created one account");

        var defaultMenu = core.getDefaultMenu();
        assert.deepEqual(defaultMenu, {
          defaultIdentity: userId,
          mobileMenuDefaultSet: false
        }, "Default User Updated");
        start();
      });
    }, function() {
      assert.ok(false, 'Setup must be completed');
      start();
    });
  }, wait);
});

QUnit.asyncTest("Server Connection: SetupWithUserId And Delete Account", function(assert) {
  var core = Mpin.Core.sharedInstance();

  assert.equal(core._userId, null, "Before setup start");
  assert.deepEqual(core.getAccounts(), {}, "Before setup start, accounts empty");
  // wait request to client settings
  setTimeout(function() {
    core.setupWithUserId(userId, function() {
      var actCode = core.getActivationCodeAdhoc();

      assert.equal(core._userId, userId, "Set up for userId");
      assert.notEqual(actCode, false, "Get adhoc activation code");

      core.activate(actCode, pinStr, function(error, data) {
        if (error) {
          assert.ok(false, 'Setup must be completed');
          start();
          return;
        }
        core.deleteAccount(userId);

        var accounts = core.getAccounts();
        var defaultMenu = core.getDefaultMenu();

        assert.deepEqual(accounts, {}, "Account Empty");
        assert.deepEqual(defaultMenu.defaultIdentity, "", "Default User Empty");

        start();
      });
    }, function() {
      assert.ok(false, 'Setup must be completed');
      start();
    });
  }, wait);
});

QUnit.asyncTest("Server Connection: Setup and Login", function(assert) {
  var core = Mpin.Core.sharedInstance();

  assert.equal(core._userId, null, "Before setup start");
  assert.deepEqual(core.getAccounts(), {}, "Before setup start, accounts empty");
  // wait request to client settings
  setTimeout(function() {
    core.setupWithUserId(userId, function() {
      var actCode = core.getActivationCodeAdhoc();

      assert.deepEqual(core._loginUser, {
        userId: null
      }, "Before login flow start");

      core.activate(actCode, pinStr, function(error, data) {
        if (error) {
          assert.ok(false, 'Setup must be completed');
          start();
          return;
        }
        core.readyToLogin(userId);
        assert.deepEqual(core._loginUser, {
          userId: userId
        }, "Ready for login");
        start();
      });
    }, function() {
      assert.ok(false, 'Setup must be completed');
      start();
    });
  }, wait);
});

// set user
QUnit.test("Set User", function(assert) {
  var core = Mpin.Core.sharedInstance();
  core._loginUser = null;
  core._setUser(userId);

  assert.notEqual(core._loginUser, null);
  assert.deepEqual(core._loginUser, {
    userId: userId
  });
});

QUnit.test("Validate Pin Code Format", function(assert) {
  var core = Mpin.Core.sharedInstance();

  // empty
  assert.deepEqual(core.validatePinCodeFormat(), [Mpin.ValidatePinCodeFormatType.emptyInvalid]);
  assert.deepEqual(core.validatePinCodeFormat(''), [Mpin.ValidatePinCodeFormatType.emptyInvalid]);

  // too short
  // data-mpin-pin-min-length="4"
  assert.deepEqual(core.validatePinCodeFormat('000'), [Mpin.ValidatePinCodeFormatType.shortInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('999'), [Mpin.ValidatePinCodeFormatType.shortInvalid]);
  assert.deepEqual(core.validatePinCodeFormat(999), [Mpin.ValidatePinCodeFormatType.shortInvalid]);

  // too long
  // data-mpin-pin-max-length="8"
  assert.deepEqual(core.validatePinCodeFormat('000000000'), [Mpin.ValidatePinCodeFormatType.longInvalid]);
  assert.deepEqual(core.validatePinCodeFormat(999999999), [Mpin.ValidatePinCodeFormatType.longInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('999999999'), [Mpin.ValidatePinCodeFormatType.longInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('00000000a'), [Mpin.ValidatePinCodeFormatType.longInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('a00000000'), [Mpin.ValidatePinCodeFormatType.longInvalid]);

  // not asciis
  assert.deepEqual(core.validatePinCodeFormat('漢字漢字'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('あわをん'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('カタカナ'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('ﾊﾝｶｸ'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('✊✊✊✊'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat('!#$%?_'), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat("'()[]@"), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);
  assert.deepEqual(core.validatePinCodeFormat("a  a"), [Mpin.ValidatePinCodeFormatType.notAlphanumericInvalid]);


  // valid
  assert.deepEqual(core.validatePinCodeFormat('0000'), [Mpin.ValidatePinCodeFormatType.valid]);
  assert.deepEqual(core.validatePinCodeFormat('9999'), [Mpin.ValidatePinCodeFormatType.valid]);
  assert.deepEqual(core.validatePinCodeFormat(9999), [Mpin.ValidatePinCodeFormatType.valid]);
  assert.deepEqual(core.validatePinCodeFormat('abyzABYZ'), [Mpin.ValidatePinCodeFormatType.valid]);
  assert.deepEqual(core.validatePinCodeFormat('12347890'), [Mpin.ValidatePinCodeFormatType.valid]);
});
