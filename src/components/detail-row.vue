<script lang="ts" setup>
import { devConfig } from '@utils/devConfig';
import { inject, ref } from 'vue';
import InputText from '@components/input-text.vue';
import { ActivityDetail } from '@models/detail';

const { setMessage } = inject('banner') as any;
const emit = defineEmits(['deleteTemporaryDetail']);

interface DetailView {
    id: string;
    name: string;
    maxPoints: number;
}

const { activityId, detail, editable } = defineProps<{
    activityId: string;
    detail: DetailView;
    editable: boolean;
}>();
const editing = ref(detail.id.startsWith('new_'));

function handleSubmit() {
    if (detail.id.startsWith('new_')) {
        if (detail.name === '') {
            setMessage({ message: '新事项名不能为空', type: 'error' });
            return;
        }
        ActivityDetail.create(
            activityId,
            {
                id: detail.id.substring(4),
                name: detail.name,
                maxPoints: 0,
            },
            {
                serverEndpoint: devConfig.serverEndpoint,
            }
        ).then((res) => {
            setMessage({ message: '创建成功', type: 'success' });
            detail.id = res.id;
            editing.value = false;
        });
    } else {
        if (detail.name === '') {
            setMessage({ message: '事项名不能为空', type: 'error' });
            return;
        }
        ActivityDetail.update(
            activityId,
            detail.id,
            {
                name: detail.name,
                maxPoints: detail.maxPoints,
            },
            {
                serverEndpoint: devConfig.serverEndpoint,
            }
        ).then((_) => {
            setMessage({ message: '修改成功', type: 'success' });
            editing.value = false;
        });
    }
}

function handleDelete() {
    if (!confirm('确认删除？')) return;
    if (detail.id.startsWith('new_')) {
        emit('deleteTemporaryDetail');
    } else {
        ActivityDetail.delete(activityId, detail.id, {
            serverEndpoint: devConfig.serverEndpoint,
        });
    }
}
</script>

<template>
    <tr class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <th class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white" scope="row">
            <span>{{ detail.id }}</span>
        </th>
        <td>
            <template v-if="!editing">
                <span>{{ detail.name }}</span>
            </template>
            <template v-else>
                <input-text v-model="detail.name" class="mx-1 w-32 py-2" name="name" type="text" />
            </template>
        </td>
        <td>
            <template v-if="!editing">
                <span>{{ detail.maxPoints }}</span>
            </template>
            <template v-else>
                <input-text
                    v-model="detail.maxPoints"
                    class="mx-1 w-32 py-2"
                    name="maxPoints"
                    required
                    step="0.1"
                    type="number"
                />
            </template>
        </td>
        <td>
            <template v-if="editable">
                <a
                    v-if="!detail.id.startsWith('new_')"
                    class="text-primary dark:text-primary-200 m-1 underline"
                    href="?"
                    @click.prevent="editing = !editing"
                    >{{ editing ? '取消' : '修改' }}</a
                >
                <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="handleSubmit"
                    >提交</a
                >
                <a class="m-1 text-red-500 underline dark:text-red-200" href="?" @click.prevent="handleDelete">删除</a>
            </template>
            <template v-else>无</template>
        </td>
    </tr>
</template>
