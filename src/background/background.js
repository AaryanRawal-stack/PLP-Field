import { debug, error, warn } from '../utils/logger.js';

const DEBUG = true; // Ensure DEBUG is enabled for logs

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debug("📩 Message received in background script:", message);

  const handlers = {
    startExtraction: (message, sendResponse) => {
      debug("🚀 Handling 'startExtraction' action. Request:", message);

      const targetAccount = message.payload?.account;
      if (!targetAccount) {
        warn("⚠️ No target account provided.");
        sendResponse({ code: 400, data: { error: "No account provided" } });
        return true;
      }

      const instagramProfileUrl = `https://www.instagram.com/${targetAccount}/`;

      chrome.storage.local.set({ currentTargetAccount: targetAccount }, () => {
        if (chrome.runtime.lastError) {
          error("❌ Error saving targetAccount:", chrome.runtime.lastError);
          sendResponse({ code: 500, data: { error: "Storage error" } });
          return true;
        }

        debug("✅ Target account saved:", targetAccount);

        chrome.tabs.create({ url: instagramProfileUrl }, (createdTab) => {
          if (chrome.runtime.lastError) {
            error("❌ Tab creation failed:", chrome.runtime.lastError);
            sendResponse({ code: 500, data: { error: "Tab creation failed" } });
            return true;
          }

          const tabId = createdTab.id;
          debug("✅ New tab created. Waiting for content script:", createdTab);

          chrome.storage.local.set({ instagramTabId: tabId }, () => {
            if (chrome.runtime.lastError) {
              error("❌ Error saving instagramTabId:", chrome.runtime.lastError);
              sendResponse({ code: 500, data: { error: "Tab ID storage error" } });
              return true;
            }

            debug("✅ instagramTabId stored:", tabId);
          });

          // **Ensure the Options Page Opens Automatically**
          chrome.runtime.openOptionsPage();
          debug("✅ Options page opened automatically.");

          sendResponse({ code: 200, data: { status: "Navigation initiated" } });
        });
      });

      return true; // Ensures async sendResponse works
    },

    contentScriptLoaded: (message, sender, sendResponse) => {
      debug("📩 Content script reported readiness. Sending 'startExtraction'.");

      chrome.storage.local.get(["instagramTabId"], (result) => {
        const tabId = result.instagramTabId;
        if (!tabId) {
          error("❌ No stored instagramTabId found. Cannot send 'startExtraction'.");
          sendResponse({ code: 500, data: { error: "No tab ID found" } });
          return true;
        }

        debug("✅ Sending 'startExtraction' command to tab:", tabId);
        chrome.tabs.sendMessage(tabId, { action: "startExtraction" }, (response) => {
          debug("📩 'startExtraction' response from content script:", response);
          sendResponse({ code: 200, data: { status: "Extraction started" } });
        });
      });

      return true;
    },

    pauseExtraction: (message, sender, sendResponse) => {
      debug("⏸️ Handling 'pauseExtraction' action.");
      
      chrome.storage.local.set({ extractionPaused: true }, () => {
          if (chrome.runtime.lastError) {
              error("❌ Failed to pause extraction:", chrome.runtime.lastError);
              sendResponse({ code: 500, data: { error: chrome.runtime.lastError.message } });
              return;
          }
  
          debug("✅ Extraction paused.");
          sendResponse({ code: 200, data: { status: "paused" } });
      });
  
      return true; // Required for async sendResponse to work
    },
  
    resumeExtraction: (message, sender, sendResponse) => {
      debug("▶️ Handling 'resumeExtraction' action.");
  
      chrome.storage.local.set({ extractionPaused: false }, () => {
          if (chrome.runtime.lastError) {
              error("❌ Failed to resume extraction:", chrome.runtime.lastError);
              sendResponse({ code: 500, data: { error: chrome.runtime.lastError.message } });
              return;
          }
  
          debug("✅ Extraction resumed.");
          sendResponse({ code: 200, data: { status: "resumed" } });
      });
  
      return true; // Required for async sendResponse to work
    },
  

    exportCSV: (message, sendResponse) => {
      debug("📤 Handling 'exportCSV' action...");
  
      chrome.storage.local.get(["exportedFollowers"], (result) => {
          if (chrome.runtime.lastError) {
              error("❌ Failed to retrieve followers:", chrome.runtime.lastError);
              sendResponse({ code: 500, data: { error: chrome.runtime.lastError.message } });
              return;
          }
  
          const followers = result.exportedFollowers || [];
          debug("📦 exportCSV - Retrieved followers from storage:", followers.length);
  
          if (!followers.length) {
              error("⚠️ No followers to export.");
              sendResponse({ code: 400, data: { error: "No followers to export." } });
              return;
          }
  
          let csvContent = "Username,Account Link,Public Status\n";
          followers.forEach(f => {
              const publicStatus = f.isPrivate ? "private" : "public";
              csvContent += `${f.username},https://www.instagram.com/${f.username}/,${publicStatus}\n`;
          });
  
          try {
              const blob = new Blob([csvContent], { type: "text/csv" });
              const reader = new FileReader();
  
              reader.onloadend = function () {
                  const url = reader.result; // Base64 encoded CSV file
  
                  chrome.downloads.download({
                      url: url,
                      filename: "followers.csv",
                      saveAs: true
                  }, (downloadId) => {
                      if (chrome.runtime.lastError) {
                          error("❌ Download failed:", chrome.runtime.lastError);
                          sendResponse({ code: 500, data: { error: chrome.runtime.lastError.message } });
                          return;
                      }
  
                      debug("✅ CSV file download initiated. Download ID:", downloadId);
                      sendResponse({ code: 200, data: { export_status: "success", downloadId: downloadId } });
                  });
              };
  
              reader.readAsDataURL(blob);
          } catch (err) {
              error("❌ Failed to create CSV file:", err);
              sendResponse({ code: 500, data: { error: err.message } });
          }
      });
  
      return true; // Ensure async sendResponse works
  },  

    export_followers: (message, sendResponse) => {
      debug("📩 Received 'export_followers' message from content script.");
      const extractedFollowers = message.data || [];

      debug("🔍 Extracted Followers Received:", extractedFollowers);

      if (!extractedFollowers.length) {
        warn("⚠️ No followers received from content script.");
        sendResponse({ code: 400, data: { error: "No followers received" } });
        return true;
      }

      chrome.storage.local.get(["exportedFollowers"], (result) => {
        debug("📦 Retrieved existing followers from storage:", result.exportedFollowers);

        let existingFollowers = result.exportedFollowers || [];

        // Deduplicate using a Map
        const followersMap = new Map();
        existingFollowers.forEach(f => followersMap.set(f.username, f));
        extractedFollowers.forEach(f => followersMap.set(f.username, f));

        const updatedFollowers = Array.from(followersMap.values());

        chrome.storage.local.set({ exportedFollowers: updatedFollowers }, () => {
          if (chrome.runtime.lastError) {
            error("❌ Failed to store followers:", chrome.runtime.lastError);
            sendResponse({ code: 500, data: { error: chrome.runtime.lastError } });
          } else {
            debug("✅ Successfully stored followers. Total:", updatedFollowers.length);
            sendResponse({ code: 200, data: { export_status: "success", count: updatedFollowers.length } });
          }
        });
      });

      return true;
    },

    updateProgress: (message, sendResponse) => {
      debug("🔄 Handling 'updateProgress' action:", message.data);
      sendResponse({ code: 200, data: { status: "progress updated" } });
      debug("✅ 'updateProgress' action handled.");
      return true;
    }
  };

  if (handlers[message.action]) {
    return handlers[message.action](message, sender, sendResponse);
  } else {
    warn("⚠️ Unhandled message action:", message.action);
    sendResponse({ code: 200, data: {} });
    return true;
  }
});
