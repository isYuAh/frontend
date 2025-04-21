<script lang="ts" setup>
import { Ticket } from '@/models/ticket';
import { devConfig } from '@/utils/devConfig';
import { inject, ref, watch } from 'vue';
import Spinner from '@components/spinner.vue';
import { parseCsv } from '@utils/papaparse';
import TicketRow from '@components/ticket-row.vue';

const { id, activeDetailId, editable } = defineProps<{
    id: string;
    activeDetailId: string;
    editable: boolean;
}>();
const status = ref(0);
const tickets = ref<Ticket[]>([]);
const { setMessage } = inject('banner') as any;

const getTicket = async () => {
    status.value = 0;
    try {
        tickets.value = await Ticket.list(id, { serverEndpoint: devConfig.serverEndpoint });
        status.value = 1;
        setMessage({
            type: 'success',
            message: '成功获取加分条信息',
        });
    } catch (e) {
        status.value = 2;
    }
};

interface TicketData {
    detailId: string;
    student: string;
    type: number;
    points: number;
}

const uploadTicket = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
            const result = await parseCsv(file);
            const tickets: TicketData[] = result.data.map((row: any) => {
                return {
                    detailId: activeDetailId,
                    type: Number(row['类型']),
                    points: Number(row['分数'] * 100),
                    student: row['学号'],
                };
            });
            Ticket.create(id, tickets, { serverEndpoint: devConfig.serverEndpoint })
                .then(() => {
                    setMessage({
                        type: 'success',
                        message: '成功上传加分条信息',
                    });
                    getTicket();
                })
                .catch((e: Error) => {
                    setMessage({
                        type: 'error',
                        message: e.message,
                    });
                });
        } catch (err) {
            console.error('Error parsing CSV:', err);
            setMessage({
                type: 'error',
                message: '上传加分条信息失败',
            });
        }
    };
    input.click();
};

watch(
    [() => id, () => activeDetailId],
    () => {
        getTicket();
    },
    { immediate: true }
);
</script>
<template>
    <h2 class="mb-4 text-2xl font-black">加分条管理</h2>
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <Spinner v-if="status === 0" />
        <template v-else>
            <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <caption
                    class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
                >
                    事项加分条列表
                    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        查看活动加分条。或者
                        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getTicket">
                            重新加载
                        </a>
                        （这会丢失未提交的数据）
                        <template v-if="editable">
                            ，或者
                            <a
                                class="text-primary dark:text-primary-200 underline"
                                href="?"
                                @click.prevent="uploadTicket"
                            >
                                上传加分条 CSV 表格
                            </a>
                        </template>
                    </p>
                </caption>
                <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th class="px-6 py-3" scope="col">ID</th>
                        <th class="px-6 py-3" scope="col">学生</th>
                        <th class="px-6 py-3" scope="col">类型</th>
                        <th class="px-6 py-3" scope="col">分数</th>
                        <th class="px-6 py-3" scope="col">活动日期</th>
                        <th class="px-6 py-3" scope="col">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="ticket in tickets"
                        :key="ticket.id"
                        class="border-gray-200 bg-white not-last:border-b dark:border-gray-700 dark:bg-gray-800"
                    >
                        <TicketRow :id="id" :ticket="ticket" @update="getTicket" />
                    </tr>
                </tbody>
            </table>
            <p v-if="tickets.length === 0" class="my-4 block text-center font-bold">无活动加分条</p>
        </template>
    </div>
    <p v-if="status === 2">
        无法获取活动事项信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getTicket"> 重新加载 </a>
    </p>
</template>