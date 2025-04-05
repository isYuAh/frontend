<script setup lang="ts">
import { ref, watch } from 'vue';

interface SelectOptions {
    label: string;
    value: string;
}

const { name, label, modelValue, options } = defineProps<{
    name: string;
    label?: string;
    modelValue?: string;
    options?: SelectOptions[];
}>();

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
        <label v-if="label" :for="name" class="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
            {{ label }}
        </label>
        <select
            :name="name"
            v-model="inputValue"
            class="w-full rounded-md border border-gray-300 px-4 py-2 pr-12 text-sm placeholder:text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:placeholder:text-gray-300"
        >
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
    </div>
</template>
