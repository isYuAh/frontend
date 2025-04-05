<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { markdownToVue } from '@utils/md2vue';

const { markdown } = defineProps<{
    markdown: string;
}>();

const html = ref(markdown);

watchEffect(async () => {
    html.value = await markdownToVue(markdown);
});
</script>

<template>
    <div class="markdown" v-html="html" />
</template>
