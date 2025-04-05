<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { getStorageItem } from '@utils/storage';
import { UserType } from '@models/user';
import Tabs from '@components/tabs.vue';
import AdminActivityReview from '@/pages/admin-activity-review.vue';
import { ref } from 'vue';

setTitle('活动管理页');

const tab = ref(0); 

const userType = JSON.parse(getStorageItem('admin') ?? '{}').type,
    tabs: string[] = ['活动审核'];

switch (userType) {
    case UserType.UserOrg:
    case UserType.UserLocalOrg:
        tabs.push('加分条管理', '审核管理');
        break;
}
</script>

<template>
    <div class="mx-auto w-full px-4">
        <Tabs v-model:tab="tab" :tabs="tabs" />
        <AdminActivityReview v-if="tab === 0" />
    </div>
</template>
