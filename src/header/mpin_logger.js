Mpin.Logger = {

  // usage: Mpin.Logger.measure("[operation]get auth", "[userId] mpinuser")
  measure: (function() {
    var serverName = 'Client';
    var threadId = 'xxxxx'; // javascript single thread
    var date = new Date();
    var log = '';

    var dateLog = Mpin.Utility.zeroPaddingString(date.getFullYear(), 4);
    dateLog += '/' + Mpin.Utility.zeroPaddingString(date.getMonth()+1, 2);
    dateLog += '/' + Mpin.Utility.zeroPaddingString(date.getDate(), 2);
    log += dateLog;

    var timeLog = date.getHours();
    timeLog += ':' + Mpin.Utility.zeroPaddingString(date.getMinutes(), 2);
    timeLog += ':' + Mpin.Utility.zeroPaddingString(date.getSeconds(), 2);
    timeLog += ':' + Mpin.Utility.zeroPaddingString(date.getMilliseconds(), 3);
    log += ',' + timeLog;

    log += ', %s, %s';

    log += ',' + serverName;
    log += ',' + threadId;
    log += ',' + 'requestServer';
    log += ',' +  'INFO'; // error
    log += ',' + 'start'; // end

    if (Mpin.Config.Static.logLevel >= Mpin.LogLevel.Info) {
      return console.info.bind(console, log);
    } else {
      return function() {};
    }
  })(),

  // usage: Mpin.Logger.debug("Server response: ", object)
  debug: (function() {
    if (Mpin.Config.Static.logLevel >= Mpin.LogLevel.Debug) {
      return console.log.bind(console);
    } else {
      return function() {};
    }
  })(),

  info: (function() {
    if (Mpin.Config.Static.logLevel >= Mpin.LogLevel.Info) {
      return console.info.bind(console);
    } else {
      return function() {};
    }
  })(),

  warn: (function() {
    if (Mpin.Config.Static.logLevel >= Mpin.LogLevel.Warn) {
      return console.warn.bind(console);
    } else {
      return function() {};
    }
  })(),

  error: (function() {
    if (Mpin.Config.Static.logLevel >= Mpin.LogLevel.Error) {
      return console.error.bind(console);
    } else {
      return function() {};
    }
  })()
};
