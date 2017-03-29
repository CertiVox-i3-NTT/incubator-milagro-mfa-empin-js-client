var Mpin = Mpin || {};
Mpin.Resources = Mpin.Resources || {};
Mpin.Resources.Lang = Mpin.Resources.Lang || {};

Mpin.Resources.getResource = function() {
  var resource = Mpin.Resources.Lang['en']; // default resource

  // Set custom key (Reserved Key)
  var config = Mpin.Config.sharedInstance();
  resource["image_base_url"] = config.imageBaseURL;

  var lang = config.language || 'en'; // default lang
  if (lang == 'en') return resource;

  var currentLangResource = Mpin.Resources.Lang[lang];
  if (currentLangResource) {
    // overwrite to default key value
    for (var key in currentLangResource) {
      resource[key] = currentLangResource[key];
    }
  } else {
    Mpin.Logger.error(lang + "'s resources is not found");
  }

  return resource;
};

Mpin.Resources.Lang.en = {
  // Reserved Key
  image_base_url: "",

  // Common View
  manager_default_title: "MPIN Login",
  manager_mobile_title: "Login from Mobile",

  // Initial View
  initial_select_menu_label: "ID",
  initial_select_menu_default_text: "Select Menu...",
  initial_select_menu_install_text: "Add New ID...",
  initial_select_menu_mobile_text: "Login from mobile...",
  initial_goto_install_button: "Create",
  initial_goto_mobile_button: "Get Access Number",

  // Home View
  home_select_userid_label: "ID",
  home_select_menu_default_text: "Select Menu...",
  home_select_menu_mobile_text: "Login from mobile...",
  home_input_pincode_label: "PIN",
  home_login_button: "Login",
  home_delete_button: "Delete",
  home_renew_button: "Renew",
  home_goto_mobile_button: "Get Access Number",
  home_pincode_input: "Input Your PIN Code",
  home_install_link_text: "Add New ID",
  home_delete_link_text: "Delete Your ID",

  home_error_user_id_empty: "You must choose ID",
  home_error_pincode_empty: "You must input PIN",
  home_error_pincode_not_alphanumeric: "PIN is alphanumeric characters",
  home_error_pincode_invalid: "Incorrect PIN!",
  home_error_failed: "Failed to login",
  home_error_delete_or_renew: "Incorrect PIN 3 times.<br> Delete or Renew PIN of {0}",
  home_error_general_error: "We are experiencing a technical problem. Please try again later or contact the service administrator.",


  // Install View
  install_input_userid_label: "ID",
  install_id_input: "ID（Email）",
  install_get_activation_code_button: "Get Activation code",
  install_input_activation_code_label: "Code",
  install_activation_code_input: "Activation Code you got",
  install_input_pincode_label: "PIN",
  install_create_pincode_input: "Choose your pin code",
  install_install_button: "Install",

  install_send_activation_code_text: "Sent an email to you.<br>Please check the activation code.",
  install_activation_code_debug_text: "Your activationCode is {0}.",

  install_error_userid_empty: "Input User ID(Email)",
  install_error_userid_invalid: "User ID(Email) is invalid",
  install_error_activation_code_empty: "Input Activation Code",
  install_error_activation_code_invalid: "Activation Code is incorrect",
  install_error_activation_code_format_invalid: "Activation Code is half-width 12 digits.<br>Format is 'xxxx-xxxx-xxxx'.",
  install_error_activation_code_max_attempts_count_over: "Incorrect Activation Code 3 times.<br> This session is invalid. Please retry.",
  install_error_general_error: "We are experiencing a technical problem. Please try again later or contact the service administrator.",  
  install_error_pincode_not_alphanumeric: "PIN must be alphanumeric characters",
  install_error_pincode_empty: "Input PIN Code",
  install_error_pincode_too_short: "PIN Code is too short, {0} or more characters is recommended.",
  install_error_pincode_too_long: "PIN Code is too long, {0} characters or less is recommended.",
  install_error_timeout_finish: "Install request expired. Please try again from the beginning.",

  // Delete View
  delete_userid_label: "ID",
  delete_select_default_value: "Choose ID...",
  delete_delete_button: "Delete",
  delete_message: "Delete PIN of {0}",
  delete_confirm_button: "Yes Delete",
  delete_cancel_button: "No",

  delete_error_userid_empty: "Choose ID to delete",

  // Mobile Login View
  mobile_login_time_number_default: '00', // not used
  mobile_login_acccess_number: 'Access Number',
  mobile_login_access_number_default: '000000', // not used
  mobile_login_general_error: "We are experiencing a technical problem. Please try again later or contact the service administrator."

};
