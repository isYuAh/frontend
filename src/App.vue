<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, provide } from 'vue';
import Toast from '@components/toast.vue';
import DashboardSidebar from '@components/dashboard-sidebar.vue';
import DashboardHeader from '@components/dashboard-header.vue';

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
        <DashboardHeader />
        <div class="flex">
            <DashboardSidebar />
            <router-view class="flex-1 p-8" />
        </div>
    </template>

    <template v-else>
        <div class="container mx-auto py-4 text-center">
            <!-- TODO: Header -->
            <div class="nav-links"></div>
            <router-view />
        </div>
    </template>
</template>

<style scoped></style>
