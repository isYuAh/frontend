<script lang="ts" setup>
import { getStorageItem, setStorageItem } from '@utils/storage';
import { User } from '@models/user';
import { inject } from 'vue';
import Logo from '@components/logo.vue';

const { setMessage } = inject('banner');

const student = JSON.parse(getStorageItem('student') || '{}');
let currentUser = student.name;
if (!currentUser) {
    const admin = JSON.parse(getStorageItem('admin') || '{}');
    currentUser = admin.name;
}

const signOut = async () => {
    if (confirm('确定登出系统？')) {
        setStorageItem('student', '');
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
    <header
        class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 dark:border-gray-700 dark:bg-gray-900"
    >
        <router-link to="/" class="text-primary-800 dark:text-primary-200 flex items-center font-bold select-none">
            <Logo class="h-10 pr-2" />
            <span>| 加分系统</span>
        </router-link>
        <div class="user">
            <template v-if="currentUser">
                <span class="text-sm text-gray-600 dark:text-gray-400">欢迎回来，</span>
                <span class="text-sm font-bold text-gray-800 dark:text-gray-300">{{ currentUser }} | </span>
                <span class="text-primary-800 dark:text-primary-200 cursor-pointer text-sm" @click="signOut">登出</span>
            </template>
            <template v-else>
                <span class="text-sm text-gray-600 dark:text-gray-400">未登录</span>
                <router-link class="text-primary-800 dark:text-primary-200 cursor-pointer text-sm" to="/sign-in">
                    登录
                </router-link>
            </template>
        </div>
    </header>
</template>
