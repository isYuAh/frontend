import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Lazy-loading
const LoginPage = () => import('@pages/LoginPage.vue');

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
createApp(App).use(router).mount('#app');
