<script lang="ts" setup>
import { Review } from '@models/review';
import { devConfig } from '@/utils/devConfig';
import InputSelect from '@/components/input-select.vue';
import { computed, inject, reactive, ref } from 'vue';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@/utils/error-msg';
import ActivityDetailTab from '@pages/activity-detail-tab.vue';
import { getStorageItem } from '@utils/storage';
import { UserType } from '@models/user';
import ActivityTicketTab from '@pages/activity-ticket-tab.vue';

const { setMessage } = inject('banner') as any;

let userIsInstructor = false,
    userIsCommittee = false;
try {
    const userType = JSON.parse(getStorageItem('admin') || '{}').type;
    userIsInstructor = userType === UserType.UserInstructor;
    userIsCommittee = userType === UserType.UserCommittee || userType === UserType.UserLocalCommittee;
} catch (e) {
    window.location.href = '/sign-in';
}

const showDialog = ref(false),
    dialogType = ref<'info' | 'approve' | 'reject'>(),
    dialogTitle = ref(''),
    currentReview = ref<Review | null>(null),
    comment = ref(''),
    dialogMode = ref<'activity' | 'ticket'>(),
    reviews = ref<Review[]>([]),
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

const form = reactive({
    type: '-1',
    status: userIsInstructor ? '0' : userIsCommittee ? '2' : '-1',
});

