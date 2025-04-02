import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Lazy-loading
const SignInPage = () => import('@pages/sign-in.vue');
const DashboardHomePage = () => import('@pages/dashboard-home.vue');
const DashboardAdminPage = () => import('@pages/dashboard-admin.vue');
const DashboardActivityPage = () => import('@pages/dashboard-activity.vue');
const DashboardStudentPage = () => import('@pages/dashboard-student.vue');
const QueryTicketPage = () => import('@pages/query-ticket.vue');

const routes = [
    { path: '/sign-in', component: SignInPage },
    { path: '/dashboard', component: DashboardHomePage },
    { path: '/dashboard/admin', component: DashboardAdminPage },
    { path: '/dashboard/activity', component: DashboardActivityPage },
    { path: '/dashboard/student', component: DashboardStudentPage },
    { path: '/query-ticket', component: QueryTicketPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
createApp(App).use(router).mount('#app');
