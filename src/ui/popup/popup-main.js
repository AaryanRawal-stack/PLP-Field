import Vue from 'vue';
import App from './App.vue';
import store from './store';
import { sendMessageToBackground } from './messaging';
import { debug, error } from '../../utils/logger.js';

debug("Initializing Vue instance for the Popup Application.");

// Create and mount the Vue instance with the Vuex store
new Vue({
  store,
  render: (h) => h(App)
}).$mount('#app');

debug("Vue instance mounted to #app successfully.");

// Setup a listener to receive messages (e.g., progress updates, errors) from background/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debug("Popup received message:", message);

  switch (message.action) {
    case 'updateProgress':
      // message.data should include progress details (e.g., current count, total)
      store.commit('updateProgress', message.data);
      break;
    case 'scrapingComplete':
      // Signal that extraction is finished
      store.commit('scrapingComplete', message.data);
      break;
    case 'error':
      // Handle any errors by updating state
      store.commit('handleError', message.data);
      break;
    default:
      debug("Unhandled message action:", message.action);
  }
  sendResponse({ status: 'received' });
  return true;
});

// Export the messaging helper so that other modules (e.g., the Vuex store) can use it
export { sendMessageToBackground };
