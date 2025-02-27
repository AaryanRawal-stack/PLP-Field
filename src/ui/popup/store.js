import Vue from 'vue';
import Vuex from 'vuex';
import { sendMessageToBackground } from './messaging';
import { debug, error } from '../../utils/logger.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    targetAccount: '',
    scrapingStarted: false,
    progress: { current: 0, total: 0, paused: false },
    error: null,
    // New state property to hold enhanced follower objects.
    followers: []
  },
  mutations: {
    setTargetAccount(state, account) {
      state.targetAccount = account;
      debug("Popup Store: setTargetAccount", account);
    },
    setScrapingStarted(state, started) {
      state.scrapingStarted = started;
      debug("Popup Store: setScrapingStarted", started);
    },
    updateProgress(state, progress) {
      state.progress.current = progress.current;
      state.progress.total = progress.total;
      debug("Popup Store: updateProgress", progress);
    },
    scrapingComplete(state, progress) {
      state.progress.current = progress.current;
      state.progress.total = progress.total;
      state.scrapingStarted = false;
      debug("Popup Store: scrapingComplete", progress);
    },
    handleError(state, err) {
      state.error = err;
      state.scrapingStarted = false;
      error("Popup Store: handleError", err);
    },
    togglePause(state) {
      state.progress.paused = !state.progress.paused;
      debug("Popup Store: togglePause, new pause state:", state.progress.paused);
    },
    // New mutation to update the followers array.
    setFollowers(state, followers) {
      state.followers = followers;
      debug("Popup Store: setFollowers", followers);
    }
  },
  actions: {
    startExtraction({ commit, state }) {
      debug("Popup Store Action: startExtraction for account", state.targetAccount);
      sendMessageToBackground('startExtraction', { account: state.targetAccount });
    },
    pauseExtraction({ commit, state }) {
      debug("Popup Store Action: pauseExtraction for account", state.targetAccount);
      sendMessageToBackground('pauseExtraction', { account: state.targetAccount });
    },
    resumeExtraction({ commit, state }) {
      debug("Popup Store Action: resumeExtraction for account", state.targetAccount);
      sendMessageToBackground('resumeExtraction', { account: state.targetAccount });
    },
    // New action to commit enhanced follower objects to the state.
    updateFollowers({ commit }, followers) {
      commit('setFollowers', followers);
    }
  }
});
