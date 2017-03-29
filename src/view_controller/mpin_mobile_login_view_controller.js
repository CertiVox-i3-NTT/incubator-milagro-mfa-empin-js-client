 /**
 * MobileLoginViewController<br>
 * This method is a constructor of MobileLoginViewController.<br>
 * Defines common constants shared in instance methods.<br>
 * Creates HTML from "viewTemplate" argument and language resources.<br>
 *
 * @constructor
 * @param {object} viewTemplate - "handlebarsjs" object for including html
 */
MobileLoginViewController = function(viewTemplate) {
  this._initWithView(viewTemplate, Mpin.Resources.getResource());
  this._viewId = 'mpinMobileLoginView';

  this._viewType = Mpin.ViewType.MobileLogin;

  this._errorMessageId = 'mpinMobileLoginErrorMessage';

  // this value is same as value in tag
  this._canvasSize = 200; // 200 * 200
  this._circleWidth = 20;
  this._circleMagnifyValue = 0.5; // default 0.5

  // timer
  this._timer = null; // setTimeInterval object
  this._timerActiveColor = "rgba(67, 183, 60, 1)";
  this._timerPassiveColor = "rgba(191, 234, 188, 1)";
  this._timerBgColor = "rgba(255, 255, 255, 1)";


  this._timeCircleId = 'mpinMobileLoginTimeCircle';
  this._timeNumberId = 'mpinMobileLoginTimeNumber';
  this._accessNumberId = 'mpinMobileLoginAccessNumber';
  this._timeoutSeconds = 60;
  this._requestSeconds = 2;
};
Mpin.inherits(MobileLoginViewController, ViewController);

/**
 * Called after the HTML view is loaded to browser screen. <br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
MobileLoginViewController.prototype.viewDidLoad = function() {
  Mpin.Logger.debug('HomeViewController viewDidLoad');

  // super call
  ViewController.prototype.viewDidLoad.call(this);

  Mpin.Core.sharedInstance().cancelMobileAuth(); // Reset
  this._mobileLoginStart();
};

/**
 * Called when the HTML view is about to appear on the screen.<br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
MobileLoginViewController.prototype.viewWillAppear = function() {
  Mpin.Logger.debug('MobileLoginViewController viewWillAppear');
  ViewController.prototype.viewWillAppear.call(this);

  // init timer
  this._renderTimer(0, this._timeoutSeconds);
  var timeNumber = document.getElementById(this._timeNumberId);

  if (timeNumber) {
    timeNumber.innerHTML = this._timeoutSeconds;
  } else {
    Mpin.Logger.error('time number object not found');
  }

  var core = Mpin.Core.sharedInstance();
  if (!core.checkServerConnection()) {
    this._showErrorView();
  }
};

/**
 * Called when the HTML view is about to be removed.<br>
 * This method are called in mpin_view_controller_manager.js<br>
 */
MobileLoginViewController.prototype.viewWillRemoved = function() {
  Mpin.Logger.debug('MobileLoginViewController viewWillRemoved');
  ViewController.prototype.viewWillRemoved.call(this);

  // clear timer
  Mpin.Core.sharedInstance().cancelMobileAuth();
  this._stopTimer();
};

/**
 * Called after the HTML view is made visible.<br>
 * This method are called in mpin_view_controller_manager.js<br>
 */
MobileLoginViewController.prototype.viewDidAppear = function() {
  Mpin.Logger.debug('MobileLoginViewController viewDidAppear');
  ViewController.prototype.viewDidAppear.call(this);

  var core = Mpin.Core.sharedInstance();
  if (core.checkServerConnection()) {
    this._startTimer(function() {
      Mpin.Logger.warn('finish');
    });
  }
};

MobileLoginViewController.prototype.reloadable = function() {
  return false;
};

/**
 * Start the Mobile Login session.<br>
 * Get access number from MPIN Server and start expiration timer.<br>
 * Establish a connection to MPIN Server, and keep the connection.<br>
 * If the user input contains the correct access number and PIN on Mobile app, MPIN server give authentication data to client.<br>
 * Using authentication data, try to login with MPIN to MPIN Server via webapp API and LDAP-proxy. <br>
 * <br>
 * If session expired, get new access number and restart session.<br>
 */
