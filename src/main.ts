import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Lazy-loading
const SignInPage = () => import('@pages/sign-in.vue');

const routes = [
  { path: '/sign-in', component: SignInPage },
  { path: '/', redirect: '/sign-in' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
createApp(App).use(router).mount('#app');
