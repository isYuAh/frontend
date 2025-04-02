<script setup lang="ts">
import { setTitle } from '@utils/title';
import InputText from '@components/input-text.vue';
import { Admin } from '@models/user';
import { getStorageItem } from '@utils/storage';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import InputTextarea from '@components/input-textarea.vue';

const { setMessage } = inject('banner');

setTitle('个人资料');

let adminID = JSON.parse(getStorageItem('admin') ?? '{}').id,
    admin = ref({
        name: '',
        description: '',
        password: '',
    }),
    status = ref(0),
    submittable = ref(0);

const getAdmin = async () => {
    status.value = 0;
    try {
        const t = await Admin.getAdmin(adminID, {
            serverEndpoint: 'http://127.0.0.1/api',
        });
        admin.value = {
            name: t.name,
            description: t.description,
            password: '',
        };
        setMessage({
            type: 'success',
            message: '成功获取当前登录管理员信息',
        });
        status.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取当前登录管理员信息',
        });
        status.value = 2;
    }
};

getAdmin();

const onSubmit = async () => {
    submittable.value = 0;
    try {
        await Admin.updateAdmin(
            adminID,
            {
                name: admin.value.name,
                description: admin.value.description,
                password: admin.value.password,
            },
            {
                serverEndpoint: 'http://127.0.0.1/api',
            }
        );
        setMessage({
            type: 'success',
            message: '成功更新',
        });
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } catch (e: any) {
        setMessage({
            type: 'error',
            message: e.message,
        });
        submittable.value = 1;
    }
};
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">个人资料</h2>
    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="lg:flex lg:w-full lg:items-start lg:space-x-8 ">
        <form @submit.prevent="onSubmit" class="w-md">
            <input-text id="name" label="名称" placeholder="请输入名称……" v-model="admin.name" />
            <input-textarea id="description" label="简介" placeholder="请输入简介……" v-model="admin.description" />
            <input-text
                id="password"
                label="密码"
                placeholder="请输入密码……"
                type="password"
                v-model="admin.password"
            />
            <button
                type="submit"
                class="bg-primary hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-2 font-medium text-white transition duration-200"
                :disabled="status === 0"
            >
                <Spinner size="md" v-if="status === 0" />
                <span v-else>保存</span>
            </button>
        </form>
        <div class="w-md rounded-lg border p-4">
            <h2 class="mb-4 text-2xl font-black">预览个人资料</h2>
            <h3 class="mb-2 text-xl font-black">{{ admin.name }}</h3>
            <p>{{ admin.description }}</p>
        </div>
    </div>
    <p v-if="status === 2">
        无法获取当前登录管理员信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getAdmin">重试</a>
    </p>
</template>
