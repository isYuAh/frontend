<script setup lang="ts">
import { ref, watch } from 'vue';

interface InputTextProps {
    name: string;
    label: string;
    placeholder?: string;
    modelValue?: string;
    tips?: string;
}

const { name, label, placeholder = '', modelValue = '', tips } = defineProps<InputTextProps>();

const emit = defineEmits(['update:modelValue']),
    inputValue = ref(modelValue);
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});
watch(
    () => modelValue,
    (newValue) => {
        inputValue.value = newValue;
    }
);
</script>

<template>
    <div>
        <label v-if="name" :for="name" class="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
            {{ label }}
        </label>
        <textarea
            :name="name"
            v-model="inputValue"
            :placeholder="placeholder"
            class="w-full rounded-md border border-gray-300 px-4 py-2 pr-12 text-sm placeholder:text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:placeholder:text-gray-300"
        />
        <p v-if="tips" class="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">{{ tips }}</p>
    </div>
</template>
