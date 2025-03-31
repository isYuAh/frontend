<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: string;
    label: string;
    type: string;
    id: string;
}>();

const emit = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue);

// Update parent when input changes
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

// Update local value when parent changes
watch(
    () => props.modelValue,
    (newValue) => {
        inputValue.value = newValue;
    }
);
</script>

<template>
    <div class="mb-4">
        <label :for="id" class="mb-1.5 font-bold block text-sm text-gray-700 dark:text-gray-300">{{ label }}</label>
        <input
            :id="id"
            :type="type"
            v-model="inputValue"
            class="w-full rounded-md border border-gray-300 text-sm px-4 py-2 pr-12 placeholder:text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:placeholder:text-gray-300"
        />
    </div>
</template>