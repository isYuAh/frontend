<script lang="ts" setup>
const { name } = defineProps<{ name: string }>();
</script>

<template>
    <div class="container mx-auto max-w-320 px-4 pt-8 select-none">
        <router-link class="text-primary dark:text-primary-200" to="/"> 🏠 首页</router-link>
        <span class="material-symbols-rounded align-middle text-gray-600 dark:text-gray-400">chevron_right</span>
        <span class="text-gray-800 dark:text-gray-200">{{ name }}</span>
    </div>
</template>
