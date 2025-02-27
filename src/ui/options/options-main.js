import Vue from 'vue';
import OptionsPage from './optionspage.vue';
import store from './store';
import { debug } from '../../utils/logger.js';

debug("Initializing Vue instance for the Options Page.");

new Vue({
  store,
  render: (h) => h(OptionsPage)
}).$mount('#app');

debug("Vue instance mounted to #app successfully for the Options Page.");
