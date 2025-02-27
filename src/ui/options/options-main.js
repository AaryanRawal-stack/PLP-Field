import Vue from 'vue';
import OptionsPage from './optionspage.vue';
import store from './store';
import { debug } from '../../utils/logger.js';

debug("Initializing Vue instance for the inline Options UI.");

new Vue({
  store,
  render: (h) => h(OptionsPage)
}).$mount('#app'); // Change mount target to "#app"

debug("Vue instance mounted to #app successfully.");
