const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) console.log("[DEBUG]", ...args);
};

export default {
  get_valid_subscriptions: () => {
    debugLog("Bypassing get_valid_subscriptions: no subscriptions required in free mode.");
    return Promise.resolve([]);
  },
  open_payment_page: () => {
    debugLog("Bypassing open_payment_page: free mode enabled.");
    return Promise.resolve("https://dummy-payment-url.com/success");
  },
  register_login_information: (info) => {
    debugLog("Bypassing register_login_information with info:", info);
    return Promise.resolve({ status: "ok" });
  },
  open_user_management_page: () => {
    debugLog("Bypassing open_user_management_page: free mode enabled.");
    return Promise.resolve("https://dummy-user-management.com");
  },
  open_payment_choose_page: (option) => {
    debugLog("Bypassing open_payment_choose_page with option:", option);
    return Promise.resolve("https://dummy-payment-choose.com");
  },
  on_pay_completed: {
    addListener: (callback) => {
      debugLog("Simulating immediate pay completion.");
      setTimeout(() => callback({ pay_status: "succeed", transaction_id: "dummy_tx" }), 100);
    }
  },
  on_login_completed: {
    addListener: (callback) => {
      debugLog("Simulating immediate login completion.");
      setTimeout(() => callback({ status: "logged_in" }), 100);
    }
  },
  open_login_page: () => {
    debugLog("Bypassing open_login_page: free mode enabled.");
    return Promise.resolve("https://dummy-login.com");
  }
};
