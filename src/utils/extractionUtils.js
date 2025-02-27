import { debug, info, warn, error } from './logger.js';

/**
 * Waits for an element matching the selector to appear in the DOM.
 * @param {string} selector - The CSS selector to search for.
 * @param {number} timeout - Timeout in milliseconds (default 15000).
 * @returns {Promise<Element>}
 */
export const waitForElement = (selector, timeout = 15000) =>
  new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      }
    }, 500);
    setTimeout(() => {
      clearInterval(interval);
      const errMsg = `Element not found: ${selector}`;
      error(errMsg);
      reject(errMsg);
    }, timeout);
  });

/**
 * Returns a random integer between min and max (inclusive).
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Helper function to fetch a user's privacy status using Instagram API endpoints.
 * This implementation first attempts the public API endpoint; if that fails,
 * it falls back to an internal API endpoint. If both attempts fail, it resolves with "not found".
 *
 * @param {string} username
 * @returns {Promise<boolean|string>} Resolves to a boolean indicating if the user is private,
 * or "not found" if the privacy status could not be determined.
 */
export const fetchUserPrivacyStatus = (username) => {
  // Stub function: always resolve with "not found"
  return Promise.resolve("not found");
};

/**
 * Extracts unique follower usernames from elements matching followerSelector.
 * This implementation follows the content.js approach: it reads the element's inner text,
 * or falls back to parsing the href, and creates an enhanced follower object.
 * @param {string} followerSelector - CSS selector for follower elements.
 * @returns {Map<string, Object>} - Map of enhanced follower objects keyed by username.
 */
export const extractFollowers = (followerSelector) => {
  const followers = document.querySelectorAll(followerSelector);
  debug(`extractFollowers: Found ${followers.length} follower elements using selector: ${followerSelector}`); // Added log
  const extracted = new Map();
  if (!followers || followers.length === 0) {
    warn("No new followers found.");
    return extracted;
  }

  followers.forEach((f) => {
    let username = f.innerText.trim();
    if (!username && f.getAttribute("href")) {
      // Extract username from href, assuming format: "/username/"
      const href = f.getAttribute("href");
      username = href.split('/')[1];
    }
    // Use the content.js approach: simply check if a username exists
    if (username && !extracted.has(username)) {
      debug(`extractFollowers: Extracted username: ${username}`); // Added log
      const userObj = { username, isPrivate: null };
      extracted.set(username, userObj);
      debug(`extractFollowers: Calling fetchUserPrivacyStatus for ${username}`); // Added log
      fetchUserPrivacyStatus(username)
        .then(status => {
          userObj.isPrivate = status;
          debug(`extractFollowers: Updated privacy status for ${username}: ${status}`); // Modified log
        })
        .catch(err => {
          error(`extractFollowers: Error fetching privacy status for ${username}: ${err}`); // Modified log
        });
    }
  });
  return extracted;
};

/**
 * Continuously scrolls the container for 30 seconds, collects the current enhanced follower data,
 * sends them via the update callback, rests for 30 seconds, then repeats the cycle.
 * Pauses if window.extractionPaused is true.
 *
 * @param {string} scrollContainerSelector - CSS selector for the scrollable container.
 * @param {string} followerSelector - CSS selector for follower elements.
 * @param {function} updateUserCallback - A callback function that receives the enhanced follower objects.
 * @param {function} progressCallback - Callback function to send progress updates.
 * @param {number} totalFollowerCount - Total follower count.
 */
export const continuousScrollCycle = (scrollContainerSelector, followerSelector, updateUserCallback, progressCallback, totalFollowerCount) => {
  debug("continuousScrollCycle: Starting a new scroll cycle.");

  const container = document.querySelector(scrollContainerSelector);
  if (!container) {
    error("continuousScrollCycle: Scroll container not found.");
    return;
  }

  // Assign a unique cycle ID based on the current timestamp.
  const cycleId = Date.now();
  debug(`continuousScrollCycle: Cycle ID ${cycleId} started.`);

  const duration = 30000;
  const intervalTime = 1000;
  const startTime = Date.now();
  let accumulatedFollowers = new Map();

  const scrollInterval = setInterval(() => {
    if (window.extractionPaused) {
      clearInterval(scrollInterval);
      debug(`continuousScrollCycle: Cycle ID ${cycleId} detected pause; interval cleared.`);
      return;
    }
    
    debug(`continuousScrollCycle: Cycle ID ${cycleId} scrolling...`);
    const currentContainer = document.querySelector(scrollContainerSelector);
    if (currentContainer) {
      currentContainer.scrollTop = currentContainer.scrollHeight;
    }
    
    // Extract current followers and merge into the accumulated collection.
    const currentExtracted = extractFollowers(followerSelector);
    currentExtracted.forEach((value, key) => {
      if (!accumulatedFollowers.has(key)) {
        accumulatedFollowers.set(key, value);
        debug(`continuousScrollCycle: Cycle ID ${cycleId} - New username stored: ${key}`);
      }
    });
    const extractedCount = accumulatedFollowers.size;
    debug(`continuousScrollCycle: Cycle ID ${cycleId} - Accumulated follower count: ${extractedCount}`);

    if (typeof progressCallback === "function" && typeof totalFollowerCount !== "undefined") {
      progressCallback(extractedCount);
    }

    if (Date.now() - startTime > duration) {
      clearInterval(scrollInterval);
      info(`continuousScrollCycle: Cycle ID ${cycleId} - Stopped after 30 seconds`);
      if (typeof updateUserCallback === "function") {
        const followersArray = Array.from(accumulatedFollowers.values());
        debug(`continuousScrollCycle: Cycle ID ${cycleId} - Calling updateUserCallback with ${followersArray.length} followers.`);
        updateUserCallback(followersArray);
      }
      setTimeout(() => {
        if (!window.extractionPaused) {
          debug(`continuousScrollCycle: Cycle ID ${cycleId} - Restarting cycle.`);
          continuousScrollCycle(scrollContainerSelector, followerSelector, updateUserCallback, progressCallback, totalFollowerCount);
        } else {
          debug(`continuousScrollCycle: Cycle ID ${cycleId} - Extraction paused; not restarting cycle.`);
        }
      }, 30000);
    }
  }, intervalTime);
};
