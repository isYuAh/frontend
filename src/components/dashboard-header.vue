<script setup lang="ts">
import { getStorageItem, setStorageItem } from '@utils/storage';
import { User } from '@models/user';
import { inject } from 'vue';
import Logo from '@components/logo.vue';

const { setMessage } = inject('banner');

const admin = JSON.parse(getStorageItem('admin') || '{}'),
    currentUser = admin.name;

if (!currentUser) {
    window.location.href = '/sign-in';
}

const signOut = async () => {
    if (confirm('确定登出系统？')) {
        setStorageItem('admin', '');
        if (await User.signOut({ serverEndpoint: 'http://127.0.0.1/api' })) {
            setMessage({ message: '已登出', type: 'success' });
            setTimeout(() => {
                window.location.href = '/sign-in';
            }, 3000);
        }
    }
};
</script>

<template>
    <div class="flex items-center justify-between border-b border-gray-200 px-8 py-4 dark:border-gray-700">
        <div draggable="false" class="text-primary-800 dark:text-primary-200 flex items-center font-bold select-none">
            <Logo class="h-10 pr-2" />
            <span>| 加分系统</span>
        </div>
        <div class="user">
            <span class="text-sm text-gray-600 dark:text-gray-400">欢迎回来，</span>
            <span class="text-sm font-bold text-gray-800 dark:text-gray-300">{{ currentUser }} | </span>
            <span @click="signOut" class="text-primary-800 dark:text-primary-200 cursor-pointer text-sm">登出</span>
        </div>
    </div>
</template>
