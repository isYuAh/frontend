<script setup lang="ts">
import { Review } from '@/models/review';
import { devConfig } from '@/utils/devConfig';
import InputSelect from '@/components/input-select.vue';
import { computed, inject, reactive, ref } from 'vue';
import { errorBadRequest, errorForbidden, errorNotFound, errorInternal } from '@/utils/error-msg';

const { setMessage } = inject('banner') as any;
// 对话框状态管理
const showDialog = ref(false);
const dialogType = ref(''); // 'info', 'approve', 'reject'
const dialogTitle = ref('');
const currentReview = ref<Review | null>(null);
const comment = ref('');

// 活动详情信息
const activityInfo = ref('');
const bonusInfo = ref('');

const reviews = ref<Review[]>([])
const config = reactive({
  current: 1,
  pageSize: 20,
})
const totalPage = computed(() => {
  return Math.ceil(reviews.value.length / config.pageSize);
})
const currentPageData = computed(() => {
  const start = (config.current - 1) * config.pageSize;
  const end = start + config.pageSize;
  return reviews.value.slice(start, end);
})
// 计算要显示的页码，限制页码数量
const displayedPages = computed(() => {
  const total = totalPage.value;
  const current = config.current;
  const maxDisplayed = 7; // 最多显示的页码数量
  
  // 如果总页数小于等于最大显示数，则全部显示
  if (total <= maxDisplayed) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  // 否则，显示首页、尾页和当前页附近的页码
  const pages = [];
  const sidePages = Math.floor((maxDisplayed - 3) / 2); // 当前页两侧各显示几个页码
  
  // 添加首页
  pages.push(1);
  
  // 如果当前页靠近首页
  if (current <= sidePages + 2) {
    for (let i = 2; i <= Math.min(maxDisplayed - 1, total - 1); i++) {
      pages.push(i);
    }
    // 如果总页数大于最大显示数，添加省略号
    if (total > maxDisplayed) {
      pages.push(-1); // 使用-1表示省略号
    }
  } 
  // 如果当前页靠近尾页
  else if (current >= total - sidePages - 1) {
    // 添加省略号
    pages.push(-1);
    // 添加尾页前面的页码
    for (let i = Math.max(2, total - maxDisplayed + 2); i < total; i++) {
      pages.push(i);
    }
  } 
  // 如果当前页在中间
  else {
    // 添加前省略号
    pages.push(-1);
    // 添加当前页及其两侧的页码
    for (let i = Math.max(2, current - sidePages); i <= Math.min(total - 1, current + sidePages); i++) {
      pages.push(i);
    }
    // 添加后省略号
    if (current + sidePages < total - 1) {
      pages.push(-1);
    }
  }
  
  // 添加尾页（如果尾页不是1且尚未添加）
  if (total > 1 && !pages.includes(total)) {
    pages.push(total);
  }
  
  return pages;
})
const form = reactive({
  type: '-1',
  status: '-1',
})

function handleQuery(resetPage: boolean = true) {
  Review.listByReviewerId({
    offset: config.current * config.pageSize - config.pageSize,
    type: form.type,
    state: form.status
  }, {
    serverEndpoint: devConfig.serverEndpoint
  }).then(res => {
    reviews.value = res.data;
    // 只有在需要重置页码时才重置
    if (resetPage) {
      config.current = 1;
    }
  }).catch(error => {
    console.error('获取审核列表失败:', error);
    // 根据错误类型显示不同的错误信息
    let errorMessage = '获取审核列表失败，请稍后重试';
    
    // 提取错误消息
    if (error instanceof Error) {
      // 根据错误消息判断错误类型
      if (error.message === errorNotFound) {
        errorMessage = '未找到审核记录';
      } else if (error.message === errorInternal) {
        errorMessage = '服务器内部错误，请联系管理员';
      } else {
        // 使用服务器返回的具体错误信息
        errorMessage = error.message || errorMessage;
      }
    }
    
    // 使用setMessage显示错误信息
    setMessage({ type: 'error', message: errorMessage });
  })
}