MobileLoginViewController.prototype._mobileLoginStart = function() {
  var self = this;
  var core = Mpin.Core.sharedInstance();
  core.getAccessNumber(function(error, data) {
    if (error) {
      Mpin.Logger.error('Get Access Number Failed:', error);
      return;
    }

    if (data.accessNumber) {
      document.getElementById(self._accessNumberId).innerHTML = data.accessNumber;
      core.waitForMobileAuth(self._timeoutSeconds, self._requestSeconds, function(error, data) {
        if (error) {
          // expired or error
          Mpin.Logger.error('Mobile Login Failed', error);
          core.cancelMobileAuth(); // Reset

          switch (error.code) {
            case Mpin.Errors.timeoutFinish.code:
              // reload access number
              self._restartTimer();
              self._mobileLoginStart();
              break;

            case Mpin.Errors.missingUserId.code:
            case Mpin.Errors.missingAuthData.code:
            case Mpin.Errors.wrongIntegration.code:
              core.cancelMobileAuth();
              self._stopTimer();
              self._showErrorView();
              break;

            default:
              // other errors
              self._restartTimer();
              self._mobileLoginStart();
          }
        } else {
          // success
          Mpin.Logger.info('Login Success');
          Mpin.Logger.info(data);
          self._stopTimer();
        }
      });
    } else {
      Mpin.Logger.error('Mobile Login Failed', Mpin.Errors.missingAccessNumber);
      self._stopTimer();
      self._showErrorView();
    }
  });
};

/**
 * Show an error screen if mobile login failed.<br>
 */
MobileLoginViewController.prototype._showErrorView = function() {
  var hideViews = document.getElementsByClassName('login-view');
  for (var i = 0; i < hideViews.length; i++) {
    Mpin.Utility.hide(hideViews[i]);
  }
  var showViews = document.getElementsByClassName('error-view');
  for (i = 0; i < showViews.length; i++) {
    Mpin.Utility.show(showViews[i]);
  }

  var resource = Mpin.Resources.getResource();
  this.setErrorMessage(this._errorMessageId, resource.mobile_login_general_error, true);
};

/**
 * Start timer for a session expiration.<br>
 */
MobileLoginViewController.prototype._startTimer = function(callBack) {
  var self = this;
  var timeNumber = document.getElementById(self._timeNumberId);
  if (!timeNumber) {
    Mpin.Logger.error('time number object not found');
  }
  var currentTime = 0; // second
  var maxTime = self._timeoutSeconds; // second

  self._renderTimer(currentTime, maxTime);
  timeNumber.innerHTML = maxTime - currentTime;
  self._timer = setInterval(function() {
    Mpin.Logger.debug(' in setInterval');

    // update time view
    currentTime++;
    timeNumber.innerHTML = maxTime - currentTime;
    self._renderTimer(currentTime, maxTime);

    if (currentTime >= maxTime) {
      self._stopTimer();
      callBack();
      return;
    }
  }, 1000);
};

/**
 * Stop timer<br>
 */
MobileLoginViewController.prototype._stopTimer = function() {
  clearInterval(this._timer);
};

/**
 * Restart timer<br>
 */
MobileLoginViewController.prototype._restartTimer = function() {
  this._stopTimer();
  this._startTimer(function() {
  });
};

/**
 * Called in _startTimer method.<br>
 * Render a timer view.<br>
 * 
 * @param {integer} currentTime - Elapsed time starting from 0 sec
 * @param {integer} maxTime - Max second (MPIN Login session expiration time)
 */
MobileLoginViewController.prototype._renderTimer = function(currentTime, maxTime) {
  var ctx2 = document.getElementById(this._timeCircleId).getContext("2d");
  var centerX = this._canvasSize * this._circleMagnifyValue;
  var centerY = this._canvasSize * this._circleMagnifyValue;
  var radius = this._canvasSize * this._circleMagnifyValue;
  var diff = -Math.PI / 2; // start from 0:00
  var start, end;

  // active
  start = diff + 0;
  end = start + Math.PI * 2;
  radius = this._canvasSize * this._circleMagnifyValue;
  this._drawCircle(ctx2, centerX, centerY, radius, end, start, this._timerActiveColor);

  // passive
  start = diff + 0;
  end = start + (Math.PI * 2) * currentTime / maxTime;
  radius = this._canvasSize * this._circleMagnifyValue;
  this._drawCircle(ctx2, centerX, centerY, radius, end, start, this._timerPassiveColor);

  // bg
  start = diff + 0;
  end = diff + Math.PI * 2;
  radius = (this._canvasSize - this._circleWidth) * this._circleMagnifyValue;
  this._drawCircle(ctx2, centerX, centerY, radius, end, start, this._timerBgColor);

};

/**
 * Called in _renderTimer<br>
 * Draw a Fan-shaped view.<br>
 * 
 * @param {integer} context - Elapsed time starting from 0 sec
 * @param {integer} centerX - Center X coordinate of fan
 * @param {integer} centerY - Center Y coordinate of fan
 * @param {integer} radius - Radius of drawing fan
 * @param {integer} end - End engle for drawing fan
 * @param {integer} start - Start angle for drawing fan
 * @param {integer} color - View color
 */
MobileLoginViewController.prototype._drawCircle = function(context, centerX, centerY, radius, end, start, color) {
  context.beginPath();
  context.arc(centerX, centerY, radius, end, start, true);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineTo(centerX, centerY);
  context.closePath();
  context.stroke();
  context.fill();
};

