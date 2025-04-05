<script lang="ts" setup>
const { tabs, tab } = defineProps<{ tabs: string[]; tab: number }>();
const emit = defineEmits<{ (e: 'update:tab', value: number): void }>();
</script>

<template>
    <div class="mb-8 border-b border-gray-200 dark:border-gray-700">
        <ul
            id="default-tab"
            class="-mb-px flex flex-wrap text-center text-sm font-medium"
            data-tabs-toggle="#default-tab-content"
            role="tablist"
        >
            <li v-for="(t, index) in tabs" :key="t" class="me-2" role="presentation">
                <button
                    :id="`${t}-tab`"
                    :aria-controls="t"
                    :class="tab === index ? 'text-primary dark:text-primary-200' : ''"
                    :data-tabs-target="`#${t}`"
                    aria-selected="false"
                    class="hover:border-primary dark:hover:border-primary-200 inline-block cursor-pointer rounded-t-lg border-b-2 p-4 font-bold select-none hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    draggable="false"
                    role="tab"
                    type="button"
                    @click="emit('update:tab', index)"
                >
                    {{ t }}
                </button>
            </li>
        </ul>
    </div>
</template>
