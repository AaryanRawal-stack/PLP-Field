Below is an updated version of your ReadMe that reflects the changes made to display the options UI inline via an iframe, the webpack configuration adjustments, and the improved export function. You can adjust any details as needed:

---

# Chrome Extension – Free Instagram Follower Exporter (Vue-Based)

## Overview

This Chrome extension allows you to extract Instagram follower data completely free—bypassing premium paywalls, subscription checks, and export limits. Built with Vue.js for its user interfaces (popup and options), a background service worker for message handling, and content scripts for data extraction, the extension now features an inline options interface that appears directly on Instagram rather than as a separate page. This update streamlines the user experience and allows real-time interaction with extraction and export features.

## Features

- **Free Mode Extraction:** No premium subscriptions or export limits.
- **Enhanced Data Extraction:**  
  - Directly extracts visible usernames from Instagram’s DOM.
  - Creates enhanced follower objects that include privacy status by verifying via Instagram’s API.
- **Modern UI with Vue.js:**  
  - **Popup UI:** For quick access and notifications.
  - **Inline Options UI:** Now injected directly into the Instagram page via an iframe, providing a seamless in-context experience.
- **Pause/Resume & Real-Time Progress:**  
  - Monitor extraction progress and control the process using the inline options panel.
- **CSV Export:**  
  - Export follower data with detailed columns (Username, Account Link, Public Status, and Parent Account). Note that the export function is slightly slower than before, but works reliably.

## File Structure

```
.
├── package.json
├── package-lock.json
├── webpack.config.js         // Build configuration, including HtmlWebpackPlugin for inline.html
├── public
│   ├── index.html
│   ├── popup.html
│   └── inline.html           // Template for the inline Options UI (formerly options.html)
├── dist                      // Build output folder (contains inline.html, options.js, etc.)
├── src
│   ├── background
│   │   └── background.js
│   ├── content
│   │   ├── content-script.js  // Now creates an injection container and injects an iframe loading inline.html
│   │   └── kodepay-script.js
│   ├── ui
│   │   ├── popup
│   │   │   └── popup-main.js
│   │   └── options
│   │       ├── options-main.js  // Vue entry file for the inline Options UI
│   │       ├── options.js         // Exports the OptionsPage component
│   │       ├── optionspage.vue    // Main Vue component for the Options UI
│   │       └── store.js           // Vuex store for state management in the Options UI
│   └── utils
│       ├── extractionUtils.js
│       └── logger.js
```

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v12+ recommended)
- npm (or yarn)

### Installation Steps

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```
   or, if using yarn:
   ```bash
   yarn install
   ```

3. **Build the Extension:**

   ```bash
   npm run build
   ```

   This will generate your production-ready files in the `dist` folder, including:
   - `popup.html` and its bundle.
   - `inline.html` (the new template for your inline Options UI) with the injected `options.js` bundle.
   - Other assets.

4. **Load the Unpacked Extension:**

   - Open Chrome and navigate to `chrome://extensions`.
   - Enable "Developer Mode".
   - Click “Load unpacked” and select the `dist` folder.

## Usage

1. **Automatic Extraction:**
   - When you visit an Instagram profile, the content script creates a fixed-position container on the right side of the page.
   - An iframe is injected into this container, loading `inline.html`, which in turn mounts your Vue-based Options UI.
   - Use the inline panel to monitor progress, pause/resume extraction, and trigger CSV export.

2. **Exporting Data:**
   - The export function allows you to download a CSV file containing your extracted follower data.
   - Note: The export process may be a bit slower compared to previous versions.

## Changes & Technical Details

- **Inline Options UI:**  
  The previous separate options page has been replaced by an inline UI. The content script now:
  - Creates an injection container.
  - Injects an iframe that loads `inline.html` (renamed from `options.html` to avoid Chrome blocking).
- **Webpack Configuration:**  
  - The HtmlWebpackPlugin now generates `inline.html` by injecting the bundle for the `"options"` entry.
  - The plugin configuration was updated to use `chunks: ['options']` (matching the entry key) so that the correct JavaScript is injected.
- **Manifest Adjustments:**  
  - The official options page declaration was removed or modified to prevent Chrome from auto-opening a separate options tab.
- **Performance:**  
  - The export function is working correctly, though it may perform slightly slower than before.

## Known Issues and Future Enhancements

- **Export Function Speed:**  
  While the export function works reliably, it runs a bit slower than in previous versions. Further optimizations could be explored.
- **Inline UI Customization:**  
  Additional styling and functionality improvements may be added based on user feedback.
- **Direct Injection Alternative:**  
  As an alternative to the iframe approach, future updates might consider directly injecting the Vue app into the page without an iframe.

## License

This project is licensed under the MIT License.

---