<script lang="ts" setup>
const { model } = defineProps<{
    model: {
        id: string;
        name: string;
        date: string;
        description: string;
        location: string;
    };
}>();
</script>

<template>
    <h3 class="mb-2 text-xl font-black">{{ model.name }}</h3>
    <p>地点：{{ model.location }}</p>
    <p>时间：{{ model.date }}</p>
    <p>{{ model.description }}</p>
    <p class="mt-4 text-gray-700 dark:text-gray-300">ID：{{ model.id }}</p>
</template>
