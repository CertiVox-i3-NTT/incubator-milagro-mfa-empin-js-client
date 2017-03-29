window.addEventListener( 'load', function() {
  "use strict";

  Mpin.Utility.extendStringObject();

  Mpin.Logger.measure("Start MPIN Client", "no user");
  var viewControllerManager = new ViewControllerManager();
  var core = Mpin.Core.sharedInstance();
  var config = Mpin.Config.sharedInstance();

  var showClient = function() {
    if (core.userExist()) {
      // account exist
      var homeVC = new HomeViewController(Mpin.ViewManager.views.home);
      viewControllerManager.push(homeVC, false, true);
      viewControllerManager.show();
      viewControllerManager.updateContentSize(null, false);

    } else {
      // noaccount
      var initialVC = new InitialViewController(Mpin.ViewManager.views.initial);
      viewControllerManager.push(initialVC, false, true);
      viewControllerManager.show();
      viewControllerManager.updateContentSize(null, false);
    }
  };

  // Mpin Login Button Action
  var button = document.getElementById(config.loginButtonId);
  if (button) {
    Mpin.Utility.addEvent('click', button, showClient);
  }

  if (config.initialShowing) {
    showClient();
  }

  window.addEventListener( 'storage' , function(event) {
    if (Mpin.Storage.sharedInstance().shouldRefreshWithEvent(event)) {
      Mpin.Logger.debug('storage changed');
      viewControllerManager.refresh();
    }
  });
});