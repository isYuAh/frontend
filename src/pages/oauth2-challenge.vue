<script lang="ts" setup>
import { setStorageItem } from '@utils/storage';
import { User } from '@models/user';
import { inject, ref } from 'vue';
import { devConfig } from '@utils/devConfig';
import Spinner from '@components/spinner.vue';

const { setMessage } = inject('banner') as any;

const loading = ref(true),
    error = ref<string | null>(null);

(async () => {
    try {
        const info = await User.getInfo({ serverEndpoint: devConfig.serverEndpoint });
        if (info.admin) {
            setStorageItem('admin', JSON.stringify(info.admin));
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            setMessage({
                type: 'success',
                message: `登陆成功，${info.student.name}`,
            });
        } else if (info.student) {
            setStorageItem('student', JSON.stringify(info.student));
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            setMessage({
                type: 'success',
                message: `登陆成功，${info.student.name}`,
            });
        } else {
            setMessage({
                type: 'error',
                message: '无法验证身份',
            });
            error.value = '无法验证身份';
        }
    } catch (e: any) {
        setMessage({
            type: 'error',
            message: `获取身份信息失败`,
        });
        error.value = e.toString();
        console.error(e);
    }
})();
</script>

<template>
    <spinner v-if="loading" />
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400">
        {{ error }}
    </div>
</template>
