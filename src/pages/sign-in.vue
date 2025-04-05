<script lang="ts" setup>
import SignInBox from '@components/sign-in-box.vue';
</script>

<template>
    <div class="relative flex min-h-screen flex-col select-none">
        <img alt="Background" class="absolute z-0 h-full w-full object-cover opacity-75" src="/images/background.png" />
        <div class="z-10 flex flex-1 items-center justify-center p-4">
            <sign-in-box />
        </div>

        <footer class="z-10 py-4 text-center text-sm font-medium text-white">
            <p>&copy; 2025 哈尔滨工业大学（威海）</p>
        </footer>
    </div>
</template>
