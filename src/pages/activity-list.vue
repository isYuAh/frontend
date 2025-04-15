<script lang="ts" setup>
import { Activity } from '@models/activity';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import { devConfig } from '@utils/devConfig';
import AppBreadcrumbs from '@components/app-breadcrumbs.vue';
import { Admin } from '@models/user';

const { setMessage } = inject('banner') as any;

const activities = ref<Activity[]>([]),
    count = ref(0),
    limit = 20,
    offset = ref(0);
const listLoading = ref(false);

const selectedActivityId: any = ref('');

const activity = ref(Activity.template),
    org = ref(Admin.template);

const activityStatus = ref(0);

const fetchActivityList = async () => {
    listLoading.value = true;
    try {
        count.value = await Activity.listCount(-1, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        activities.value = await Activity.list(limit, offset.value, -1, {
            serverEndpoint: devConfig.serverEndpoint,
        });

        if (activities.value.length > 0 && !selectedActivityId.value) {
            selectedActivityId.value = activities.value[0].id;
            await getActivity(selectedActivityId.value);
        }

        listLoading.value = false;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '获取活动列表失败',
        });
        listLoading.value = false;
    }
};

const getActivity = async (id: string) => {
    activityStatus.value = 0;
    try {
        activity.value = await Activity.get(id, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        org.value = await Admin.getAdmin(activity.value.owner, {
            serverEndpoint: devConfig.serverEndpoint,
        });

        activityStatus.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取活动信息',
        });
        activityStatus.value = 2;
    }
};

const selectActivity = (id: string) => {
    selectedActivityId.value = id;
    getActivity(id);
};

fetchActivityList();
</script>

<template>
    <app-breadcrumbs name="活动列表" />
    <div class="container mx-auto max-w-320 p-4">
        <h1 class="mb-6 text-4xl font-black">活动列表</h1>

        <div class="flex w-full flex-col gap-6 md:flex-row">
            <div class="w-full md:w-1/3">
                <div class="activity-detail rounded-lg border p-4">
                    <h3 class="text-primary dark:text-primary-200 mb-4 text-xl font-bold">活动列表</h3>

                    <div class="activity-list">
                        <Spinner v-if="listLoading" />
                        <div v-else-if="activities.length === 0" class="py-2 text-gray-700 dark:text-gray-300">
                            暂无活动数据
                        </div>
                        <div
                            v-for="activity in activities"
                            v-else
                            :key="activity.id"
                            :class="[
                                'activity-item mb-2 flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700',
                                selectedActivityId === activity.id
                                    ? 'border-primary text-primary dark:text-primary-200 border-2 bg-gray-200 dark:bg-gray-800'
                                    : '',
                            ]"
                            @click="selectActivity(activity.id)"
                        >
                            <div class="text-lg font-semibold">{{ activity.name }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full rounded-lg border p-4 md:w-2/3">
                <h3 class="text-primary dark:text-primary-200 mb-4 text-xl font-bold">活动详细信息</h3>
                <template v-if="selectedActivityId">
                    <Spinner v-if="activityStatus === 0" />

                    <div v-if="activityStatus === 1">
                        <div v-if="activityStatus === 1" class="space-y-4">
                            <div class="flex space-x-2">
                                <div class="font-bold text-gray-700 dark:text-gray-300">名称</div>
                                <div class="flex-1 truncate">{{ activity.name }}</div>
                            </div>
                            <div class="flex space-x-2">
                                <div class="font-bold text-gray-700 dark:text-gray-300"><em>地点</em>/时间</div>
                                <div class="flex-1 truncate">
                                    <em>{{ activity.location }}</em> ;
                                    {{ activity.date.toLocalizedDateString() }}
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <div class="font-bold text-gray-700 dark:text-gray-300">主办方</div>
                                <div class="flex-1 truncate">{{ org.name }}（{{ org.typeString() }}）</div>
                            </div>
                            <div class="flex items-start space-x-2">
                                <div class="mb-2 font-bold text-gray-700 dark:text-gray-300">简介</div>
                                <div class="flex-1 break-all">
                                    {{ activity.description || '暂无简介' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-if="activityStatus === 2" class="rounded-lg border p-4">
                        无法获取活动信息；
                        <a
                            class="text-primary dark:text-primary-200 underline"
                            href="#"
                            @click.prevent="() => getActivity(selectedActivityId)"
                            >重试</a
                        >
                    </p>
                </template>

                <div v-else class="rounded-lg border p-4 text-gray-700 dark:text-gray-300">
                    请在左侧选择一个活动查看详情
                </div>
            </div>
        </div>
    </div>
</template>
