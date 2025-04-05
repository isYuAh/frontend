<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { ref } from 'vue';
import { getStorageItem } from '@utils/storage';
import SignInBox from '@components/sign-in-box.vue';

setTitle('首页');

const userType = ref<'student' | 'admin'>();
try {
    let item = JSON.parse(getStorageItem('student') || '{}');
    if (item.id) {
        userType.value = 'student';
    } else {
        item = JSON.parse(getStorageItem('admin') || '{}');
        if (item.id) {
            userType.value = 'admin';
        }
    }
} catch (_) {}
</script>

<template>
    <div class="container mx-auto space-y-4 px-8 py-4">
        <h1 class="mb-8 text-3xl font-black">👋 欢迎使用加分系统</h1>
        <p>
            欢迎使用<span class="text-primary">哈尔滨工业大学（威海）<b>团委加分系统</b></span
            >！
        </p>

        <template v-if="userType === 'student'">
            <h2 class="mb-4 text-2xl font-bold">🏫 学生快速链接</h2>
            <div class="flex justify-between space-x-8 text-3xl font-bold text-white">
                <router-link
                    class="bg-primary/60 flex h-72 flex-1/2 items-center justify-center rounded-xl text-center shadow-xl backdrop-blur-xs hover:shadow-2xl"
                    to="/query-ticket"
                >
                    <div>查询你的加分条！</div>
                </router-link>
                <router-link
                    class="bg-secondary/60 flex h-72 flex-1/2 items-center justify-center rounded-xl text-center shadow-xl backdrop-blur-xs hover:shadow-2xl"
                    to="/query-ticket"
                >
                    <div>最近有什么新活动？</div>
                </router-link>
                <router-link
                    class="bg-tertiary/60 flex h-72 flex-1/2 items-center justify-center rounded-xl text-center shadow-xl backdrop-blur-xs hover:shadow-2xl"
                    to="/query-ticket"
                >
                    <div>寻找活动组织</div>
                </router-link>
            </div>
        </template>
        <template v-else-if="userType === 'admin'">
            <h2 class="mb-4 text-2xl font-bold">🏫 管理员快速链接</h2>
            <div class="flex justify-between space-x-8 text-3xl font-bold text-white">
                <router-link
                    class="bg-primary/60 flex h-72 flex-1/2 items-center justify-center rounded-xl text-center shadow-xl backdrop-blur-xs hover:shadow-2xl"
                    to="/query-ticket"
                >
                    <div>前往管理面板！</div>
                </router-link>
            </div>
        </template>
        <template v-else>
            <h2 class="mb-4 text-2xl font-bold">🔒 快速登录</h2>
            <sign-in-box />
        </template>
    </div>
</template>
