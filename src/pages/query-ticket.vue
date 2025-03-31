<script setup lang="ts">
import { setTitle } from '@utils/title';
import { GoodDate } from '@utils/datetime';
import { Ticket, TicketType } from '@models/ticket';
import InputDate from '@components/input-date.vue';
import InputSelect from '@components/input-select.vue';
import { ref } from 'vue';

setTitle('查询加分条');

interface FormData {
    startDate: string;
    endDate: string;
    type: string;
}

const formData = defineModel<FormData>('formData', {
    default: {
        startDate: new GoodDate().toISODate(),
        endDate: new GoodDate().toISODate(),
        type: TicketType.TicketDaily.toString(),
    },
});

const options = [
    { label: '日常行为分', value: TicketType.TicketDaily.toString() },
    { label: '个性发展分', value: TicketType.TicketPersonality.toString() },
];

const tickets = ref<Ticket[]>();

const handleSubmit = async () => {
    try {
        tickets.value = await Ticket.queryStudentTicket(
            {
                startDate: GoodDate.fromString(formData.value.startDate),
                endDate: GoodDate.fromString(formData.value.endDate),
                type: parseInt(formData.value.type),
            },
            { serverEndpoint: 'http://127.0.0.1/api' }
        );
    } catch (error) {
        console.error('Error fetching tickets:', error);
    }
};
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="mb-4 text-3xl font-black">查询加分条</h1>
        <form @submit.prevent="handleSubmit" class="flex items-center">
            <div class="flex flex-1 space-x-2">
                <input-date
                    v-model="formData.startDate"
                    label="开始日期"
                    placeholder="请选择开始日期"
                    type="date"
                    id="startDate"
                />
                <input-date
                    v-model="formData.endDate"
                    label="结束日期"
                    placeholder="请选择结束日期"
                    type="date"
                    id="endDate"
                />
                <input-select id="type" label="加分类型" v-model="formData.type" :options="options" />
            </div>
            <button
                type="submit"
                class="focus:ring-opacity-50 bg-primary hover:bg-primary-700 dark:hover:bg-primary-500 ml-4 h-12 rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
                查询
            </button>
        </form>

        <div class="mt-4">
            <h2 class="mb-2 text-xl font-bold">查询结果</h2>
            <div v-if="!tickets">请给出查询参数</div>
            <div v-else-if="!tickets.length">无结果</div>
            <table v-else class="container mx-auto w-full table-auto border-collapse overflow-x-scroll text-center">
                <thead>
                    <tr class="h-12 border-b border-gray-300 dark:border-gray-700">
                        <th>活动名</th>
                        <th>活动时间</th>
                        <th>加分数</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ticket in tickets" :key="ticket.id" class="h-8">
                        <td>{{ ticket.activity?.name ?? '活动有误' }}</td>
                        <td>{{ ticket.date }}</td>
                        <td>{{ ticket.points }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
