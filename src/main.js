import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import AmplifyVue from '@aws-amplify/ui-vue';

const app = createApp(App);

app.use(createPinia());
app.use(AmplifyVue);

app.mount("#app");
