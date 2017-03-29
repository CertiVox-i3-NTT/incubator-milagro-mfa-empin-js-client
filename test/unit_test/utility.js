var mpinId = '7b226d6f62696c65223a20302c2022697373756564223a2022323031352d31322d31352030393a35343a34302e313039303833222c2022757365724944223a20226d70696e2e636c69656e74406d70696e2e746573742e636f6d222c202273616c74223a20223936653332313733626134396466353561353866623566393366383437303462227d';
var token = '0414dfd78fe17259b68324f7ef589984b3f504abf038d0fede565ffd48d84d98630a88f2e1829574aaa1bce9315d4cd4a46dd2734779329d1ffd136571a416d35f';
var userId = 'mpin.client@mpin.test.com';
var pin = '1111';


module('Setup Storage empty', {
  setup: function () {
  },
  teardown: function () {
  }
});

QUnit.test("Get Display Name", function(assert) {
  assert.equal(Mpin.Utility.getDisplayName(mpinId), userId);
  assert.equal(Mpin.Utility.getDisplayName(), null);
  assert.equal(Mpin.Utility.getDisplayName(mpinId + '0'), 'unknown');
});

QUnit.test("Get Mpin Object from mpin_hex", function(assert) {
  var objectStr = Mpin.Utility.mp_fromHex(mpinId);
  var object = JSON.parse(objectStr);

console.log(object);
  assert.notEqual(object.mobile, undefined);
  assert.notEqual(object.issued, undefined);
  assert.notEqual(object.userID, undefined);
  assert.notEqual(object.salt, undefined);

  objectStr = Mpin.Utility.mp_fromHex(mpinId + '0');
  assert.equal(objectStr, '');

});

QUnit.test("Get Zero padding string", function(assert) {

  assert.equal(Mpin.Utility.zeroPaddingString(0, -2), '');
  assert.equal(Mpin.Utility.zeroPaddingString(9, -2), '');

  assert.equal(Mpin.Utility.zeroPaddingString(0, -1), '');
  assert.equal(Mpin.Utility.zeroPaddingString(9, -1), '');

  assert.equal(Mpin.Utility.zeroPaddingString(0, 0), '');
  assert.equal(Mpin.Utility.zeroPaddingString(9, 0), '');

  assert.equal(Mpin.Utility.zeroPaddingString(0, 1), '0');
  assert.equal(Mpin.Utility.zeroPaddingString(9, 1), '9');

  assert.equal(Mpin.Utility.zeroPaddingString(0, 2), '00');
  assert.equal(Mpin.Utility.zeroPaddingString(9, 2), '09');

  assert.equal(Mpin.Utility.zeroPaddingString(0, 3), '000');
  assert.equal(Mpin.Utility.zeroPaddingString(9, 3), '009');

  assert.equal(Mpin.Utility.zeroPaddingString(123, 3), '123');
  assert.equal(Mpin.Utility.zeroPaddingString(123, 4), '0123');
  assert.equal(Mpin.Utility.zeroPaddingString(123, 5), '00123');
});

QUnit.test("Get Zero padding string: minus number", function(assert) {

  assert.equal(Mpin.Utility.zeroPaddingString(-0, -2), '');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, -2), '');

  assert.equal(Mpin.Utility.zeroPaddingString(-0, -1), '');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, -1), '');

  assert.equal(Mpin.Utility.zeroPaddingString(-0, 0), '');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, 0), '');

  assert.equal(Mpin.Utility.zeroPaddingString(-0, 1), '0');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, 1), '-9');

  assert.equal(Mpin.Utility.zeroPaddingString(-0, 2), '00');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, 2), '-09');

  assert.equal(Mpin.Utility.zeroPaddingString(-0, 3), '000');
  assert.equal(Mpin.Utility.zeroPaddingString(-9, 3), '-009');

  assert.equal(Mpin.Utility.zeroPaddingString(-123, 3), '-123');
  assert.equal(Mpin.Utility.zeroPaddingString(-123, 4), '-0123');
  assert.equal(Mpin.Utility.zeroPaddingString(-123, 5), '-00123');
});


QUnit.test("Extend String Object", function(assert) {
  String.prototype.mpin_trim = undefined;
  String.prototype.mpin_endsWith = undefined;
  String.prototype.mpin_startsWith = undefined;
  String.prototype.mpin_format = undefined;

  assert.equal(String.prototype.mpin_trim, undefined);
  assert.equal(String.prototype.mpin_endsWith, undefined);
  assert.equal(String.prototype.mpin_startsWith, undefined);
  assert.equal(String.prototype.mpin_format, undefined);

  Mpin.Utility.extendStringObject();
  assert.notEqual(String.prototype.mpin_trim, undefined);
  assert.notEqual(String.prototype.mpin_endsWith, undefined);
  assert.notEqual(String.prototype.mpin_startsWith, undefined);
  assert.notEqual(String.prototype.mpin_format, undefined);

  // mpin_trim
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_trim(), 'abcdefghijklmnopqrstuvwxyz0123456789');
  assert.equal(' abcdefghijklmnopqrstuvwxyz0123456789'.mpin_trim(), 'abcdefghijklmnopqrstuvwxyz0123456789');
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789 '.mpin_trim(), 'abcdefghijklmnopqrstuvwxyz0123456789');

  // mpin_endsWith
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith(''), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('9'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('89'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('789'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('z0123456789'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('abcdefghijklmnopqrstuvwxyz0123456789'), true);

  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('8'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('z'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_endsWith('a'), false);

  // mpin_startsWith
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith(''), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('a'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('ab'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('abc'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('abcdefghijklmnopqrstuvwxyz0'), true);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('abcdefghijklmnopqrstuvwxyz0123456789'), true);

  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('b'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('0'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('9'), false);

  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('b'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('0'), false);
  assert.equal('abcdefghijklmnopqrstuvwxyz0123456789'.mpin_startsWith('9'), false);

  // mpin_format
  assert.equal('{0}000000000'.mpin_format(1), '1000000000');
  assert.equal('0{0}00000000'.mpin_format(1), '0100000000');
  assert.equal('00{0}0000000'.mpin_format(1), '0010000000');
  assert.equal('000000000{0}'.mpin_format(1), '0000000001');

  assert.equal('{0}000000000'.mpin_format(0), '0000000000');
  assert.equal('{0}000000000'.mpin_format(1), '1000000000');
  assert.equal('{0}000000000'.mpin_format(9), '9000000000');
  assert.equal('{0}000000000'.mpin_format('a'), 'a000000000');

  assert.equal('{0}{1}00000000'.mpin_format('a', 9), 'a900000000');
  assert.equal('{0}{1}00000000'.mpin_format('a', 19), 'a1900000000');
  assert.equal('{0}{1}00000000'.mpin_format('a', 129), 'a12900000000');

  assert.equal('{0}{1}03331111{2}0990aadfas0{3}'.mpin_format('a', 129, 'bbaa', '33ddgga'), 'a12903331111bbaa0990aadfas033ddgga');

  assert.equal('{0}{3}00000000'.mpin_format('a', 129), 'a{3}00000000');
  assert.equal('{0}{3}00000000'.mpin_format('a', 129, '', 99), 'a9900000000');
});
