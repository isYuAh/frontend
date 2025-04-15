import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Lazy-loading
const HomePage = () => import('@pages/home.vue');
const AboutPage = () => import('@pages/about.vue');
const SignInPage = () => import('@pages/sign-in.vue');
const DashboardHomePage = () => import('@pages/dashboard-home.vue');
const DashboardAdminPage = () => import('@pages/dashboard-admin.vue');
const DashboardActivityPage = () => import('@pages/dashboard-activity.vue');
const DashboardStudentPage = () => import('@pages/dashboard-student.vue');
const QueryTicketPage = () => import('@pages/query-ticket.vue');
const OrgListPage = () => import('@pages/org-list.vue');
const ActivityListPage = () => import('@pages/activity-list.vue');

const routes = [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/sign-in', component: SignInPage },
    { path: '/dashboard', component: DashboardHomePage },
    { path: '/dashboard/admin', component: DashboardAdminPage },
    { path: '/dashboard/activity', component: DashboardActivityPage },
    { path: '/dashboard/student', component: DashboardStudentPage },
    { path: '/query-ticket', component: QueryTicketPage },
    { path: '/org-list', component: OrgListPage },
    { path: '/activity-list', component: ActivityListPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
createApp(App).use(router).mount('#app');
