<script setup lang="ts">
import { getStorageItem, setStorageItem } from '@utils/storage';
import { User } from '@models/user';
import { inject } from 'vue';
import Logo from '@components/logo.vue';

const { setMessage } = inject('banner');

const student = JSON.parse(getStorageItem('student') || '{}'),
    currentUser = student.name;

const signOut = async () => {
    if (confirm('确定登出系统？')) {
        setStorageItem('student', '');
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
        <div class="text-primary-800 dark:text-primary-200 flex items-center font-bold">
            <Logo class="h-10 pr-2" />
            <span>| 加分系统</span>
        </div>
        <div class="user">
            <template v-if="currentUser">
                <span class="text-sm text-gray-600 dark:text-gray-400">欢迎回来，</span>
                <span class="text-sm font-bold text-gray-800 dark:text-gray-300">{{ currentUser }} | </span>
                <span @click="signOut" class="text-primary-800 dark:text-primary-200 cursor-pointer text-sm">登出</span>
            </template>
            <template v-else>
                <span class="text-sm text-gray-600 dark:text-gray-400">未登录</span>
                <router-link to="/sign-in" class="text-primary-800 dark:text-primary-200 cursor-pointer text-sm">
                    登录
                </router-link>
            </template>
        </div>
    </div>
</template>
