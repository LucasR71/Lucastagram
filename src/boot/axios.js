import Vue from "vue";
import axios from "axios";

axios.defaults.headers["Content-Type"] = "application/json; charset=utf-8";

Vue.prototype.$axios = axios;

export { axios };
