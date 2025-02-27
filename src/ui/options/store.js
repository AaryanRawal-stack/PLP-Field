import Vue from 'vue';
import Vuex from 'vuex';
import * as messaging from '../popup/messaging';
import { debug, error } from '../../utils/logger.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userUrl: '',
    intervalSec: 5,
    exportType: 'followers',
    IsDetail: false,
    runningStat: 0, // 0: stopped, 1: in progress, 2: cooling down, 3: finished
    errorMessage: '',
    coolDownSec: 0,
    totalProfiles: 0,
    foundProfiles: 0,
    followers: [],
    subPlan: "PRO",
    email: "",
    progress: { current: 0, total: 0, paused: false },
    instagramTabId: null,
  },
  mutations: {
    setUserUrl(state, url) { state.userUrl = url; },
    setIntervalSec(state, sec) { state.intervalSec = sec; },
    setExportType(state, type) { state.exportType = type; },
    setIsDetail(state, detail) { state.IsDetail = detail; },
    setRunningStat(state, status) { state.runningStat = status; },
    setErrorMessage(state, message) { state.errorMessage = message; },
    setTotalProfiles(state, count) { state.totalProfiles = count; },
    setFoundProfiles(state, count) { state.foundProfiles = count; },
    setFollowers(state, followers) { state.followers = followers; },
    setFoundProfiles(state, count) { state.foundProfiles = count; },
    updateProgress(state, progressData) {
      if (!progressData || typeof progressData !== "object") {
        console.error("❌ Invalid updateProgress data:", progressData);
        return;
      }
      if (typeof progressData.current !== "number" || typeof progressData.total !== "number") {
        console.error("❌ Missing or invalid progress values:", progressData);
        return;
      }
      state.progress.current = progressData.current;
      state.progress.total = progressData.total;
      console.log("✅ Progress updated:", state.progress);
    },
    resetProgress(state) { state.progress = { current: 0, total: 0, paused: false }; },
    togglePause(state) { state.progress.paused = !state.progress.paused; },
    setInstagramTabId(state, tabId) { state.instagramTabId = tabId; },
  },
  actions: {
    startExtraction({ commit, state }) {
      debug("[Vuex Action - Options Page] startExtraction dispatched");
      commit('resetProgress');
      messaging.sendMessageToBackground('startExtraction', {
        action: 'startExtraction',
        payload: { account: state.userUrl }
      });
      commit('setRunningStat', 1);
    },
    pauseExtraction({ commit }) {
      debug("[Vuex Action - Options Page] pauseExtraction dispatched");
      messaging.sendMessageToBackground('pauseExtraction');
      commit('togglePause');
      commit('setRunningStat', 2);
    },
    resumeExtraction({ commit }) {
      debug("[Vuex Action - Options Page] resumeExtraction dispatched");
      messaging.sendMessageToBackground('resumeExtraction');
      commit('togglePause');
      commit('setRunningStat', 1);
    },
    exportCSV({ state }) {
      debug("[Vuex Action - Options Page] exportCSV dispatched");
      messaging.sendMessageToBackground('exportCSV', { payload: {} }, (response) => {
        if (chrome.runtime.lastError) {
          error("[Vuex] Failed to send exportCSV message:", chrome.runtime.lastError);
          return;
        }
        if (!response || response.code !== 200) {
          error("[Vuex] exportCSV request failed. Response:", response);
        } else {
          debug("[Vuex] exportCSV request succeeded.");
        }
      });
    },
    fetchFollowers({ commit }) {
      debug("[Vuex Action - Options Page] fetchFollowers dispatched");
      chrome.storage.local.get(["exportedFollowers"], (res) => {
        if (chrome.runtime.lastError) {
          error("Error fetching exportedFollowers from storage:", chrome.runtime.lastError);
          commit('setErrorMessage', chrome.runtime.lastError.message);
          return;
        }
        const followers = res.exportedFollowers || [];
        debug("[Vuex Action - Options Page] Fetched followers count:", followers.length);
        commit('setFollowers', followers);
        commit('setFoundProfiles', followers.length);
      });
    },
    updateProgressAction({ commit }, progressData) {
      // This action commits the updateProgress mutation.
      commit("updateProgress", progressData);
      console.log("✅ updateProgressAction dispatched with:", progressData);
    },
    setTotalProfilesAction({ commit }, totalProfiles) {
      commit('setTotalProfiles', totalProfiles);
    },
    setFoundProfilesAction({ commit }, foundProfiles) {
      commit('setFoundProfiles', foundProfiles);
    },
    setErrorMessageAction({ commit }, errorMessage) {
      commit('setErrorMessage', errorMessage);
    },
    setRunningStatAction({ commit }, runningStat) {
      commit('setRunningStat', runningStat);
    },
    setInstagramTabIdAction({ commit }, tabId) {
      commit('setInstagramTabId', tabId);
    },
  },
  plugins: [
    store => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateProgress') {
          store.dispatch('updateProgressAction', request.data);
        } else if (request.action === 'setInstagramTabId') {
          store.dispatch('setInstagramTabIdAction', request.payload.tabId);
        }
        // For asynchronous responses, ensure you return true.
        return true;
      });
    }
  ]
});
