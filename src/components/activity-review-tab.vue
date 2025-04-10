<script lang="ts" setup>
import { Review } from '@models/review';
import { devConfig } from '@utils/devConfig';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';

const { setMessage } = inject('banner') as any;

const { id, activityCreatable, ticketCreatable } = defineProps<{
    id: string;
    activityCreatable: boolean;
    ticketCreatable: boolean;
}>();

const reviews = ref<Review[]>([]),
    status = ref(0);

const handleCreateReview = async () => {
        try {
            await Review.create(id, {
                serverEndpoint: devConfig.serverEndpoint,
            });
            setMessage({
                type: 'success',
                message: '创建审核成功',
            });
            handleQuery();
        } catch (e) {
            setMessage({
                type: 'error',
                message: `创建审核失败 - ${e.message}`,
            });
            console.error(e);
        }
    },
    handleQuery = async () => {
        reviews.value = [];
        status.value = 0;

        try {
            const response = await Review.list(id, {
                serverEndpoint: devConfig.serverEndpoint,
            });
            reviews.value = response.data;
            status.value = 1;
        } catch (e) {
            status.value = 2;
            setMessage({
                type: 'error',
                message: `获取审核信息失败`,
            });
            console.error(e);
        }
    };
handleQuery();
</script>
<template>
    <h3 class="mb-4 text-2xl font-black">活动审核管理</h3>
    <Spinner v-if="status === 0" />
    <template v-if="status === 1">
        <div class="relative overflow-x-auto shadow-lg sm:rounded-lg">
            <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <caption
                    class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
                >
                    审核列表
                    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        浏览审核记录。
                        <template v-if="activityCreatable">
                            或
                            <a
                                class="text-primary dark:text-primary-200 underline"
                                href="#"
                                @click.prevent="handleCreateReview"
                            >
                                请求活动审核
                            </a>
                        </template>
                        <template v-if="ticketCreatable">
                            或
                            <a
                                class="text-primary dark:text-primary-200 underline"
                                href="#"
                                @click.prevent="handleCreateReview"
                            >
                                请求加分条审核
                            </a>
                        </template>
                    </p>
                </caption>
                <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th class="px-6 py-3" scope="col">活动名</th>
                        <th class="px-6 py-3" scope="col">类型</th>
                        <th class="px-6 py-3" scope="col">提交者</th>
                        <th class="px-6 py-3" scope="col">导师</th>
                        <th class="px-6 py-3" scope="col">导师评论</th>
                        <th class="px-6 py-3" scope="col">团委</th>
                        <th class="px-6 py-3" scope="col">团委评论</th>
                        <th class="px-6 py-3" scope="col">状态</th>
                        <th class="px-6 py-3" scope="col">更新时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="review in reviews"
                        :key="review.id"
                        class="divide-y divide-solid divide-gray-200 bg-white hover:bg-gray-50 dark:divide-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    >
                        <td class="px-6 py-4">{{ review.activityId }}</td>
                        <td class="px-6 py-4">{{ review.type === 0 ? '活动内容审核' : '加分条审核' }}</td>
                        <td class="px-6 py-4">{{ review.owner }}</td>
                        <td class="px-6 py-4">{{ review.instructor }}</td>
                        <td class="px-6 py-4">{{ review.instructorComment }}</td>
                        <td class="px-6 py-4">{{ review.committee }}</td>
                        <td class="px-6 py-4">{{ review.committeeComment }}</td>
                        <td class="px-6 py-4">
                            <span
                                :class="{
                                    'bg-yellow-100 text-yellow-800': review.state === 0,
                                    'bg-red-100 text-red-800': review.state === 1 || review.state === 4,
                                    'bg-blue-100 text-blue-800': review.state === 2,
                                    'bg-green-100 text-green-800': review.state === 3,
                                }"
                                class="rounded px-2.5 py-0.5 text-xs font-medium"
                            >
                                {{
                                    review.state === 0
                                        ? '待导师审核'
                                        : review.state === 1
                                          ? '导师已拒绝'
                                          : review.state === 2
                                            ? '待团委审核'
                                            : review.state === 3
                                              ? '团委已通过'
                                              : '团委已拒绝'
                                }}
                            </span>
                        </td>
                        <td class="px-6 py-4">{{ review.updatedAt ?? '日期有误' }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-if="reviews.length === 0" class="my-4 block text-center font-bold">无待审核内容</p>
        </div>
    </template>
    <template v-if="status === 2">
        加载失败
        <a
            class="text-primary dark:text-primary-200 underline"
            href="?"
            @click.prevent="
                () => {
                    handleQuery();
                }
            "
            >重试</a
        >
    </template>
</template>
