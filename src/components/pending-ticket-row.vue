<script lang="ts" setup>
import { Ticket } from '@/models/ticket';
import inputText from './input-text.vue';

interface InputTextProps {
    ticket: Ticket;
    activityId: string;
    detailId: string;
    editable: boolean;
}
defineProps<InputTextProps>();
const emit = defineEmits(['delete', 'submit']);
</script>
<template>
    <td class="px-6 py-4">{{ ticket.id }}</td>
    <td class="px-6 py-4">
        <input-text v-model="ticket.student" class="mx-1 w-32 py-2" name="student" type="text" />
    </td>
    <td class="px-6 py-4">
        <select v-model="ticket.type" class="mx-1 rounded border py-2">
            <option :value="0">日常</option>
            <option :value="1">个性</option>
        </select>
    </td>
    <td class="px-6 py-4">
        <input-text
            v-model="ticket.points"
            :preprocess="(value: number) => value / 100"
            :process="(value: number) => value * 100"
            :step="100"
            class="mx-1 w-32 py-2"
            name="points"
            type="number"
        />
    </td>
    <td class="px-6 py-4">/</td>
    <td class="px-6 py-4" v-if="editable">
        <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="emit('submit', ticket)"
        >提交单条</a>
        <a class="m-1 text-red-500 underline dark:text-red-200" href="?" @click.prevent="emit('delete', ticket)"
        >删除</a>
    </td>
</template>