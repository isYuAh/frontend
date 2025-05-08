<script lang="ts" setup>
import { setTitle } from '@utils/title';
import Tabs from '@components/tabs.vue';
import AdminActivityReview from '@/pages/admin-activity-review.vue';
import { useRoute, useRouter } from 'vue-router';
import ActivityManagement from '@pages/activity-management.vue';
import ActivityCreate from '@pages/activity-create.vue';
import { computed } from 'vue';

setTitle('活动管理页');

const tabs: string[] = ['活动审核', '活动管理', '创建活动'];
const route = useRoute();
const router = useRouter();

const currentTab = computed({
    get: () => Number(route.query.tab) || 0,
    set: (value: number) => {
        router.push({ query: { ...route.query, tab: value } });
    },
});
</script>

<template>
    <div class="mx-auto px-4">
        <Tabs v-model:tab="currentTab" :tabs="tabs" />
        <AdminActivityReview v-if="currentTab === 0" />
        <ActivityManagement v-if="currentTab === 1" />
        <ActivityCreate v-if="currentTab === 2" />
    </div>
</template>
