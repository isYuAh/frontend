<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { Activity, ActivityState } from '@models/activity';
import { computed, inject, reactive, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import ActivityRow from '@components/activity-row.vue';
import { GoodDate } from '@utils/datetime';
import ActivityTab from '@pages/activity-tab.vue';
import InputSelect from '@components/input-select.vue';
import ActivityReviewTab from '@pages/activity-review-tab.vue';
import ActivityTicketTab from '@pages/activity-ticket-tab.vue';
import ActivityDetailTab from '@pages/activity-detail-tab.vue';
import { devConfig } from '@utils/devConfig';

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
    state = ref('-1'),
    limit = 50,
    offset = ref(0),
    activeID = ref<string>(),
    activeDetailId = ref<string>(),
    currentAction = ref<string>(),
    count = ref(0);

const config = reactive({
        current: 1,
        pageSize: 20,
    }),
    totalPage = computed(() => {
        return Math.ceil(count.value / config.pageSize);
    }),
    displayedPages = computed(() => {
        const total = totalPage.value;
        const current = config.current;
        const maxDisplayed = 7;

        if (total <= maxDisplayed) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = [];
        const sidePages = Math.floor((maxDisplayed - 3) / 2);

        pages.push(1);

        if (current <= sidePages + 2) {
            for (let i = 2; i <= Math.min(maxDisplayed - 1, total - 1); i++) {
                pages.push(i);
            }
            if (total > maxDisplayed) {
                pages.push(-1);
            }
        } else if (current >= total - sidePages - 1) {
            pages.push(-1);
            for (let i = Math.max(2, total - maxDisplayed + 2); i < total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(-1);
            for (let i = Math.max(2, current - sidePages); i <= Math.min(total - 1, current + sidePages); i++) {
                pages.push(i);
            }
            if (current + sidePages < total - 1) {
                pages.push(-1);
            }
        }

        if (total > 1 && !pages.includes(total)) {
            pages.push(total);
        }

        return pages;
    });

const handleQuery = async (_: boolean = false) => {
        status.value = 0;
        activeID.value = '';
        activeDetailId.value = '';
        currentAction.value = '';

        try {
            count.value = await Activity.listCount(parseInt(state.value), {
                serverEndpoint: devConfig.serverEndpoint,
            });
            const t = await Activity.list(limit, offset.value, parseInt(state.value), {
                serverEndpoint: devConfig.serverEndpoint,
            });
            activities.value = t.map((activity) => {
                return {
                    id: activity.id,
                    name: activity.name,
                    date: activity.date,
                    state: activity.state,
                    actions: ['活动事项与加分条', '审核', '活动详情'],
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
    },
    onActivitySaved = async (newActivity: { name: string; date: string }) => {
        setMessage({
            type: 'success',
            message: '活动信息已保存',
        });
        activities.value = activities.value.map((activity) => {
            if (activity.id === activeID.value) {
                return {
                    ...activity,
                    name: newActivity.name,
                    date: GoodDate.fromString(newActivity.date),
                };
            }
            return activity;
        });
    };

handleQuery();
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">活动管理</h2>
    <form class="mb-8 flex items-center" @submit.prevent="handleQuery(false)">
        <div class="flex flex-1 space-x-2">
            <InputSelect
                v-model="state"
                :options="[
                    {
                        value: '-1',
                        label: '全部',
                    },
                    {
                        value: '0',
                        label: '活动草稿',
                    },
                    {
                        value: '1',
                        label: '活动审核中',
                    },
                    {
                        value: '2',
                        label: '活动审核通过',
                    },
                    {
                        value: '3',
                        label: '活动审核未通过',
                    },
                    {
                        value: '4',
                        label: '加分条审核中',
                    },
                    {
                        value: '5',
                        label: '加分条审核通过',
                    },
                    {
                        value: '6',
                        label: '加分条审核未通过',
                    },
                ]"
                label="状态"
                name="status"
            />
        </div>
        <button
            class="focus:ring-opacity-50 bg-primary hover:bg-primary-700 dark:hover:bg-primary-500 ml-4 h-12 cursor-pointer rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="submit"
        >
            查询
        </button>
    </form>

    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <div class="min-w-288">
            <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <caption
                    class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
                >
                    活动列表
                    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        选择活动进而对活动执行操作，或者
                        <a
                            class="text-primary dark:text-primary-200 underline"
                            href="?"
                            @click.prevent="
                                () => {
                                    handleQuery(false);
                                }
                            "
                        >
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
        </div>
        <p v-if="activities.length === 0" class="my-4 block text-center font-bold">无活动</p>
    </div>
    <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-400">
            显示 {{ activities.length > 0 ? (config.current - 1) * config.pageSize + 1 : 0 }} 到
            {{ Math.min(config.current * config.pageSize, activities.length) }} 条，共 {{ activities.length }} 条
        </div>
        <div class="flex space-x-2">
            <button
                :disabled="config.current === 1"
                class="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                @click="config.current = Math.max(1, config.current - 1)"
            >
                上一页
            </button>
            <div class="flex space-x-1">
                <template v-for="page in displayedPages" :key="page">
                    <template v-if="page === -1">
                        <span class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-white">...</span>
                    </template>
                    <template v-else>
                        <button
                            :class="{
                                'bg-primary text-white': config.current === page,
                                'bg-white text-gray-700 hover:bg-gray-50 dark:text-white': config.current !== page,
                            }"
                            class="rounded border border-gray-300 px-3 py-1 text-sm font-medium"
                            @click="config.current = page"
                        >
                            {{ page }}
                        </button>
                    </template>
                </template>
            </div>
            <button
                :disabled="config.current === totalPage || totalPage === 0"
                class="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                @click="config.current = Math.min(totalPage, config.current + 1)"
            >
                下一页
            </button>
        </div>
    </div>

    <div v-if="activeID" class="my-8 space-y-8">
        <activity-detail-tab
            v-if="currentAction === '活动事项与加分条'"
            :id="activeID"
            :key="activeID + currentAction"
            :editable="[0, 3].indexOf(activities.find((a) => a.id === activeID)?.state ?? -1) != -1"
            @checkTicket="
                (detailId) => {
                    activeDetailId = detailId;
                }
            "
        />
        <activity-ticket-tab
            v-if="currentAction === '活动事项与加分条' && activeDetailId !== ''"
            :id="activeID"
            :key="activeID + activeDetailId + currentAction"
            :activeDetailId="activeDetailId!"
            :editable="[2, 6].indexOf(activities.find((a) => a.id === activeID)?.state ?? -1) != -1"
        />
        <activity-tab
            v-if="currentAction === '活动详情'"
            :id="activeID"
            :key="activeID + activeDetailId + currentAction"
            :editable="[0, 3].indexOf(activities.find((a) => a.id === activeID)?.state ?? -1) != -1"
            :on-saved="onActivitySaved"
        />
        <activity-review-tab
            v-if="currentAction === '审核'"
            :id="activeID"
            :key="activeID + activeDetailId + currentAction"
            :activityCreatable="[0, 3].indexOf(activities.find((a) => a.id === activeID)?.state ?? -1) != -1"
            :ticketCreatable="[2, 6].indexOf(activities.find((a) => a.id === activeID)?.state ?? -1) != -1"
        />
    </div>
    <p v-if="status === 2">
        无法获取活动信息；
        <a
            class="text-primary dark:text-primary-200 underline"
            href="?"
            @click.prevent="
                () => {
                    handleQuery(false);
                }
            "
            >重试</a
        >
    </p>
</template>
