<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { provide, ref } from 'vue';
import Toast from '@components/toast.vue';
import DashboardSidebar from '@components/dashboard-sidebar.vue';
import DashboardHeader from '@components/dashboard-header.vue';
import AppHeader from '@components/app-header.vue';
import AppFooter from '@components/app-footer.vue';

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
    <transition name="fade">
        <Toast
            v-if="bannerMessage"
            :message="bannerMessage.message"
            :type="bannerMessage.type"
            @close="setBannerMessage(null)"
        />
    </transition>

    <template v-if="isSignInPage()">
        <transition name="fade">
            <router-view />
        </transition>
    </template>

    <template v-else-if="isDashboardPage()">
        <transition name="fade">
            <div class="flex h-screen flex-col">
                <DashboardHeader />
                <div class="relative flex flex-1">
                    <DashboardSidebar class="absolute" />
                    <router-view class="ml-22 h-full border-l border-gray-200 p-8 dark:border-gray-700" />
                </div>
            </div>
        </transition>
    </template>

    <template v-else>
        <transition name="fade">
            <div class="flex min-h-screen flex-col">
                <app-header />
                <main class="flex-1">
                    <router-view />
                </main>
                <app-footer />
            </div>
        </transition>
    </template>
</template>

<style scoped></style>
