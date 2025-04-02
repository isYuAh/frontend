<script setup lang="ts">
</script>

<template>
    <div class="flex flex-col justify-between space-y-4 p-4">
        <div class="actions flex flex-col space-y-2">
            <router-link
                to="/dashboard"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 h-13 w-13 cursor-pointer rounded-full p-2.5"
            >
                <span class="material-symbols-rounded text-3xl! leading-8">home</span>
            </router-link>
            <router-link
                to="/dashboard/admin"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 h-13 w-13 cursor-pointer rounded-full p-2.5"
            >
                <span class="material-symbols-rounded text-3xl!">account_circle</span>
            </router-link>
            <router-link
                to="/dashboard/activity"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 h-13 w-13 cursor-pointer rounded-full p-2.5"
            >
                <span class="material-symbols-rounded text-3xl!">event</span>
            </router-link>
            <router-link
                to="/dashboard/student"
                class="hover:bg-primary-100 dark:hover:bg-primary-800 h-13 w-13 cursor-pointer rounded-full p-2.5"
            >
                <span class="material-symbols-rounded text-3xl!">school</span>
            </router-link>
        </div>
    </div>
</template>
