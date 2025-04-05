<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { provide, ref } from 'vue';
import Toast from '@components/toast.vue';
import DashboardSidebar from '@components/dashboard-sidebar.vue';
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
                <app-header />
                <div class="relative flex flex-1 overflow-hidden">
                    <DashboardSidebar />
                    <div class="flex flex-1 flex-col">
                        <router-view class="h-full flex-1 overflow-y-auto px-8" />
                        <app-footer class="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
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
