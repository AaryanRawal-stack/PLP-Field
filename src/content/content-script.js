import { waitForElement, continuousScrollCycle, extractFollowers } from '../utils/extractionUtils.js';
import { debug, info, warn, error } from '../utils/logger.js';

function createInjectionContainer() {
  const container = document.createElement('div');
  container.id = 'my-extension-options-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.width = '400px';
  container.style.height = '100%';
  container.style.zIndex = '9999';
  container.style.backgroundColor = '#fff';
  container.style.border = '1px solid #ccc';
  container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  document.body.appendChild(container);
  return container;
}

function injectIframe() {
  const container = document.getElementById('my-extension-options-container');
  if (!container) {
    console.error('Container not found. Aborting iframe injection.');
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('inline.html');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.backgroundColor = '#ffffff';
  container.appendChild(iframe);
}

// Make sure we call BOTH functions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createInjectionContainer();
    injectIframe();
  });
} else {
  createInjectionContainer();
  injectIframe();
}

(() => {
  "use strict";

  debug("Enhanced Content Script loaded with extraction utils");

  const MODAL_SELECTOR = "div[role='dialog']";
  const SCROLL_CONTAINER_SELECTOR = "div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja";
  const FOLLOWER_SELECTOR = "div[role='dialog'] a[href]";

  let totalFollowerCount = 0;

  // Global pause flag attached to the window object
  window.extractionPaused = false;

  const simulateClick = (element) => {
    const event = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  };

  const isValidProfilePage = () => {
    const regex = /^https:\/\/(www\.)?instagram\.com\/([^/?#]+)\/?$/;
    return regex.test(window.location.href);
  };

  const getTotalFollowers = () => {
    return new Promise((resolve, reject) => {
      waitForElement("a[href*='/followers/'] span", 15000)
        .then((followersElement) => {
          const countText = followersElement.innerText.replace(/,/g, "").trim();
          const count = parseInt(countText, 10);
          if (!isNaN(count)) {
            totalFollowerCount = count;
            debug(`Total followers detected: ${totalFollowerCount}`);
            resolve();
          } else {
            error("Unable to parse follower count.");
            reject("Unable to parse follower count.");
          }
        })
        .catch((err) => {
          error("Follower count element not found.", err);
          reject(err);
        });
    });
  };

  const openFollowersModal = () => {
    const followersLink = document.querySelector("a[href*='/followers/']");
    if (followersLink) {
      simulateClick(followersLink);
      debug("Followers link clicked to open modal.");
      return true;
    } else {
      error("Followers link not found.");
      return false;
    }
  };

  // Updated to check extractionPaused before sending updates.
  const updateUserWithFollowers = async (followers) => {
    if (!followers || followers.length === 0) {
      debug("❌ No new followers extracted; skipping update.");
      return;
    }

    if (window.extractionPaused) {
      debug("Extraction has been stopped. Skipping update.");
      return;
    }

    debug("📤 Sending extracted followers to background script:", followers);

    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "export_followers", data: followers }, (response) => {
        if (chrome.runtime.lastError) {
          error("❌ Message failed:", chrome.runtime.lastError);
          resolve(false);
        } else {
          debug("✅ Background response to 'export_followers':", response);
          resolve(true);
        }
      });
    });

    // Delay added if necessary
    await new Promise((res) => setTimeout(res, 500));
  };

  const startExtraction = async () => {
    debug("🚀 startExtraction() called.");
    // If extraction has been paused/stopped, do not restart.
    if (window.extractionPaused) {
      debug("Extraction is currently paused or stopped. Not starting extraction cycle.");
      return;
    }
    try {
      await getTotalFollowers();
      if (totalFollowerCount === 0) {
        error("❌ Total follower count is zero. Aborting.");
        return;
      }
      if (!openFollowersModal()) return;
      await waitForElement(MODAL_SELECTOR, 15000);
      debug("✅ Followers modal detected. Now starting continuousScrollCycle...");
      continuousScrollCycle(
        SCROLL_CONTAINER_SELECTOR,
        FOLLOWER_SELECTOR,
        updateUserWithFollowers,
        (extractedCount) => {
          chrome.runtime.sendMessage({
            action: "updateProgress",
            data: { current: extractedCount, total: totalFollowerCount }
          }, (response) => {
            debug("✅ Background response to updateProgress:", response);
          });
          debug(`📊 Progress update sent: ${extractedCount} / ${totalFollowerCount}`);
        },
        totalFollowerCount
      );
    } catch (errorMsg) {
      error("❌ Extraction process failed:", errorMsg);
    }
    debug("✅ startExtraction() finished.");
  };

  const injectManualTrigger = () => {
    const targetContainer = document.querySelector("header") || document.body;
    if (!targetContainer) {
      error("No container found to inject the manual trigger button.");
      return;
    }
    const button = document.createElement("button");
    button.innerText = "Extract Followers";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#3897f0";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.addEventListener("click", () => {
      debug("Manual trigger clicked. Starting extraction...");
      startExtraction();
    });
    targetContainer.appendChild(button);
    debug("Manual trigger button injected.");
  };

  // Listen for messages from the background or popup scripts.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    debug("Message received in content script:", message);
    try {
      if (message.action === "startExtraction") {
        debug("Action 'startExtraction' received.");
        startExtraction();
        sendResponse({ status: "extraction started" });
        return true;
      } else if (message.action === "pauseExtraction") {
        debug("Action 'pauseExtraction' received.");
        window.extractionPaused = true;
        debug("Extraction paused.");
        sendResponse({ status: "extraction paused" });
        return true;
      } else if (message.action === "resumeExtraction") {
        debug("Action 'resumeExtraction' received.");
        if (window.extractionPaused) {
          window.extractionPaused = false;
          debug("Resuming extraction.");
          continuousScrollCycle(
            SCROLL_CONTAINER_SELECTOR,
            FOLLOWER_SELECTOR,
            updateUserWithFollowers,
            (extractedCount) => {
              // Only send progress updates if extraction is active.
              if (!window.extractionPaused) {
                chrome.runtime.sendMessage({
                  action: "updateProgress",
                  data: { current: extractedCount, total: totalFollowerCount }
                }, (response) => {
                  debug("✅ Background response to updateProgress:", response);
                });
                debug(`📊 Progress update sent: ${extractedCount} / ${totalFollowerCount}`);
              }
            },
            totalFollowerCount
          );
          sendResponse({ status: "extraction resumed" });
          debug("Response 'extraction resumed' sent.");
          return true;
        } else {
          debug("Resume requested but extraction not paused.");
        }
      } else if (message.action === "stopExtraction") {
        debug("Action 'stopExtraction' received.");
        window.extractionPaused = true;
        debug("Extraction stopped via stopExtraction message.");
        sendResponse({ status: "extraction stopped" });
        return true;
      }
    } catch (err) {
      error("Error in content script message listener:", err);
    }
    debug("Message listener completed.");
  });

  // Send "READY" message to background script after content script is loaded.
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: "contentScriptLoaded", status: "ready" }, (response) => {
      debug("Content script ready message sent to background script. Response:", response);
    });
  } else {
    warn("chrome.runtime.sendMessage not available. Are you in a content script context?");
  }

  const initExtraction = () => {
    if (!isValidProfilePage()) {
      debug("Not a valid profile page. Extraction not initialized.");
      return;
    }
    debug("Valid profile page detected. Initializing extraction.");
    injectManualTrigger();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExtraction);
  } else {
    initExtraction();
  }
})();