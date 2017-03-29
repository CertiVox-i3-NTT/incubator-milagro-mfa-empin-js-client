var Mpin = Mpin || {};
Mpin.Resources = Mpin.Resources || {};
Mpin.Resources.Lang = Mpin.Resources.Lang || {};

Mpin.Resources.Lang.ja = {
  // Common View
  manager_default_title: "MPINログイン",
  manager_mobile_title: "モバイルからログイン",

  // Initial View
  initial_select_menu_label: "ID",
  initial_select_menu_default_text: "メニューを選択して下さい",
  initial_select_menu_install_text: "新規IDの追加",
  initial_select_menu_mobile_text: "モバイルからログイン",
  initial_goto_install_button: "IDを追加する",
  initial_goto_mobile_button: "アクセスナンバーの取得",

  // Home View
  home_select_userid_label: "ID",
  home_select_menu_default_text: "メニューを選択して下さい",
  home_select_menu_mobile_text: "モバイルからログイン",
  home_input_pincode_label: "PIN",
  home_login_button: "ログイン",
  home_delete_button: "削除",
  home_renew_button: "アカウントの再発行",
  home_goto_mobile_button: "アクセスナンバーの取得",
  home_pincode_input: "PINコードを入力して下さい",
  home_install_link_text: "新規IDの追加",
  home_delete_link_text: "IDの削除",

  home_error_user_id_empty: "IDをメニューから選択して下さい",
  home_error_pincode_empty: "PINを入力して下さい",
  home_error_pincode_not_alphanumeric: "PINは英数字です",
  home_error_pincode_invalid: "PINが間違っています",
  home_error_failed: "ログインに失敗しました",
  home_error_delete_or_renew: "3回連続でPIN入力に失敗しました<br>PINを削除するか再設定する必要があります: {0}",
  home_error_general_error: "テクニカルエラーが発生しました<br>時間を置いて再度試すか、サーバー管理者に連絡してください",


  // Install View
  install_input_userid_label: "ID",
  install_id_input: "ID（Email）",
  install_get_activation_code_button: "アクティベーションコードの取得",
  install_input_activation_code_label: "コード",
  install_activation_code_input: "アクティベーションコードを入力して下さい",
  install_input_pincode_label: "PIN",
  install_create_pincode_input: "任意のPINを設定して下さい",
  install_install_button: "MPINのインストールを完了する",

  install_send_activation_code_text: "アクティベーションコードをメール送信しました",
  install_activation_code_debug_text: "<br>あなたのアクティベーションコードは{0}です",

  install_error_userid_empty: "ID（Email）を入力して下さい",
  install_error_userid_invalid: "このID（Email）は使用することができません",
  install_error_activation_code_empty: "アクティベーションコードを入力して下さい",
  install_error_activation_code_invalid: "アクティベーションコードが間違っています",
  install_error_activation_code_format_invalid: "アクティベーションコードは半角英数字12桁で入力して下さい",
  install_error_activation_code_max_attempts_count_over: "3回連続でアクティベーションコード入力に失敗しました。<br>セッションが無効になったため最初からやり直す必要があります。",
  install_error_general_error: "テクニカルエラーが発生しました<br>時間を置いて再度試すか、サーバー管理者に連絡してください",  
  install_error_pincode_not_alphanumeric: "PINは半角英数字で入力して下さい",
  install_error_pincode_empty: "PINを入力して下さい",
  install_error_pincode_too_short: "PINが短すぎます. {0}桁以上で入力して下さい",
  install_error_pincode_too_long: "PINが長すぎます. {0}桁以下で入力して下さい",
  install_error_timeout_finish: "インストールセッションの有効期限が切れました. 再度最初からやり直して下さい",

  // Delete View
  delete_userid_label: "ID",
  delete_select_default_value: "IDを選択して下さい",
  delete_delete_button: "削除",
  delete_message: "{0}のPINを削除しても良いですか？",
  delete_confirm_button: "削除する",
  delete_cancel_button: "キャンセルする",

  delete_error_userid_empty: "PINを削除するIDを選択して下さい",

  // Mobile Login View
  mobile_login_time_number_default: '00', // not used
  mobile_login_acccess_number: 'アクセスナンバー',
  mobile_login_access_number_default: '000000', // not used
  mobile_login_general_error: "テクニカルエラーが発生しました<br>時間を置いて再度試すか、サーバー管理者に連絡してください"
};
