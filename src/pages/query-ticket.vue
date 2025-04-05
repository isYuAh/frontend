<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { GoodDate } from '@utils/datetime';
import { Ticket, TicketType } from '@models/ticket';
import InputDate from '@components/input-date.vue';
import InputSelect from '@components/input-select.vue';
import { ref } from 'vue';
import AppBreadcrumbs from '@components/app-breadcrumbs.vue';

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
    <app-breadcrumbs name="查询加分条" />
    <div class="container mx-auto max-w-320 p-4">
        <h1 class="mb-6 text-4xl font-black">查询加分条</h1>
        <form class="flex items-center" @submit.prevent="handleSubmit">
            <div class="flex flex-1 space-x-2">
                <input-date
                    v-model="formData.startDate"
                    label="开始日期"
                    name="startDate"
                    placeholder="请选择开始日期"
                    type="date"
                />
                <input-date
                    v-model="formData.endDate"
                    label="结束日期"
                    name="endDate"
                    placeholder="请选择结束日期"
                    type="date"
                />
                <input-select v-model="formData.type" :options="options" label="加分类型" name="type" />
            </div>
            <button
                class="focus:ring-opacity-50 bg-primary hover:bg-primary-700 dark:hover:bg-primary-500 ml-4 h-12 cursor-pointer rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="submit"
            >
                查询
            </button>
        </form>

        <div class="mt-4">
            <h2 class="mb-4 text-2xl font-bold">查询结果</h2>
            <div v-if="!tickets">请给出查询参数</div>
            <div v-else-if="!tickets.length">无结果</div>
            <div
                v-else
                class="rounded-lg border border-gray-600 bg-gray-100 text-center shadow-lg dark:border-gray-400 dark:bg-gray-800"
            >
                <table class="container mx-auto w-full table-auto border-collapse overflow-x-scroll">
                    <thead>
                        <tr class="h-16 border-b border-gray-600 dark:border-gray-400">
                            <th>活动名</th>
                            <th>活动时间</th>
                            <th>加分数</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ticket in tickets" :key="ticket.id" class="h-10">
                            <td>{{ ticket.activity?.name ?? '活动有误' }}</td>
                            <td>{{ ticket.date }}</td>
                            <td>{{ ticket.points }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
