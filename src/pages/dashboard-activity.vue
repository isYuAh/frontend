<script lang="ts" setup>
import { setTitle } from '@utils/title';
import Tabs from '@components/tabs.vue';
import AdminActivityReview from '@/pages/admin-activity-review.vue';
import { ref } from 'vue';
import ActivityManagement from '@pages/activity-management.vue';
import ActivityCreate from '@pages/activity-create.vue';

setTitle('活动管理页');

const tab = ref(0);
const tabs: string[] = ['活动审核', '活动管理', '创建活动'];
</script>

<template>
    <div class="mx-auto px-4">
        <Tabs v-model:tab="tab" :tabs="tabs" />
        <AdminActivityReview v-if="tab === 0" />
        <ActivityManagement v-if="tab === 1" />
        <ActivityCreate v-if="tab === 2" />
    </div>
</template>
