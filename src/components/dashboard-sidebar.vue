<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute(),
    url = computed(() => route.path);

interface SidebarItem {
    path: string;
    icon: string;
    label: string;
}

const sidebarItems: SidebarItem[] = [
    {
        path: '/dashboard',
        icon: 'home',
        label: '首页',
    },
    {
        path: '/dashboard/admin',
        icon: 'account_circle',
        label: '管理员',
    },
    {
        path: '/dashboard/activity',
        icon: 'event',
        label: '活动',
    },
    {
        path: '/dashboard/student',
        icon: 'school',
        label: '学生',
    },
];
</script>

<template>
    <div class="flex flex-col justify-between space-y-4 p-4">
        <div class="actions flex flex-col space-y-2">
            <router-link
                v-for="item in sidebarItems"
                :key="item.path"
                :to="item.path"
                :class="url === item.path ? 'bg-primary-200 dark:bg-primary-700' : ''"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 h-13 w-13 cursor-pointer rounded-full p-2.5"
            >
                <span class="material-symbols-rounded text-3xl! leading-8">{{ item.icon }}</span>
            </router-link>
        </div>
    </div>
</template>
