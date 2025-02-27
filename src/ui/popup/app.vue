<template>
  <div id="popup-root">
    <div class="popup-main-content">
      <div class="popup-header">
        <div class="ig-logo">
          <img :src="logoImg" alt="Logo" />
        </div>
        <div class="ig-desc">
          <p class="ig-title">{{ popupTitle }}</p>
          <p class="ig-detail">{{ popupDescription }}</p>
        </div>
      </div>

      <!-- Step 1: Login Confirmation -->
      <div v-if="currentStep === 'login'">
        <p>Please confirm that you are logged into Instagram.</p>
        <button @click="confirmLogin">Yes, I'm logged in</button>
      </div>

      <!-- Step 2: Account Input -->
      <div v-else-if="currentStep === 'accountInput'">
        <p>Please enter the Instagram account (username or URL) you wish to export:</p>
        <input type="text" v-model="accountInput" placeholder="Enter account username or URL" />
        <button @click="confirmAccount">Confirm Account</button>
      </div>

      <!-- Step 3: Confirmation & Start Scraping -->
      <div v-else-if="currentStep === 'confirm'">
        <p>
          You have selected to scrape account:
          <strong>{{ targetAccount }}</strong>.
        </p>
        <p>
          The output CSV will include the scraped account username, account link, public status, and parent account.
        </p>
        <button @click="startScraping">Start Scraping</button>
      </div>

      <!-- Step 4: Progress Display and Controls -->
      <div v-else-if="currentStep === 'scraping'">
        <p>
          Scraping in progress for account:
          <strong>{{ targetAccount }}</strong>
        </p>
        <p>Extracted: {{ progress.current }} / {{ progress.total }}</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <button @click="togglePause">
          {{ progress.paused ? 'Resume' : 'Pause' }}
        </button>
        <!-- New element to display enhanced follower count -->
        <p>Enhanced Followers Stored: {{ followersCount }}</p>
      </div>

      <!-- Step 5: Completion Message -->
      <div v-else-if="currentStep === 'complete'">
        <p>
          Scraping complete for account:
          <strong>{{ targetAccount }}</strong>!
        </p>
        <p>Data has been exported successfully.</p>
        <button @click="goToOptionPage">{{ exportDataText }}</button>
      </div>

      <!-- Popup Footer -->
      <div class="popup-footer">
        <div class="contact-info">
          <a href="https://socialdeck.ai/contact-us?utm_source=ig_cs" target="_blank">
            {{ contactUsText }}
          </a>
          <span>|</span>
          <a href="https://igexporter.net/?utm_source=ig_popup" target="_blank">
            IG Email Exporter
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debug } from '../../utils/logger.js';

export default {
  name: "PopupApp",
  data() {
    return {
      // Static texts
      logoImg: '',
      popupTitle: "Free Instagram Exporter",
      popupDescription: "Export your Instagram followers without any premium restrictions.",
      exportDataText: "Export Data",
      contactUsText: "Contact Us",
      // Local state for controlling the workflow steps
      // Steps: 'login' → 'accountInput' → 'confirm' → 'scraping' → 'complete'
      currentStep: 'login',
      accountInput: ''
    };
  },
  computed: {
    // Retrieve targetAccount and progress from the Vuex store.
    targetAccount() {
      return this.$store.state.targetAccount || '';
    },
    progress() {
      return this.$store.state.progress || { current: 0, total: 0, paused: false };
    },
    progressPercentage() {
      return this.progress.total > 0 ? (this.progress.current / this.progress.total) * 100 : 0;
    },
    // New computed property to retrieve enhanced follower count from Vuex store.
    followersCount() {
      return this.$store.state.followers ? this.$store.state.followers.length : 0;
    }
  },
  mounted() {
    debug("PopupApp mounted.");
    // Load the logo image from the extension's icons folder.
    this.logoImg = chrome.runtime.getURL('icons/logo_128.png');
    debug("Loaded logo image:", this.logoImg);
  },
  methods: {
    confirmLogin() {
      debug("User confirmed login.");
      // Move to the next step: account input.
      this.currentStep = 'accountInput';
    },
    confirmAccount() {
      if (this.accountInput.trim() === '') {
        alert("Please enter a valid account.");
        return;
      }
      // Save target account into the Vuex store.
      this.$store.commit('setTargetAccount', this.accountInput.trim());
      debug("Target account confirmed:", this.accountInput);
      // Proceed to confirmation step.
      this.currentStep = 'confirm';
    },
    startScraping() {
      debug("Starting scraping for account:", this.targetAccount);
      this.$store.commit('setScrapingStarted', true);
      this.currentStep = 'scraping';
      // Dispatch extraction start action with the target account payload.
      this.$store.dispatch('startExtraction', { account: this.targetAccount });
    },
    togglePause() {
      // Toggle the pause state via the Vuex store.
      this.$store.commit('togglePause');
      debug("Toggled pause state. Now paused:", this.progress.paused);
      // Dispatch corresponding actions to pause or resume extraction.
      if (this.progress.paused) {
        this.$store.dispatch('pauseExtraction');
      } else {
        this.$store.dispatch('resumeExtraction');
      }
    },
    goToOptionPage() {
      debug("goToOptionPage clicked. Opening options page...");
      chrome.runtime.openOptionsPage();
    }
  },
  watch: {
    'progress.current'(newVal) {
      if (newVal >= this.progress.total && this.progress.total > 0) {
        debug("Extraction complete. Updating UI state.");
        this.currentStep = 'complete';
      }
    }
  }
};
</script>

<style scoped>
#popup-root {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif;
  text-align: center;
  padding: 20px;
}
.popup-main-content {
  max-width: 400px;
  margin: 0 auto;
}
.popup-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.ig-logo img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.ig-title {
  font-size: 1.5em;
  font-weight: bold;
}
.progress-bar {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #3897f0;
  width: 0%;
  transition: width 0.5s ease;
}
.popup-footer {
  margin-top: 20px;
}
.contact-info a {
  color: #3897f0;
  text-decoration: none;
}
</style>
