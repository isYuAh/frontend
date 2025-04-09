<script setup lang="ts">
import { Review } from '@/models/review';
import { devConfig } from '@/utils/devConfig';
import { inject, ref } from 'vue';
const {id} = defineProps<{
  id: string
}>()
const { setMessage } = inject('banner') as any;
const reviews = ref<Review[]>([])
const status = ref(1) // 1 loading 2 success 3 error
const handleCreateReview = () => {
  Review.create(id, {
    serverEndpoint: devConfig.serverEndpoint 
  }).then(() => {
    setMessage({
      type: 'success',
      message: '创建审核成功'
    })
    handleQuery()
  }).catch((e: Error) => {
    setMessage({
      type: 'error',
      message: `创建审核失败 - ${e.message}`
    })
  })
}
const handleQuery = () => {
  reviews.value = []
  status.value = 1
  Review.list(id, {
    serverEndpoint: devConfig.serverEndpoint
  }).then((res) => {
    reviews.value = res.data
    console.log(res, reviews.value)
    status.value = 2
  }).catch((e: Error) => {
    console.log(e)
    status.value = 3
    setMessage({
      type: 'error',
      message: `获取审核信息失败 - ${e.message}`
    })
  })
}
handleQuery()
</script>
<template>
  <h3 class="mb-4 text-2xl font-black">活动审核管理</h3>
  <template v-if="status === 1">
    加载中...
  </template>
  <template v-if="status === 2">
    <div class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <caption
                class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
            >
                审核列表
                <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                  浏览审核记录。或 <a @click.prevent="handleCreateReview" href="#" class="text-primary dark:text-primary-200 underline">创建审核</a>
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
  <template v-if="status === 3">
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