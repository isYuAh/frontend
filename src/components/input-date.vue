<script setup lang="ts">
import { ref, watch } from 'vue';

const { name, label, type, modelValue } = defineProps<{
    name: string;
    modelValue: string;
    label?: string;
    type: string;
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
        <input
            :name="name"
            :type="type"
            v-model="inputValue"
            class="w-full rounded-md border border-gray-300 px-4 py-2 pr-12 text-sm placeholder:text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:placeholder:text-gray-300"
        />
    </div>
</template>
