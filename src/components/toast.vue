<script lang="ts" setup>
import { computed } from 'vue';

interface ToastProps {
    type: 'error' | 'success' | 'info';
    message: string;
}

const toastMappings = {
    error: {
        toastStyles: 'bg-red-50 dark:bg-red-950',
        iconStyles: 'text-red-700 dark:text-red-400',
        icon: 'error',
    },
    success: {
        toastStyles: 'bg-green-50 dark:bg-green-950',
        iconStyles: 'text-green-700 dark:text-green-400',
        icon: 'check_circle',
    },
    info: {
        toastStyles: 'bg-blue-50 dark:bg-blue-950',
        iconStyles: 'text-blue-700 dark:text-blue-400',
        icon: 'info',
    },
};

const message = defineProps<ToastProps>();

const bannerClass = computed(() => {
        return `${toastMappings[message.type].toastStyles} fixed top-4 left-1/2 z-50 flex -translate-x-1/2 rounded-xl bg-gray-200 px-3 pt-1.5 pb-1.5 font-bold shadow-lg dark:bg-gray-800`;
    }),
    bannerIconClass = computed(() => {
        return `${toastMappings[message.type].iconStyles} material-symbols-rounded mr-4 h-5 w-5 rounded p-1.5 align-middle`;
    }),
    bannerIcon = computed(() => {
        return toastMappings[message.type].icon;
    });

const emit = defineEmits(['close']);
</script>

<template>
    <div v-if="!message"></div>
    <div v-else :class="bannerClass">
        <p class="m-0 mr-3 flex h-9 flex-1 truncate leading-9">
            <span :class="bannerIconClass">
                {{ bannerIcon }}
            </span>
            <span>{{ message.message }}</span>
        </p>
        <span
            class="material-symbols-rounded mr-4 box-content h-5 w-5 cursor-pointer rounded-full p-1.5 align-middle hover:text-black dark:hover:text-white"
            @click="emit('close')"
        >
            close
        </span>
    </div>
</template>
