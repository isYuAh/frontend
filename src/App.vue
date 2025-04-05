<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { provide, ref } from 'vue';
import Toast from '@components/toast.vue';
import DashboardSidebar from '@components/dashboard-sidebar.vue';
import DashboardHeader from '@components/dashboard-header.vue';
import AppHeader from '@components/app-header.vue';

const route = useRoute();
const isSignInPage = () => route.path === '/sign-in';
const isDashboardPage = () => route.path.startsWith('/dashboard');

interface ToastProps {
    type: 'error' | 'success' | 'info';
    message: string;
}

const bannerMessage = ref<ToastProps | null>(null);
const setBannerMessage = (msg: ToastProps | null) => {
    bannerMessage.value = msg;
    setTimeout(() => {
        bannerMessage.value = null;
    }, 3000);
};

provide('banner', {
    message: bannerMessage,
    setMessage: setBannerMessage,
});
</script>

<template>
    <Toast
        v-if="bannerMessage"
        :message="bannerMessage.message"
        :type="bannerMessage.type"
        @close="setBannerMessage(null)"
    />

    <template v-if="isSignInPage()">
        <router-view />
    </template>

    <template v-else-if="isDashboardPage()">
        <div class="flex h-screen flex-col">
            <DashboardHeader />
            <div class="relative flex flex-1">
                <DashboardSidebar class="absolute" />
                <router-view class="ml-22 h-full border-l border-gray-200 p-8 dark:border-gray-700" />
            </div>
        </div>
    </template>

    <template v-else>
        <AppHeader />
        <router-view />
    </template>
</template>

<style scoped></style>
