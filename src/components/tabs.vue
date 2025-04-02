<script setup lang="ts">
const { tabs, tab } = defineProps<{ tabs: string[]; tab: number }>();
const emit = defineEmits<{ (e: 'update:tab', value: number): void }>();
</script>

<template>
    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul
            class="-mb-px flex flex-wrap text-center text-sm font-medium"
            id="default-tab"
            data-tabs-toggle="#default-tab-content"
            role="tablist"
        >
            <li v-for="(t, index) in tabs" :key="t" class="me-2" role="presentation">
                <button
                    :class="tab === index ? 'text-primary dark:text-primary-200' : ''"
                    class="inline-block cursor-pointer rounded-t-lg border-b-2 p-4 font-bold hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                    :id="`${t}-tab`"
                    :data-tabs-target="`#${t}`"
                    type="button"
                    role="tab"
                    :aria-controls="t"
                    aria-selected="false"
                    @click="emit('update:tab', index)"
                >
                    {{ t }}
                </button>
            </li>
        </ul>
    </div>
</template>