// 打开查看信息对话框
function openInfoDialog(review: Review) {
  currentReview.value = review;
  dialogType.value = 'info';
  dialogTitle.value = review.type === 0 ? '活动内容审核详情' : '加分条审核详情';
  
  // 根据类型显示不同的信息（这里使用模拟数据，实际应该从API获取）
  if (review.type === 0) {
    activityInfo.value = `活动ID: ${review.activityId}\n活动详细信息将在这里显示...`;
  } else {
    bonusInfo.value = `加分条ID: ${review.activityId}\n加分条详细信息将在这里显示...`;
  }
  
  showDialog.value = true;
}

// 打开审核对话框
function openApproveDialog(review: Review) {
  currentReview.value = review;
  dialogType.value = 'approve';
  dialogTitle.value = '通过审核';
  comment.value = '';
  showDialog.value = true;
}

function openRejectDialog(review: Review) {
  currentReview.value = review;
  dialogType.value = 'reject';
  dialogTitle.value = '拒绝审核';
  comment.value = '';
  showDialog.value = true;
}

// 关闭对话框
function closeDialog() {
  showDialog.value = false;
  currentReview.value = null;
  comment.value = '';
}

// 提交审核结果
function submitReview() {
  if (!currentReview.value) return;
  
  const isApprove = dialogType.value === 'approve';
  
  Review.update(
    currentReview.value.activityId,
    currentReview.value.id,
    { state: isApprove, comment: comment.value },
    { serverEndpoint: devConfig.serverEndpoint }
  ).then(() => {
    // 更新成功后刷新列表
    handleQuery(false);
    closeDialog();
  }).catch(error => {
    console.error('审核提交失败:', error);
    // 根据错误类型显示不同的错误信息
    let errorMessage = '审核提交失败，请稍后重试';
    
    // 提取错误消息
    if (error instanceof Error) {
      // 根据错误消息判断错误类型
      if (error.message === errorBadRequest) {
        errorMessage = '请求参数错误，请检查输入';
      } else if (error.message === errorForbidden) {
        errorMessage = '您没有权限执行此操作';
      } else if (error.message === errorNotFound) {
        errorMessage = '审核记录不存在或已被删除';
      } else if (error.message === errorInternal) {
        errorMessage = '服务器内部错误，请联系管理员';
      } else {
        // 使用服务器返回的具体错误信息
        errorMessage = error.message || errorMessage;
      }
    }
    
    // 使用setMessage显示错误信息
    setMessage({ type: 'error', message: errorMessage });
  });
}
</script>
<template>
  <form class="flex items-center" @submit.prevent="handleQuery(false)">
      <div class="flex flex-1 space-x-2">
        <InputSelect 
          v-model="form.type"
          :options="[{
            value: '-1',
            label: '全部'
          }, {
            value: '0',
            label: '活动内容审核'
          }, {
            value: '1',
            label: '加分条审核'
          }]"
          label="类型"
          name="type"
        />
        <InputSelect 
          v-model="form.status"
          :options="[{
            value: '-1',
            label: '全部'
          }, {
            value: '0',
            label: '待导师审核'
          }, {
            value: '1',
            label: '导师已拒绝'
          }, {
            value: '2',
            label: '待团委审核'
          }, {
            value: '3',
            label: '团委已通过'
          }, {
            value: '4',
            label: '团委已拒绝'
          }]"
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
  <main class="mt-5">
    <template v-if="reviews.length === 0">无数据</template>
    <template v-else>
      <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
        <caption
            class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
        >
            审核列表
            <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                浏览审核记录。
            </p>
        </caption>
        <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th class="px-6 py-3" scope="col">ID</th>
                <th class="px-6 py-3" scope="col">活动ID</th>
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
            <tr v-for="review in currentPageData" :key="review.id" class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                <td class="px-6 py-4">{{ review.id }}</td>
                <td class="px-6 py-4">{{ review.activityId }}</td>
                <td class="px-6 py-4">{{ review.type === 0 ? '活动内容审核' : '加分条审核' }}</td>
                <td class="px-6 py-4">{{ review.owner }}</td>
                <td class="px-6 py-4">{{ review.instructor }}</td>
                <td class="px-6 py-4">{{ review.instructorComment }}</td>
                <td class="px-6 py-4">{{ review.committee }}</td>
                <td class="px-6 py-4">{{ review.committeeComment }}</td>
                <td class="px-6 py-4">
                  <span :class="{
                    'bg-yellow-100 text-yellow-800': review.state === 0,
                    'bg-red-100 text-red-800': review.state === 1 || review.state === 4,
                    'bg-blue-100 text-blue-800': review.state === 2,
                    'bg-green-100 text-green-800': review.state === 3
                  }" class="rounded px-2.5 py-0.5 text-xs font-medium">
                    {{ review.state === 0 ? '待导师审核' : 
                       review.state === 1 ? '导师已拒绝' : 
                       review.state === 2 ? '待团委审核' : 
                       review.state === 3 ? '团委已通过' : '团委已拒绝' }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ review.updatedAt }}</td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <!-- 查看信息按钮 -->
                    <button 
                      @click="openInfoDialog(review)"
                      class="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      查看信息
                    </button>
                    
                    <!-- 审核按钮，只在需要审核的状态下显示 -->
                    <template v-if="(review.state === 0) || (review.state === 2)">
                      <button 
                        @click="openApproveDialog(review)"
                        class="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium"
                      >
                        通过
                      </button>
                      <button 
                        @click="openRejectDialog(review)"
                        class="bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium"
                      >
                        拒绝
                      </button>
                    </template>
                  </div>
                </td>
            </tr>
        </tbody>
      </table>
      
      <!-- 分页控制 -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-700 dark:text-gray-400">
          显示 {{ reviews.length > 0 ? (config.current - 1) * config.pageSize + 1 : 0 }} 到 
          {{ Math.min(config.current * config.pageSize, reviews.length) }} 条，共 {{ reviews.length }} 条
        </div>
        <div class="flex space-x-2">
          <button 
            @click="config.current = Math.max(1, config.current - 1)" 
            :disabled="config.current === 1"
            class="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <div class="flex space-x-1">
            <!-- 计算要显示的页码 -->
            <template v-for="page in displayedPages" :key="page">
              <!-- 显示省略号 -->
              <template v-if="page === -1">
                <span class="px-3 py-1 text-sm font-medium text-gray-700">...</span>
              </template>
              <!-- 显示页码按钮 -->
              <template v-else>
                <button 
                  @click="config.current = page" 
                  :class="{
                    'bg-primary text-white': config.current === page,
                    'bg-white text-gray-700 hover:bg-gray-50': config.current !== page
                  }"
                  class="px-3 py-1 rounded border border-gray-300 text-sm font-medium"
                >
                  {{ page }}
                </button>
              </template>
            </template>
          </div>
          <button 
            @click="config.current = Math.min(totalPage, config.current + 1)" 
            :disabled="config.current === totalPage || totalPage === 0"
            class="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </template>
  </main>
  
  <!-- 对话框组件 -->
  <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ dialogTitle }}</h3>
        <button @click="closeDialog" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- 查看信息对话框内容 -->
      <div v-if="dialogType === 'info'" class="mt-4">
        <div v-if="currentReview && currentReview.type === 0" class="whitespace-pre-line p-4 bg-gray-50 dark:bg-gray-700 rounded">
          {{ activityInfo }}
        </div>
        <div v-else-if="currentReview && currentReview.type === 1" class="whitespace-pre-line p-4 bg-gray-50 dark:bg-gray-700 rounded">
          {{ bonusInfo }}
        </div>
      </div>
      
      <!-- 审核对话框内容 -->
      <div v-if="dialogType === 'approve' || dialogType === 'reject'" class="mt-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">评论</label>
          <textarea 
            v-model="comment" 
            rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="请输入您的评论..."
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeDialog" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            @click="submitReview" 
            class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
            :class="{
              'bg-green-600 hover:bg-green-700': dialogType === 'approve',
              'bg-red-600 hover:bg-red-700': dialogType === 'reject'
            }"
          >
            {{ dialogType === 'approve' ? '确认通过' : '确认拒绝' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>