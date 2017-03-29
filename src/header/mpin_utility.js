var Mpin = Mpin || {};
Mpin.Utility = Mpin.Utility || {};


/* -------------- mpin UI utilities --------------- */
Mpin.Utility.show = function (target) {
  if (target) {
    target.classList.remove("mpin-hide");
    target.classList.remove("mpin-ready-show");
  } else {
    Mpin.Logger.error('target element is null');
  }
};
Mpin.Utility.readyShow = function (target) {
  if (target) {
    target.classList.remove("mpin-hide");
    target.classList.add("mpin-ready-show");
  } else {
    Mpin.Logger.error('target element is null');
  }
};
Mpin.Utility.hide = function (target) {
  if (target) {
    target.classList.remove("mpin-ready-show");
    target.classList.add("mpin-hide");
  } else {
    Mpin.Logger.error('target element is null');
  }
};
Mpin.Utility.addEvent = function (eventName, target, callback, useCapture) {
  useCapture = (typeof useCapture !== 'undefined' ? useCapture : false);
  if (target) {
    target.addEventListener(eventName, callback.bind(this), useCapture);
  } else {
    Mpin.Logger.warn("element is not found: ", target);
  }
};

Mpin.Utility.removeElement = function (target) {
  if (target) {
    target.parentNode.removeChild(target);
  } else {
    Mpin.Logger.error("element is not found: ", target);
  }
};

Mpin.Utility.runAnimation = function (animationDuration, startValue, endValue, callBack, finishCallBack) {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  var animationStartTime = 0;
  var currentValue = startValue;

  var startAnimation = function() {
    animationStartTime = Date.now();
    requestAnimationFrame.call(window, step);
  };

  var step = function() {
    if (endValue >= startValue && endValue <= currentValue) {
      finishCallBack && finishCallBack();
      return;
    }
    if (endValue <= startValue && endValue >= currentValue) {
      finishCallBack && finishCallBack();
      return;
    }
    var currentTime = Date.now();
    var positionInAnimation = (currentTime - animationStartTime) / animationDuration;
    positionInAnimation = Math.min(1, positionInAnimation);

    currentValue = startValue + (endValue - startValue) * positionInAnimation;
    callBack && callBack(currentValue);

    requestAnimationFrame.call(window, step);
  };
  startAnimation();
};

Mpin.Utility.createMutex = function() {
  var Mutex = {
    _lock: false,
    _pending: false,

    try: function() {
      if (this._lock === true) {
        this._pending = true;
        return false;
      } else {
        this._lock = true;
        return true;
      }
    },
    release: function() {
      this._lock = false;
    },
    getPending: function() {
      if (this._pending === true) {
        this._pending = false;
        return true;
      } else {
        return false;
      }
    }
  };

  return Mutex;
};

/* -------------- mpin core utilities --------------- */
Mpin.Utility.getDisplayName = function (uId) {
  if (!uId)
    return null;
  try {
    return JSON.parse(this.mp_fromHex(uId)).userID;
  } catch (err) {
    Mpin.Logger.error("failed to parse uId");
    return "unknown";
  }
};
Mpin.Utility.mp_fromHex = function (s) {
  if (!s || s.length % 2 !== 0)
    return '';
  s = s.toLowerCase();
  var digits = '0123456789abcdef';
  var result = '';
  for (var i = 0; i < s.length; ) {
    var a = digits.indexOf(s.charAt(i++));
    var b = digits.indexOf(s.charAt(i++));
    if (a < 0 || b < 0)
      return '';
    result += String.fromCharCode(a * 16 + b);
  }
  return result;
};
Mpin.Utility.zeroPaddingString = function(number, size) {
  if (size <= 0) return '';

  var isMinus = false;
  if (number < 0) {
    isMinus = true;
    number = -number;
  }

  var str = "";
  for (var i = 0; i < size; i++) {
    str += "0";
  }
  str += number;
  str = str.slice(-size);
  if (isMinus) {
    str = "-" + str;
  }
  return str;
};

/* -------------- String Extension ------------------*/
Mpin.Utility.extendStringObject = function () {
  if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.mpin_trim = function () {
      return String(this).replace(/^\s+|\s+$/g, '');
    };
  } else {
    String.prototype.mpin_trim = String.prototype.trim;
  }

  String.prototype.mpin_endsWith = function (substr) {
    return this.length >= substr.length && this.substr(this.length - substr.length) == substr;
  };

  String.prototype.mpin_startsWith = function (substr) {
    return this.indexOf(substr) === 0;
  };

  if (!String.prototype.mpin_format) {
    String.prototype.mpin_format = function () {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    };
  }

  String.prototype.mpin_stringWithPathComponent = function (str) {
    var res = this;
    if (this.slice(-1) === "/") {
      // do nothing
    } else {
      res += "/";
    }
    res += str;
    return res;
  };
  String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
  };
};
