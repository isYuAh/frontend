<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { ActivityDetail, ActivityState } from '@models/activity';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import DetailRow from '@components/detail-row.vue';
import { nanoid } from '@utils/crypto';

const { setMessage } = inject('banner') as any;

setTitle('活动事项管理');

const { id, activityState } = defineProps<{ id: string; activityState: ActivityState }>();

interface Model {
    id: string;
    name: string;
    maxPoints: number;
}

let details = ref<Model[]>([]),
    status = ref(0);

const getActivityDetails = async () => {
    status.value = 0;
    try {
        const t = await ActivityDetail.list(id, {
            serverEndpoint: 'http://127.0.0.1/api',
        });
        details.value = t.map((detail) => {
            return {
                id: detail.id,
                name: detail.name,
                maxPoints: detail.maxPoints,
            };
        });
        setMessage({
            type: 'success',
            message: '成功获取活动信息',
        });
        status.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取活动信息',
        });
        console.log(e);
        status.value = 2;
    }
};

getActivityDetails();

const addDetail = () => {
    let newDetail: Model = {
        id: 'new_' + nanoid(6),
        name: '',
        maxPoints: 0,
    };

    details.value.push(newDetail);
    setTimeout(() => {
        let el = document.querySelector('tbody tr:last-child');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
};
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">活动事项管理</h2>
    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <caption
                class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
            >
                活动事项列表
                <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    <template v-if="activityState === 0 || activityState === 3">
                        选择活动修改活动事项。
                        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="addDetail">
                            添加一个新事项
                        </a>
                    </template>
                    <template v-else>查看活动事项。</template>
                    或者
                    <a
                        class="text-primary dark:text-primary-200 underline"
                        href="?"
                        @click.prevent="getActivityDetails"
                    >
                        重新加载（这会丢失未提交的数据）
                    </a>
                </p>
            </caption>
            <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3" scope="col">ID</th>
                    <th class="px-6 py-3" scope="col">名称</th>
                    <th class="px-6 py-3" scope="col">最大分数</th>
                    <th class="px-6 py-3" scope="col">操作</th>
                </tr>
            </thead>
            <tbody>
                <DetailRow
                    v-for="detail in details"
                    :key="detail.id"
                    :activity-id="id"
                    :detail="detail"
                    :editable="activityState === 0 || activityState === 3"
                    @delete-temporary-detail="details.splice(details.indexOf(detail), 1)"
                />
            </tbody>
        </table>
    </div>
    <p v-if="status === 2">
        无法获取活动事项信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getActivityDetails">
            重新加载
        </a>
    </p>
</template>
