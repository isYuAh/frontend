<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { Activity, ActivityState } from '@models/activity';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import ActivityRow from '@components/activity-row.vue';
import { GoodDate } from '@utils/datetime';
import ActivityDetail from '@pages/activity-detail.vue';

const { setMessage } = inject('banner') as any;

setTitle('活动管理');

interface Model {
    id: string;
    name: string;
    date: GoodDate;
    state: ActivityState;
    actions: string[];
}

let activities = ref<Model[]>([]),
    status = ref(0),
    limit = 50,
    offset = ref(0),
    activeID = ref<string>(),
    currentAction = ref<string>();

const getActivities = async () => {
    status.value = 0;
    activeID.value = '';
    currentAction.value = '';

    try {
        const t = await Activity.list(limit, offset.value, {
            serverEndpoint: 'http://127.0.0.1/api',
        });
        activities.value = t.map((activity) => {
            return {
                id: activity.id,
                name: activity.name,
                date: activity.date,
                state: activity.state,
                actions: ['活动事项', '审核', '活动详情', '加分条'],
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

getActivities();
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">活动管理</h2>
    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <caption
                class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
            >
                活动列表
                <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    选择活动进而对活动执行操作，或者
                    <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getActivities">
                        重新加载（这会丢失未提交的数据）
                    </a>
                </p>
            </caption>
            <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3" scope="col">ID</th>
                    <th class="px-6 py-3" scope="col">名称</th>
                    <th class="px-6 py-3" scope="col">时间</th>
                    <th class="px-6 py-3" scope="col">状态</th>
                    <th class="px-6 py-3" scope="col">操作</th>
                </tr>
            </thead>
            <tbody>
                <ActivityRow
                    v-for="activity in activities"
                    :key="activity.id"
                    :activity="activity"
                    :on-action="
                        (action: string) => {
                            activeID = activity.id;
                            currentAction = action;
                        }
                    "
                />
            </tbody>
        </table>
        <div v-if="activeID" class="mt-8">
            <activity-detail
                v-if="currentAction === '活动事项'"
                :id="activeID"
                :activity-state="activities.find((a) => a.id === activeID)!.state"
            />
        </div>
    </div>
    <p v-if="status === 2">
        无法获取活动信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getActivities">重试</a>
    </p>
</template>
