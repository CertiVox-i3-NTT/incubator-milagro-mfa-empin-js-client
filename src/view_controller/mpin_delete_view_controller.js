 /**
 * DeleteViewController<br>
 * This method is a constructor of DeleteViewController.<br>
 * Defines common constants shared in instance methods.<br>
 * Creates HTML from "viewTemplate" argument and language resources.<br>
 *
 * @constructor
 * @param {object} viewTemplate - "handlebarsjs" object for including html
 */
DeleteViewController = function(viewTemplate) {
  this._initWithView(viewTemplate, Mpin.Resources.getResource());
  this._viewId = 'mpinDeleteView';

  this._viewType = Mpin.ViewType.Default;

  this._userIdErrorId = 'mpinDeleteUserIdError';
  this._userIdConfirmMessageId = 'mpinDeleteUserIdConfirmMessage';
  this._deleteButtonId = 'mpinDeleteDeleteButton';
  this._confirmButtonId = 'mpinDeleteConfirmButton';
  this._cancelButtonId = 'mpinDeleteCancelButton';

  this._deleteMenuTargetId = 'mpinDeleteMenuTarget';
  this._deleteUserIdFixedId = 'mpinDeleteUserIdFixed';
  this._deleteDropDownMenuId = 'menuDeleteDropDownMenu';

  this._deleteUserId = '';
};
Mpin.inherits(DeleteViewController, ViewController);


/**
 * Called after the HTML view is loaded to browser screen. <br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
DeleteViewController.prototype.viewDidLoad = function() {
  Mpin.Logger.debug('DeleteViewController viewDidLoad');

  // super call
  ViewController.prototype.viewDidLoad.call(this);


  Mpin.Utility.addEvent('click', document.getElementById(this._deleteButtonId), this._userIdSelected.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._confirmButtonId), this._confirm.bind(this));
  Mpin.Utility.addEvent('click', document.getElementById(this._cancelButtonId), this._cancel.bind(this));

  var secondViews = document.getElementsByClassName('mpin-second-view');
  for (var i = 0; i < secondViews.length; i++) {
    Mpin.Utility.hide(secondViews[i]);
  }
};

/**
 * This method confirms whether or not the current screen should be displayed.<br>
 * If no ID registered, the user is redirected to the initial screen.<br>
 */
DeleteViewController.prototype.validate = function() {
  if (Mpin.Core.sharedInstance().userExist()) {
    Mpin.Logger.warn('DeleteViewController validate true');
    return true;
  } else {
    // no account which can be deleted
    Mpin.Logger.warn('DeleteViewController validate false');
    return false;
  }
};

/**
 * Called when the HTML view is about to appear on the screen.<br>
 * This method is called in mpin_view_controller_manager.js<br>
 */
DeleteViewController.prototype.viewWillAppear = function() {
  // super call
  ViewController.prototype.viewWillAppear.call(this);

  this._loadMenuLogins.call(this);

  // Initial state

  if (this._deleteUserId) {
    // Login
    var search = document.getElementsByClassName('mpin-delete-menu');
    for (var i = 0; i < search.length; i++) {
      var target = search[i].firstChild;
      if (target.dataset.menuDeleteId == this._deleteUserId) {
        target.click();
        break;
      }
    }
  } else {
    // no account
  }

};

/**
 * Callback for delete button.<br>
 * Sets the ID as "deleteable" and shows confirmation alert.<br>
 */
