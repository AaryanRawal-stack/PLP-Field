<template>
  <div id="option-root">
    <div class="option-main">
      <h2 class="title">Progress and Controls</h2>

      <div class="stat-board">
        <div class="stat-row">
          <span class="left">Currently Extracting:</span>
          <span class="right">{{ currentTargetAccount }}</span>
        </div>
        <div class="stat-row">
          <span class="left">Unique Extractions:</span>
          <span class="right">{{ progress.current }}</span>
        </div>
        <div class="stat-row">
          <span class="left">Enhanced Followers Stored:</span>
          <span class="right">{{ followers.length }}</span>
        </div>
        <div class="stat-row stat-last">
          <span class="left">Extractions Remaining:</span>
          <span class="right">{{ progress.total - progress.current }}</span>
        </div>
      </div>

      <p>Extraction Status: <strong>{{ extractionStatus }}</strong></p>

      <div class="button-wrap">
        <button class="option-button blue-button" @click="sendPauseMessage" :disabled="isPaused">
          Pause Extraction
        </button>
        <button class="option-button blue-button" @click="sendResumeMessage" :disabled="!isPaused">
          Resume Extraction
        </button>
        <button class="export-button-left" @click="exportCsvData" :disabled="followers.length === 0">
          {{ followers.length === 0 ? "Followers not ready for export yet" : "Export CSV" }}
        </button>
        <div class="reset-section">
          <button @click="handleReset">{{ resetButtonText }}</button>
          <input 
            v-if="showConfirmInput" 
            v-model="confirmInput"
            placeholder="Type RESET to confirm"
            class="confirm-input"
          />
          <p class="reset-message">{{ resetMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debug, error } from '../../utils/logger.js';

export default {
  name: "OptionsPageSimplified",
  data() {
    return {
      currentTargetAccount: '',
      isPaused: false,
      showConfirmInput: false,
      confirmInput: "",
      resetMessage: "",
      resetButtonText: "End/Reset",
      
    };
  },
  computed: {
    progress() {
      return this.$store.state.progress;
    },
    followers() {
      return this.$store.state.followers || [];
    },
    extractionStatus() {
      return this.isPaused ? "Paused" : "Running";
    }
  },
  methods: {
    sendPauseMessage() {
      debug("[OptionsPage] Pause button clicked.");
      chrome.runtime.sendMessage({ action: "pauseExtraction" }, (response) => {
        if (chrome.runtime.lastError) {
          error("[OptionsPage] Pause request failed:", chrome.runtime.lastError);
        } else {
          debug("[OptionsPage] Pause request sent successfully. Response:", response);
          this.isPaused = true;
        }
      });
    },
    sendResumeMessage() {
      debug("[OptionsPage] Resume button clicked.");
      chrome.runtime.sendMessage({ action: "resumeExtraction" }, (response) => {
        if (chrome.runtime.lastError) {
          error("[OptionsPage] Resume request failed:", chrome.runtime.lastError);
        } else {
          debug("[OptionsPage] Resume request sent successfully. Response:", response);
          this.isPaused = false;
        }
      });
    },
    startExtraction() {
      debug("[OptionsPage] Start Extraction button clicked.");
      chrome.runtime.sendMessage({ action: "startExtraction", payload: { account: this.newUsername } }, (response) => {
       if (chrome.runtime.lastError) {
        error("[OptionsPage] Start Extraction request failed:", chrome.runtime.lastError);
    }   else {
      debug("[OptionsPage] Start Extraction request sent successfully. Response:", response);
      // Force a reload of the options page after a successful extraction start.
      window.location.reload();
     }
     });
    },
    exportCsvData() {
      debug("[OptionsPage] Export CSV button clicked.");
      this.$store.dispatch('exportCSV')
        .then(() => {
          debug("[OptionsPage] Export request sent successfully.");
        })
        .catch((err) => {
          error("[OptionsPage] Export request failed:", err);
        });
    },
    fetchCurrentTargetAccount() {
      // Note: Corrected "ge.local.get" to "chrome.storage.local.get"
      chrome.storage.local.get(["currentTargetAccount", "extractionPaused"], (result) => {
        this.currentTargetAccount = result.currentTargetAccount || '';
        this.isPaused = result.extractionPaused || false;
        debug("[OptionsPage] Retrieved currentTargetAccount and pause status from storage:", this.currentTargetAccount, this.isPaused);
      });
    },
    handleReset() {
      if (!this.showConfirmInput) {
        // First click: Show input field and ask for confirmation.
        this.showConfirmInput = true;
        this.resetMessage = `Resetting stops extraction and clears all stored data. Please save your progress using the Export CSV button before proceeding. Are you sure you want to continue? This cannot be undone. Type in "Reset" to confirm.`;
        this.resetButtonText = "Confirm Reset";
      } else {
        // Second click: Validate the confirmation input.
        if (this.confirmInput.trim() === "Reset") {
          // Instead of clearing all storage immediately, send the stopExtraction message
          chrome.runtime.sendMessage({ action: "stopExtraction" }, (response) => {
            // Optionally, you can clear additional keys if needed here
            // chrome.storage.local.remove(["currentTargetAccount", "extractionPaused"], () => {});
            this.resetMessage = "✅ Reset complete. To extract another account, click on the extension.";
            this.showConfirmInput = false;
            this.confirmInput = "";
            this.resetButtonText = "End/Reset";
            this.isPaused = false;
          });
        } else {
          // If the input is not exactly "Reset", show an error message.
          this.resetMessage = "❌ Reset failed. You must type 'Reset' exactly.";
          this.confirmInput = "";
        }
      }
    },
  },
  mounted() {
    debug("[OptionsPage] Component mounted.");
    this.fetchCurrentTargetAccount();
    this.$store.dispatch('fetchFollowers'); // Fetch initial followers from storage

    // Listen for changes in chrome.storage to update the followers list reactively.
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.exportedFollowers) {
        const newFollowers = changes.exportedFollowers.newValue || [];
        this.$store.commit('setFollowers', newFollowers);
        this.$store.commit('setFoundProfiles', newFollowers.length);
        debug("[OptionsPage] Updated followers from storage change:", newFollowers.length);
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateProgress') {
        debug("[OptionsPage] Received updateProgress message:", request.data);
        if (this.$store.dispatch) {
          this.$store.dispatch('updateProgressAction', request.data)
            .catch(err => error("[OptionsPage] updateProgress dispatch error:", err));
        } else {
          error("[OptionsPage] Vuex store dispatch is undefined.");
        }
      }

      if (request.action === 'updatePausedStatus') {
        this.isPaused = request.data.isPaused;
      }

      sendResponse({ status: "message received" });
      return true;
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if (changes.exportedFollowers) {
      const newFollowers = changes.exportedFollowers.newValue || [];
      this.$store.commit('setFollowers', newFollowers);
      this.$store.commit('setFoundProfiles', newFollowers.length);
      debug("[OptionsPage] Updated followers from storage change:", newFollowers.length);
    }
    if (changes.currentTargetAccount) {
      this.currentTargetAccount = changes.currentTargetAccount.newValue || "";
      debug("[OptionsPage] Updated currentTargetAccount from storage change:", this.currentTargetAccount);
    }
  }
});
  }
};
</script>

<style scoped>
#option-root { font-family: sans-serif; padding: 20px; }
.option-main { max-width: 600px; margin: 0 auto; }
.title { font-size: 1.8em; margin-bottom: 20px; text-align: center; }
.stat-board { border: 1px solid #ccc; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
.stat-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #eee; }
.stat-row.stat-last { border-bottom: none; }
.left { font-weight: bold; }
.right { text-align: right; }
.button-wrap { display: flex; justify-content: space-around; }
.option-button, .export-button-left { padding: 10px 15px; border-radius: 5px; border: none; color: white; background-color: #007bff; cursor: pointer; }
.export-button-left { background-color: #28a745; }
.option-button:hover, .export-button-left:hover { background-color: #0056b3; }
.reset-section {
  margin-top: 20px;
  text-align: center;
}
.confirm-input {
  margin-top: 10px;
  padding: 5px;
  border: 2px solid red;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
}
.reset-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
</style>
