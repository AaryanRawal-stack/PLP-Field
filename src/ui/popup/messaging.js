import { debug, error } from '../../utils/logger.js';

/**
 * Sends a message to the background script.
 * The payload can include any data, such as enhanced follower objects with extra properties.
 *
 * @param {string} action - The action identifier.
 * @param {object} payload - The data to send.
 */
export function sendMessageToBackground(action, payload) {
  chrome.runtime.sendMessage({ action, payload }, (response) => {
    if (chrome.runtime.lastError) {
      error("Error sending message to background script:", chrome.runtime.lastError);
    } else {
      debug("Message sent. Background responded:", response);
    }
  });
};
