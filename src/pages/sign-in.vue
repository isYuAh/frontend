<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { setTitle } from '@utils/title';
import { Admin } from '@models/user';
import { setCookie } from '@utils/cookie';
import { setStorageItem } from '@utils/storage';

import TextInput from '@components/input-text.vue';
import Spinner from '@components/spinner.vue';

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

const gotoUnifiedIdentityAuth = () => {
    // TODO: Redirect to unified identity authentication page
};

const handleSubmit = async () => {
    loading.value = true;

    try {
        const result = await Admin.signInAdmin(formData.value, { serverEndpoint: 'http://localhost/api' });

        // localhost env will prevent the browser from setting a persistent cookie
        // so we need to set the cookie manually
        if (window.location.host === '127.0.0.1:5173' || window.location.host === 'localhost:5173') {
            setCookie('token', result.token);
        }

        setStorageItem('user', result.user);

        setMessage({
            type: 'success',
            message: '登录成功',
        });
        setTimeout(() => {
            router.push('/user/dashboard');
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
    <div class="relative flex min-h-screen flex-col select-none">
        <img src="/images/background.png" alt="Background" class="absolute z-0 h-full w-full object-cover opacity-75" />
        <div class="z-10 flex flex-1 items-center justify-center p-4">
            <div class="w-full max-w-md rounded-lg bg-white/95 p-8 shadow-lg dark:bg-gray-900/95">
                <img src="/images/logo.png" alt="Logo" class="mx-auto mb-8 h-12" />

                <div class="mb-6 text-center">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">用户登录</h2>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="space-y-1">
                        <TextInput id="name" label="用户名" v-model="formData.name" placeholder="请输入用户名" />
                    </div>

                    <div class="space-y-1">
                        <div class="relative">
                            <TextInput
                                id="password"
                                label="用户密码"
                                v-model="formData.password"
                                type="password"
                                placeholder="请输入用户密码"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="flex w-full cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition duration-200 hover:bg-blue-700"
                        :disabled="loading"
                    >
                        <Spinner size="md" v-if="loading" />
                        <span v-else>登录</span>
                    </button>
                </form>

                <div class="flex items-center mt-8 mb-4">
                    <div class="h-0.5 flex-1 bg-gray-600 dark:bg-gray-400" />
                    <p class="h-6 px-4 text-center text-gray-600 dark:text-gray-400">其他登录方法</p>
                    <div class="h-0.5 flex-1 bg-gray-600 dark:bg-gray-400" />
                </div>
                <button
                    class="mx-auto block w-fit cursor-pointer rounded-full border border-gray-400 bg-white px-8 py-2 font-medium hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
                    @click="gotoUnifiedIdentityAuth"
                >
                    <span class="material-symbols-rounded align-middle">encrypted</span>
                    统一身份认证登录
                </button>
            </div>
        </div>

        <footer class="z-10 py-4 text-center text-sm font-medium text-white">
            <p>&copy; 2025 哈尔滨工业大学（威海）</p>
        </footer>
    </div>
</template>
