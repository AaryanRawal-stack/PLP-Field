/*! For license information please see content-script.js.LICENSE.txt */
(()=>{"use strict";function t(){for(var t,e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];(t=console).log.apply(t,["[DEBUG]"].concat(r))}function e(){for(var t,e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];(t=console).warn.apply(t,["[WARN]"].concat(r))}function r(){for(var t,e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];(t=console).error.apply(t,["[ERROR]"].concat(r))}var n=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:15e3;return new Promise((function(n,o){var a=setInterval((function(){var e=document.querySelector(t);e&&(clearInterval(a),n(e))}),500);setTimeout((function(){clearInterval(a);var e="Element not found: ".concat(t);r(e),o(e)}),e)}))},o=function(n,a,c,i,u){if(t("continuousScrollCycle: Starting a new scroll cycle."),document.querySelector(n)){var l=Date.now();t("continuousScrollCycle: Cycle ID ".concat(l," started."));var s=Date.now(),f=new Map,d=setInterval((function(){if(window.extractionPaused)return clearInterval(d),void t("continuousScrollCycle: Cycle ID ".concat(l," detected pause; interval cleared."));t("continuousScrollCycle: Cycle ID ".concat(l," scrolling..."));var h=document.querySelector(n);h&&(h.scrollTop=h.scrollHeight),function(n){var o=document.querySelectorAll(n);t("extractFollowers: Found ".concat(o.length," follower elements using selector: ").concat(n));var a=new Map;return o&&0!==o.length?(o.forEach((function(e){var n=e.innerText.trim();if(!n&&e.getAttribute("href")){var o=e.getAttribute("href");n=o.split("/")[1]}if(n&&!a.has(n)){t("extractFollowers: Extracted username: ".concat(n));var c={username:n,isPrivate:null};a.set(n,c),t("extractFollowers: Calling fetchUserPrivacyStatus for ".concat(n)),Promise.resolve("not found").then((function(e){c.isPrivate=e,t("extractFollowers: Updated privacy status for ".concat(n,": ").concat(e))})).catch((function(t){r("extractFollowers: Error fetching privacy status for ".concat(n,": ").concat(t))}))}})),a):(e("No new followers found."),a)}(a).forEach((function(e,r){f.has(r)||(f.set(r,e),t("continuousScrollCycle: Cycle ID ".concat(l," - New username stored: ").concat(r)))}));var p=f.size;if(t("continuousScrollCycle: Cycle ID ".concat(l," - Accumulated follower count: ").concat(p)),"function"==typeof i&&void 0!==u&&i(p),Date.now()-s>3e4){if(clearInterval(d),function(){for(var t,e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];(t=console).info.apply(t,["[INFO]"].concat(r))}("continuousScrollCycle: Cycle ID ".concat(l," - Stopped after 30 seconds")),"function"==typeof c){var y=Array.from(f.values());t("continuousScrollCycle: Cycle ID ".concat(l," - Calling updateUserCallback with ").concat(y.length," followers.")),c(y)}setTimeout((function(){window.extractionPaused?t("continuousScrollCycle: Cycle ID ".concat(l," - Extraction paused; not restarting cycle.")):(t("continuousScrollCycle: Cycle ID ".concat(l," - Restarting cycle.")),o(n,a,c,i,u))}),3e4)}}),1e3)}else r("continuousScrollCycle: Scroll container not found.")};function a(t){return a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a(t)}function c(){c=function(){return e};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value},i="function"==typeof Symbol?Symbol:{},u=i.iterator||"@@iterator",l=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function f(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{f({},"")}catch(t){f=function(t,e,r){return t[e]=r}}function d(t,e,r,n){var a=e&&e.prototype instanceof w?e:w,c=Object.create(a.prototype),i=new O(n||[]);return o(c,"_invoke",{value:I(t,r,i)}),c}function h(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=d;var p="suspendedStart",y="suspendedYield",v="executing",g="completed",m={};function w(){}function x(){}function b(){}var E={};f(E,u,(function(){return this}));var S=Object.getPrototypeOf,L=S&&S(S(_([])));L&&L!==r&&n.call(L,u)&&(E=L);var k=b.prototype=w.prototype=Object.create(E);function C(t){["next","throw","return"].forEach((function(e){f(t,e,(function(t){return this._invoke(e,t)}))}))}function P(t,e){function r(o,c,i,u){var l=h(t[o],t,c);if("throw"!==l.type){var s=l.arg,f=s.value;return f&&"object"==a(f)&&n.call(f,"__await")?e.resolve(f.__await).then((function(t){r("next",t,i,u)}),(function(t){r("throw",t,i,u)})):e.resolve(f).then((function(t){s.value=t,i(s)}),(function(t){return r("throw",t,i,u)}))}u(l.arg)}var c;o(this,"_invoke",{value:function(t,n){function o(){return new e((function(e,o){r(t,n,e,o)}))}return c=c?c.then(o,o):o()}})}function I(e,r,n){var o=p;return function(a,c){if(o===v)throw Error("Generator is already running");if(o===g){if("throw"===a)throw c;return{value:t,done:!0}}for(n.method=a,n.arg=c;;){var i=n.delegate;if(i){var u=N(i,n);if(u){if(u===m)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===p)throw o=g,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=v;var l=h(e,r,n);if("normal"===l.type){if(o=n.done?g:y,l.arg===m)continue;return{value:l.arg,done:n.done}}"throw"===l.type&&(o=g,n.method="throw",n.arg=l.arg)}}}function N(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,N(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),m;var a=h(o,e.iterator,r.arg);if("throw"===a.type)return r.method="throw",r.arg=a.arg,r.delegate=null,m;var c=a.arg;return c?c.done?(r[e.resultName]=c.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,m):c:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,m)}function A(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function F(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function O(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(A,this),this.reset(!0)}function _(e){if(e||""===e){var r=e[u];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,c=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return c.next=c}}throw new TypeError(a(e)+" is not iterable")}return x.prototype=b,o(k,"constructor",{value:b,configurable:!0}),o(b,"constructor",{value:x,configurable:!0}),x.displayName=f(b,s,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===x||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,b):(t.__proto__=b,f(t,s,"GeneratorFunction")),t.prototype=Object.create(k),t},e.awrap=function(t){return{__await:t}},C(P.prototype),f(P.prototype,l,(function(){return this})),e.AsyncIterator=P,e.async=function(t,r,n,o,a){void 0===a&&(a=Promise);var c=new P(d(t,r,n,o),a);return e.isGeneratorFunction(r)?c:c.next().then((function(t){return t.done?t.value:c.next()}))},C(k),f(k,s,"Generator"),f(k,u,(function(){return this})),f(k,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},e.values=_,O.prototype={constructor:O,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(F),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return i.type="throw",i.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var a=this.tryEntries.length-1;a>=0;--a){var c=this.tryEntries[a],i=c.completion;if("root"===c.tryLoc)return o("end");if(c.tryLoc<=this.prev){var u=n.call(c,"catchLoc"),l=n.call(c,"finallyLoc");if(u&&l){if(this.prev<c.catchLoc)return o(c.catchLoc,!0);if(this.prev<c.finallyLoc)return o(c.finallyLoc)}else if(u){if(this.prev<c.catchLoc)return o(c.catchLoc,!0)}else{if(!l)throw Error("try statement without catch or finally");if(this.prev<c.finallyLoc)return o(c.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var a=o;break}}a&&("break"===t||"continue"===t)&&a.tryLoc<=e&&e<=a.finallyLoc&&(a=null);var c=a?a.completion:{};return c.type=t,c.arg=e,a?(this.method="next",this.next=a.finallyLoc,m):this.complete(c)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),m},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),F(r),m}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;F(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:_(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),m}},e}function i(t,e,r,n,o,a,c){try{var i=t[a](c),u=i.value}catch(t){return void r(t)}i.done?e(u):Promise.resolve(u).then(n,o)}function u(t){return function(){var e=this,r=arguments;return new Promise((function(n,o){var a=t.apply(e,r);function c(t){i(a,n,o,c,u,"next",t)}function u(t){i(a,n,o,c,u,"throw",t)}c(void 0)}))}}!function(){t("Enhanced Content Script loaded with extraction utils");var a="div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja",i="div[role='dialog'] a[href]",l=0;window.extractionPaused=!1;var s=function(){var e=u(c().mark((function e(n){return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n&&0!==n.length){e.next=3;break}return t("❌ No new followers extracted; skipping update."),e.abrupt("return");case 3:return t("📤 Sending extracted followers to background script:",n),e.abrupt("return",new Promise((function(e){chrome.runtime.sendMessage({action:"export_followers",data:n},(function(n){chrome.runtime.lastError?(r("❌ Message failed:",chrome.runtime.lastError),e(!1)):(t("✅ Background response to 'export_followers':",n),e(!0))}))})));case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),f=function(){var e=u(c().mark((function e(){return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t("🚀 startExtraction() called."),!window.extractionPaused){e.next=4;break}return t("Extraction is currently paused. Not starting extraction cycle."),e.abrupt("return");case 4:return e.prev=4,e.next=7,new Promise((function(e,o){n("a[href*='/followers/'] span",15e3).then((function(n){var a=n.innerText.replace(/,/g,"").trim(),c=parseInt(a,10);isNaN(c)?(r("Unable to parse follower count."),o("Unable to parse follower count.")):(t("Total followers detected: ".concat(l=c)),e())})).catch((function(t){r("Follower count element not found.",t),o(t)}))}));case 7:if(0!==l){e.next=10;break}return r("❌ Total follower count is zero. Aborting."),e.abrupt("return");case 10:if(c=void 0,u=void 0,f=void 0,(f=document.querySelector("a[href*='/followers/']"))?(c=f,u=new MouseEvent("click",{view:window,bubbles:!0,cancelable:!0}),c.dispatchEvent(u),t("Followers link clicked to open modal."),1):(r("Followers link not found."),0)){e.next=12;break}return e.abrupt("return");case 12:return e.next=14,n("div[role='dialog']",15e3);case 14:t("✅ Followers modal detected. Now starting continuousScrollCycle..."),o(a,i,s,(function(e){chrome.runtime.sendMessage({action:"updateProgress",data:{current:e,total:l}},(function(e){t("✅ Background response to updateProgress:",e)})),t("📊 Progress update sent: ".concat(e," / ").concat(l))}),l),e.next=21;break;case 18:e.prev=18,e.t0=e.catch(4),r("❌ Extraction process failed:",e.t0);case 21:t("✅ startExtraction() finished.");case 22:case"end":return e.stop()}var c,u,f}),e,null,[[4,18]])})));return function(){return e.apply(this,arguments)}}();chrome.runtime.onMessage.addListener((function(e,n,c){t("Message received in content script:",e);try{if("startExtraction"===e.action)return t("Action 'startExtraction' received."),f(),c({status:"extraction started"}),!0;if("pauseExtraction"===e.action)return t("Action 'pauseExtraction' received."),window.extractionPaused=!0,t("Extraction paused."),c({status:"extraction paused"}),!0;if("resumeExtraction"===e.action){if(t("Action 'resumeExtraction' received."),window.extractionPaused)return window.extractionPaused=!1,t("Resuming extraction."),o(a,i,s,(function(e){chrome.runtime.sendMessage({action:"updateProgress",data:{current:e,total:l}},(function(e){t("✅ Background response to updateProgress:",e)})),t("📊 Progress update sent: ".concat(e," / ").concat(l))}),l),c({status:"extraction resumed"}),t("Response 'extraction resumed' sent."),!0;t("Resume requested but extraction not paused.")}}catch(t){r("Error in content script message listener:",t)}t("Message listener completed.")})),chrome.runtime&&chrome.runtime.sendMessage?chrome.runtime.sendMessage({action:"contentScriptLoaded",status:"ready"},(function(e){t("Content script ready message sent to background script. Response:",e)})):e("chrome.runtime.sendMessage not available. Are you in a content script context?");var d=function(){/^https:\/\/(www\.)?instagram\.com\/([^/?#]+)\/?$/.test(window.location.href)?(t("Valid profile page detected. Initializing extraction."),function(){var e=document.querySelector("header")||document.body;if(e){var n=document.createElement("button");n.innerText="Extract Followers",n.style.position="fixed",n.style.bottom="20px",n.style.right="20px",n.style.zIndex="9999",n.style.padding="10px 20px",n.style.backgroundColor="#3897f0",n.style.color="#fff",n.style.border="none",n.style.borderRadius="5px",n.style.cursor="pointer",n.addEventListener("click",(function(){t("Manual trigger clicked. Starting extraction..."),f()})),e.appendChild(n),t("Manual trigger button injected.")}else r("No container found to inject the manual trigger button.")}()):t("Not a valid profile page. Extraction not initialized.")};"loading"===document.readyState?document.addEventListener("DOMContentLoaded",d):d()}()})();