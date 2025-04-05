<script setup lang="ts">
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { setTitle } from '@utils/title';
import { Admin, User } from '@models/user';
import { setCookie } from '@utils/cookie';
import { setStorageItem } from '@utils/storage';

import TextInput from '@components/input-text.vue';
import Spinner from '@components/spinner.vue';
import Logo from '@components/logo.vue';

const { setMessage } = inject('banner');

setTitle('登录');

const router = useRouter();
const loading = ref(false);

interface SignInFormData {
    name: string;
    password: string;
}

const formData = defineModel<SignInFormData>('formData', {
    default: {
        name: '',
        password: '',
    },
});

const handleSubmit = async () => {
    loading.value = true;

    try {
        const result = await Admin.signInAdmin(formData.value, { serverEndpoint: 'http://localhost/api' });

        // localhost env will prevent the browser from setting a persistent cookie
        // so we need to set the cookie manually
        if (window.location.host === '127.0.0.1:5173' || window.location.host === 'localhost:5173') {
            setCookie('token', result.token);
        }

        setStorageItem('admin', JSON.stringify(result.admin));

        setMessage({
            type: 'success',
            message: '登录成功',
        });
        setTimeout(() => {
            router.push('/dashboard');
        }, 3000);
    } catch (error) {
        setMessage({
            type: 'error',
            message: error instanceof Error ? error.message : '登录失败，请检查账号和密码',
        });
        loading.value = false;
    }
};

const handleOAuth2Submit = async () => {
    try {
        const result = await User.signInOAuth2('2023212276', { serverEndpoint: 'http://127.0.0.1/api' });

        // localhost env will prevent the browser from setting a persistent cookie
        // so we need to set the cookie manually
        if (window.location.host === '127.0.0.1:5173' || window.location.host === 'localhost:5173') {
            setCookie('token', result.token);
        }

        if (result.student) {
            setStorageItem('student', JSON.stringify(result.student));
        } else {
            setStorageItem('admin', JSON.stringify(result.admin));
        }
        setMessage({
            type: 'success',
            message: '登录成功',
        });
        setTimeout(() => {
            router.push('/query-ticket');
        }, 3000);
    } catch (error) {
        setMessage({
            type: 'error',
            message: error instanceof Error ? error.message : '登录失败，请检查账号和密码',
        });
        loading.value = false;
    }
};
</script>

<template>
    <div class="w-full max-w-md rounded-lg bg-white/95 p-8 shadow-lg dark:bg-gray-900/95">
        <div class="mx-auto mb-8 flex items-center text-lg font-bold text-black dark:text-white">
            <Logo class="h-14" />
            <span>| 加分系统</span>
        </div>

        <div class="mb-6 text-center">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">用户登录</h2>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
            <div class="space-y-1">
                <text-input v-model="formData.name" label="用户名" name="name" placeholder="请输入用户名" type="text" />
            </div>

            <div class="space-y-1">
                <div class="relative">
                    <text-input
                        v-model="formData.password"
                        label="用户密码"
                        name="password"
                        placeholder="请输入用户密码"
                        type="password"
                    />
                </div>
            </div>

            <button
                :disabled="loading"
                class="bg-primary hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-2 font-medium text-white transition duration-200"
                type="submit"
            >
                <Spinner v-if="loading" size="md" />
                <span v-else>登录</span>
            </button>
        </form>

        <div class="mt-8 mb-4 flex items-center">
            <div class="h-0.5 flex-1 bg-gray-600 dark:bg-gray-400" />
            <p class="h-6 px-4 text-center text-gray-600 dark:text-gray-400">其他登录方法</p>
            <div class="h-0.5 flex-1 bg-gray-600 dark:bg-gray-400" />
        </div>
        <button
            class="mx-auto block w-fit cursor-pointer rounded-full border border-gray-400 bg-white px-8 py-2 font-medium hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
            @click="handleOAuth2Submit"
        >
            <span class="material-symbols-rounded align-middle">encrypted</span>
            统一身份认证登录
        </button>
    </div>
</template>
