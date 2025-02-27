Below is the updated ReadMe:

---

# Chrome Extension – Free Instagram Follower Exporter (Vue-Based)

## Overview

This Chrome extension allows you to extract Instagram follower data completely free—bypassing premium paywalls, subscription checks, and export limits. Built with Vue.js for its user interfaces (popup and options pages), a background service worker for message handling, and content scripts for data extraction, the extension now features enhanced extraction capabilities with a simplified approach. These improvements include:

- **Enhanced Data Extraction:**  
  - Instead of relying on heavy regex filtering, the extraction logic now mimics the content.js approach by directly extracting visible usernames from the DOM.
  - For each valid username, an enhanced follower object is created containing:
      - `username`
      - `isPrivate` (updated asynchronously via genuine API integration)
  - This streamlined method minimizes extraneous API calls while ensuring that each username is checked for its public/private status.

- **Genuine API Integration:**  
  - The helper function `fetchUserPrivacyStatus` makes real network requests to determine the privacy status:
    - **Public API Attempt:**  
      A GET request is sent to `https://www.instagram.com/<username>/?__a=1&__d=1`. Any anti-scraping prefix is removed before parsing.
    - **Fallback to Internal API:**  
      If the public API fails, the extension calls `https://i.instagram.com/api/v1/users/web_profile_info/?username=<username>` with an appropriate App ID header.
    - **Final Fallback:**  
      If both attempts fail, the status is set to `"not found"`.
    
- **Robust Error Handling & Rate Limiting:**  
  - Improved error logging and fallback mechanisms help manage non-JSON responses and potential rate-limiting by Instagram.

- **Enhanced CSV Export:**  
  - The CSV export now includes extra fields, such as a "Public Status" column that reflects the `isPrivate` property (displayed as "public", "private", or the literal value if not found), along with Username, Account Link, and a placeholder for Parent Account.

- **Pause/Resume Functionality:**  
  - Users can pause and resume the extraction process via the Options Page UI.

- **Automated Navigation & Real-Time Progress Updates:**  
  - The extension automatically opens the target Instagram profile in a new tab and displays real-time progress updates—including the count of enhanced follower objects—on the Options Page.

**Please Note:**  
This extension is still under development. Some features may not be fully functional or may have limitations—please refer to the Known Issues section for details.

## Features

- **Free Mode Extraction:** No premium subscriptions or export limits.
- **Enhanced Data Extraction:**  
  - Extracts visible usernames directly using a simplified approach.
  - Creates enhanced follower objects that include the username and privacy status.
  - Uses genuine API integration to verify whether each account is public or private.
- **Modern UI with Vue.js:** Interactive popup and Options Page.
- **Pause/Resume Extraction:** Control extraction via the Options Page UI.
- **Automated Navigation:** Opens the target Instagram profile in a new tab.
- **Real-Time Progress Updates:** Displays progress and enhanced data details.
- **CSV Export with Extra Fields:**  
  Exports follower data as CSV, including columns for Username, Account Link, Public Status, and Parent Account (to be implemented further).

## File Structure

```
.
├── package.json
├── package-lock.json
├── webpack.config.js
├── readMe.md         // This file
├── public
│   ├── index.html
│   ├── manifest.json
│   ├── options.html
│   ├── popup.html
│   └── icons
│       ├── logo_128.png
│       ├── logo_16.png
│       └── logo_48.png
└── src
    ├── background
    │   └── background.js
    ├── content
    │   ├── content-script.js
    │   └── kodepay-script.js
    ├── ui
    │   ├── popup
    │   │   ├── popup-main.js
    │   │   ├── App.vue
    │   │   ├── store.js
    │   │   └── messaging.js
    │   └── options
    │       ├── optionspage.vue
    │       ├── options.js
    │       └── main.js
    └── utils
        ├── extractionUtils.js
        └── logger.js
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

### Development

#### Running the Development Server

To preview UI changes with auto-reloading of Vue components during development, run:

```bash
npm run serve
```

#### Usage

1. **Installation:**  
   Follow the "Setup and Installation" steps to install the extension in Chrome.
2. **Open Instagram:**  
   Log in to your Instagram account in a Chrome tab.
3. **Start Extraction:**  
   - **Popup UI:**  
     - Click the extension icon.
     - Confirm that you're logged into Instagram.
     - Enter the target Instagram account (username or URL).
     - Click "Start Scraping."
   - **Options Page UI:**  
     - Open the Options Page (right-click the extension icon → Options).
     - Enter the Instagram URL or Username.
     - Adjust settings (e.g., delay, extraction type).
     - Click "Start Parsing."
4. **Monitor Progress:**  
   The Options Page displays real-time progress, including the number of enhanced follower objects (with privacy status) extracted.
5. **Pause/Resume/Export:**  
   Use the provided buttons to pause/resume extraction and export data as CSV.

## Known Issues and Limitations

- **Rate Limiting:**  
  Although extraction is rate-limited, excessive requests may still lead to temporary blocks by Instagram. Adjust settings as needed.

## Future Enhancements

- **Refine API Integration:**  
  Improve error handling and fallback logic for more robust extraction.
- **Expanded CSV Fields:**  
  Include additional data fields (like a fully implemented "Parent Account") in the export.
-**Allow for cleared history:**

## License

This project is licensed under the MIT License.