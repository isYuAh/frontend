<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'text',
    },
    placeholder: {
        type: String,
        default: '',
    },
    modelValue: {
        type: String,
        default: '',
    },
    tips: {
        type: String,
        default: '',
    }
});

const emit = defineEmits(['update:modelValue']);

const inputValue = ref(props.modelValue);

// Update parent when input changes
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

// Update local value when parent changes
watch(() => props.modelValue, (newValue) => {
    inputValue.value = newValue;
});
</script>

<template>
    <div class="mb-4">
        <label :for="id" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
        <input
            :id="id"
            :type="type"
            v-model="inputValue"
            :placeholder="placeholder"
            class="w-full rounded-md border border-gray-300 px-4 py-3 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p v-if="tips" class="mt-1 text-sm text-gray-500">{{ tips }}</p>
    </div>
</template>