<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, provide } from 'vue';
import Toast from '@components/toast.vue';

const route = useRoute();
const isLoginPage = () => route.path === '/login';

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

    <template v-if="isLoginPage()">
        <router-view />
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
