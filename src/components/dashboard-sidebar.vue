<script lang="ts" setup>
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
    <div class="h-full w-19 min-w-19 border-r border-gray-200 p-4 dark:border-gray-700" />
    <div class="absolute z-10 mx-3 my-6 flex h-[calc(100%-3rem)] flex-col justify-between space-y-4">
        <div class="flex flex-col space-y-2">
            <router-link
                v-for="item in sidebarItems"
                :key="item.path"
                :class="url === item.path ? 'bg-primary-200 dark:bg-primary-700' : ''"
                :to="item.path"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 transitioned flex h-13 w-13 cursor-pointer items-center overflow-hidden rounded-full select-none hover:w-fit"
                draggable="false"
            >
                <span class="material-symbols-rounded w-7 px-3 text-3xl! leading-8">{{ item.icon }}</span>
                <span class="ml-6 pr-4 font-bold text-gray-900 dark:text-white">{{ item.label }}</span>
            </router-link>
        </div>
    </div>
</template>