DeleteViewController.prototype._userIdSelected = function() {
  var resource = Mpin.Resources.getResource();

  this.resetAllErrorMessage(false);

  var selectionTarget = document.getElementById(this._deleteMenuTargetId);
  this._deleteUserId = selectionTarget.dataset.userId;
  if (!this._deleteUserId) {
    Mpin.Logger.error('UserId Not Found', Mpin.Errors.missingUserId);
    this.setErrorMessage(this._userIdErrorId, resource.delete_error_userid_empty, true);
    return;
  }


  var deleteUserFixed = document.getElementById(this._deleteUserIdFixedId);
  deleteUserFixed.innerHTML = this._deleteUserId;

  this.setErrorMessage(this._userIdConfirmMessageId, resource.delete_message.mpin_format(this._deleteUserId), false);

  var firstViews = document.getElementsByClassName('mpin-first-view');
  for (var i = 0; i < firstViews.length; i++) {
    Mpin.Utility.hide(firstViews[i]);
  }

  var secondViews = document.getElementsByClassName('mpin-second-view');
  for (i = 0; i < secondViews.length; i++) {
    Mpin.Utility.readyShow(secondViews[i]);
  }

  this.viewControllerManager.updateContentSize(function() {
    for (i = 0; i < secondViews.length; i++) {
    Mpin.Utility.show(secondViews[i]);
    }
  });
};

/**
 * Loads registred ID, which is deleteable.<br>
 */
DeleteViewController.prototype._loadMenuLogins = function() {

  // Reset accounts
  var deleteTarget = document.getElementsByClassName('mpin-delete-menu');
  for (var i = deleteTarget.length - 1; i >= 0; i--) {
    Mpin.Utility.removeElement(deleteTarget[i]);
  }

  // get accunts
  var core = Mpin.Core.sharedInstance();
  var accounts = core.getAccounts();
  var index = 0;
  for (var userId in accounts) {
    var idMenu = this._createIdMenu(index, userId);
    document.getElementById(this._deleteDropDownMenuId).insertAdjacentHTML('afterbegin', idMenu);
    index++;
  }

  // Set Menu
  var menuLogins = document.getElementsByClassName('mpin-delete-menu');
  for (i = 0; i < menuLogins.length; i++) {
    var menuLogin = menuLogins[i].firstChild;
    Mpin.Utility.addEvent('click', menuLogin, this._menuDidSelected.bind(this));
  }
};

/**
 * Returns one ID menu as an HTML tag.<br>
 * The HTML tag is created from the parameters "index" and "userId."<br>
 *
 * @param {integer} index - index of login menu
 * @param {string} userId - MPIN User Id (Email) string
 * @return {string} HTML tag
 */
DeleteViewController.prototype._createIdMenu = function(index, userId) {
  var aId = 'mpinDeleteMenu_' + index;
  var liClassString = 'secondary mpin-delete-menu';
  var aClassString = 'mpin-menu';

  var tag = '';
  tag += '<li class="' + liClassString + '">';
  tag += '<a id="' + aId + '" class="' + aClassString + '" data-menu-delete-id="' + userId + '" href="javascript:void(0)">';
  tag += userId;
  tag += '</a>';
  tag += '</li>';
  return tag;
};

/**
 * Callback triggered on menu selection.<br>
 * Upon selection, ID is set "deleteable" state.<br>
 */
DeleteViewController.prototype._menuDidSelected = function() {
  var mouseEvent = arguments[0];

  var targetId = mouseEvent.target.id;
  var target = document.getElementById(targetId);
  if (!targetId || !target) {
    Mpin.Logger.error('target not found');
  }

  var selectionTarget = document.getElementById(this._deleteMenuTargetId);
  selectionTarget.dataset.userId = target.innerHTML;
  selectionTarget.innerHTML = target.innerHTML;

};

/**
 * Callback for the confirmation button.<br>
 * Deletes the selected ID.<br>
 */
DeleteViewController.prototype._confirm = function() {
  var core = Mpin.Core.sharedInstance();

  console.warn('userid: ' + this._deleteUserId + ' will be deleted');
  core.deleteAccount(this._deleteUserId);
  if (core.userExist()) {
    this.viewControllerManager.back();
  } else {
    var initialVC = new InitialViewController(Mpin.ViewManager.views.initial);
    this.viewControllerManager.back(initialVC);
  }

};

/**
 * Callback for the cancel button.<br>
 * Returns to the previous screen.<br>
 */
DeleteViewController.prototype._cancel = function() {
  this.viewControllerManager.back();
};