const handleQuery = async (resetPage: boolean = true) => {
    try {
        const props = {
            offset: config.current * config.pageSize - config.pageSize,
            type: form.type,
            state: form.status,
        };
        count.value = await Review.listByReviewerIdCount(props, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        reviews.value = await Review.listByReviewerId(props, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        if (resetPage) {
            config.current = 1;
        }
    } catch (error) {
        let errorMessage = '获取审核列表失败，请稍后重试';

        if (error instanceof Error) {
            if (error.message === errorNotFound) {
                errorMessage = '未找到审核记录';
            } else if (error.message === errorInternal) {
                errorMessage = '服务器内部错误，请联系管理员';
            } else {
                errorMessage = error.message || errorMessage;
            }
        }

        setMessage({ type: 'error', message: errorMessage });
    }
};

const openInfoDialog = async (review: Review) => {
        currentReview.value = review;
        dialogType.value = 'info';
        dialogTitle.value = review.type === 0 ? '活动内容审核详情' : '加分条审核详情';
        dialogMode.value = review.type === 0 ? 'activity' : 'ticket';
        showDialog.value = true;
    },
    openApproveDialog = (review: Review) => {
        currentReview.value = review;
        dialogType.value = 'approve';
        dialogTitle.value = '通过审核';
        comment.value = '';
        showDialog.value = true;
    },
    openRejectDialog = (review: Review) => {
        currentReview.value = review;
        dialogType.value = 'reject';
        dialogTitle.value = '拒绝审核';
        comment.value = '';
        showDialog.value = true;
    },
    closeDialog = () => {
        showDialog.value = false;
        currentReview.value = null;
        comment.value = '';
    };

const submitReview = async () => {
    if (!currentReview.value) return;

    const isApprove = dialogType.value === 'approve';

    try {
        await Review.update(
            currentReview.value.activityId,
            currentReview.value.id,
            { state: isApprove, comment: comment.value },
            { serverEndpoint: devConfig.serverEndpoint }
        );
        await handleQuery(false);
        closeDialog();
        setMessage({
            type: 'success',
            message: '审核提交成功',
        });
    } catch (error) {
        let errorMessage = '审核提交失败，请稍后重试';

        if (error instanceof Error) {
            if (error.message === errorBadRequest) {
                errorMessage = '请求参数错误，请检查输入';
            } else if (error.message === errorForbidden) {
                errorMessage = '你没有权限执行此操作';
            } else if (error.message === errorNotFound) {
                errorMessage = '审核记录不存在或已被删除';
            } else if (error.message === errorInternal) {
                errorMessage = '服务器内部错误，请联系管理员';
            } else {
                errorMessage = error.message || errorMessage;
            }
        }

        setMessage({ type: 'error', message: errorMessage });
    }
};

handleQuery();
</script>
<template>
    <h2 class="mb-4 text-2xl font-black">审核列表</h2>
    <form class="mb-8 flex items-center" @submit.prevent="handleQuery(false)">
        <div class="flex flex-1 space-x-2">
            <InputSelect
                v-model="form.type"
                :options="[
                    {
                        value: '-1',
                        label: '全部',
                    },
                    {
                        value: '0',
                        label: '活动内容审核',
                    },
                    {
                        value: '1',
                        label: '加分条审核',
                    },
                ]"
                label="类型"
                name="type"
            />
            <InputSelect
                v-model="form.status"
                :options="[
                    {
                        value: '-1',
                        label: '全部',
                    },
                    {
                        value: '0',
                        label: '待导师审核',
                    },
                    {
                        value: '1',
                        label: '导师已拒绝',
                    },
                    {
                        value: '2',
                        label: '待团委审核',
                    },
                    {
                        value: '3',
                        label: '团委已通过',
                    },
                    {
                        value: '4',
                        label: '团委已拒绝',
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

    <div class="overflow-x-auto shadow-lg sm:rounded-lg">
        <div class="min-w-288">
            <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <caption
                    class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
                >
                    审核列表
                    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">浏览审核记录。</p>
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
                        <th class="px-6 py-3" scope="col">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="review in reviews"
                        :key="review.id"
                        class="divide-y divide-solid divide-gray-200 bg-white hover:bg-gray-50 dark:divide-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    >
                        <td class="px-6 py-4">{{ review.activity?.name }}</td>
                        <td class="px-6 py-4">{{ review.type === 0 ? '活动内容审核' : '加分条审核' }}</td>
                        <td class="px-6 py-4">{{ review.ownerUser?.name }}</td>
                        <td class="px-6 py-4">{{ review.instructorUser?.name }}</td>
                        <td class="px-6 py-4">{{ review.instructorComment }}</td>
                        <td class="px-6 py-4">{{ review.committeeUser?.name }}</td>
                        <td class="px-6 py-4">{{ review.committeeComment }}</td>
                        <td class="px-6 py-4">
                            <span
                                :class="{
                                    'bg-yellow-100 text-yellow-800': review.state === 0,
                                    'bg-red-100 text-red-800': review.state === 1 || review.state === 4,
                                    'bg-blue-100 text-blue-800': review.state === 2,
                                    'bg-green-100 text-green-800': review.state === 3,
                                }"
                                class="rounded px-2.5 py-0.5 text-xs font-medium break-keep"
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
                        <td class="px-6 py-4">{{ review.updatedAt?.toLocalizedString() ?? '日期有误' }}</td>
                        <td class="px-6 py-4">
                            <div class="flex space-x-2">
                                <button
                                    class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                                    @click="openInfoDialog(review)"
                                >
                                    查看信息
                                </button>

                                <template
                                    v-if="
                                        (review.state === 0 && userIsInstructor) ||
                                        (review.state === 2 && userIsCommittee)
                                    "
                                >
                                    <button
                                        class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                                        @click="openApproveDialog(review)"
                                    >
                                        通过
                                    </button>
                                    <button
                                        class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                                        @click="openRejectDialog(review)"
                                    >
                                        拒绝
                                    </button>
                                </template>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-if="reviews.length === 0" class="my-4 block text-center font-bold">无待审核内容</p>
    </div>

    <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-400">
            显示 {{ reviews.length > 0 ? (config.current - 1) * config.pageSize + 1 : 0 }} 到
            {{ Math.min(config.current * config.pageSize, reviews.length) }} 条，共 {{ reviews.length }} 条
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

    <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
            class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl dark:bg-gray-800"
        >
            <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ dialogTitle }}</h3>
                <button class="text-gray-400 hover:text-gray-500" @click="closeDialog">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                        />
                    </svg>
                </button>
            </div>

            <!-- 查看信息对话框内容 -->
            <div v-if="dialogType === 'info'" class="mt-4">
                <activity-detail-tab
                    v-if="dialogMode === 'activity'"
                    :id="currentReview!.activityId"
                    :key="currentReview?.activityId"
                    :editable="false"
                    :ticketable="currentReview?.type == 1"
                />
                <activity-ticket-tab :id="currentReview!.activityId" :active-detail-id="null" :editable="false" />
            </div>

            <!-- 审核对话框内容 -->
            <div v-if="dialogType === 'approve' || dialogType === 'reject'" class="mt-4">
                <div class="mb-4">
                    <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">评论</label>
                    <textarea
                        v-model="comment"
                        class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
                        placeholder="请输入您的评论..."
                        rows="4"
                    ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                    <button
                        class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        @click="closeDialog"
                    >
                        取消
                    </button>
                    <button
                        :class="{
                            'bg-green-600 hover:bg-green-700': dialogType === 'approve',
                            'bg-red-600 hover:bg-red-700': dialogType === 'reject',
                        }"
                        class="bg-primary hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-medium text-white"
                        @click="submitReview"
                    >
                        {{ dialogType === 'approve' ? '确认通过' : '确认拒绝' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
