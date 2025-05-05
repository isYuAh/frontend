<script lang="ts" setup>
import { Ticket } from '@/models/ticket';
import inputText from './input-text.vue';
import { inject, ref, toRaw, watch } from 'vue';
import { devConfig } from '@/utils/devConfig';

interface InputTextProps {
    ticket: Ticket;
    id: string;
}

const props = defineProps<InputTextProps>();
const editing = ref(false);
const emit = defineEmits(['update']);
const { setMessage } = inject('banner') as any;
const temp = ref(structuredClone(toRaw(props.ticket)));
watch(
    () => props.ticket,
    (newValue) => {
        temp.value = structuredClone(toRaw(newValue));
    }
);

const handleDeleteTicket = async (ticket: Ticket) => {
    Ticket.delete(props.id, ticket.id, { serverEndpoint: devConfig.serverEndpoint })
        .then(() => {
            setMessage({
                type: 'success',
                message: '成功删除加分条信息',
            });
            emit('update');
        })
        .catch((e: Error) => {
            setMessage({
                type: 'error',
                message: e.message,
            });
        });
};
const handleSubmitEdit = async (ticket: Ticket) => {
    try {
        await Ticket.update(
            props.id,
            ticket.id,
            {
                student: ticket.student,
                type: ticket.type,
                points: ticket.points,
            },
            { serverEndpoint: devConfig.serverEndpoint }
        );
        setMessage({
            type: 'success',
            message: '成功修改加分条信息',
        });
        editing.value = false;
    } catch (e) {
        setMessage({
            type: 'error',
            message: (e as Error).message,
        });
    }
};
const handleCancel = () => {
    try {
        console.log(props.ticket);
        temp.value = structuredClone(toRaw(props.ticket));
        editing.value = false;
    } catch (e) {
        console.log(e);
    }
};
</script>
<template>
    <td class="px-6 py-4">{{ temp.id }}</td>
    <td class="px-6 py-4">
        <template v-if="editing">
            <input-text v-model="temp.student" class="mx-1 w-32 py-2" name="student" type="text" />
        </template>
        <template v-else>
            {{ temp.student }}
        </template>
    </td>
    <td class="px-6 py-4">
        <template v-if="editing">
            <select v-model="temp.type" class="mx-1 rounded border py-2">
                <option :value="0">日常</option>
                <option :value="1">个性</option>
            </select>
        </template>
        <template v-else>
            {{ temp.type === 0 ? '日常' : '个性' }}
        </template>
    </td>
    <td class="px-6 py-4">
        <template v-if="editing">
            <input-text
                v-model="temp.points"
                :preprocess="(value: number) => value / 100"
                :process="(value: number) => value * 100"
                :step="100"
                class="mx-1 w-32 py-2"
                name="points"
                type="number"
            />
        </template>
        <template v-else>
            {{ temp.points / 100 }}
        </template>
    </td>
    <td class="px-6 py-4">{{ temp.date.toLocalizedString() }}</td>
    <td class="px-6 py-4">
        <template v-if="editing">
            <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="handleCancel">取消</a>
            <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="handleSubmitEdit(temp)"
                >提交</a
            >
        </template>
        <template v-else>
            <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="editing = true"
                >修改</a
            >
            <a class="m-1 text-red-500 underline dark:text-red-200" href="?" @click.prevent="handleDeleteTicket(temp)"
                >删除</a
            >
        </template>
    </td>
</template>