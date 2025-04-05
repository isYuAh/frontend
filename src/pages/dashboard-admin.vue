<script setup lang="ts">
import { setTitle } from '@utils/title';
import { getStorageItem } from '@utils/storage';
import { UserType } from '@models/user';
import AdminManagemenet from '@pages/admin-managemenet.vue';
import AdminProfile from '@pages/admin-profile.vue';
import Tabs from '@components/tabs.vue';
import { ref } from 'vue';

setTitle('管理员管理页');

const tab = ref(0);

const isSU = JSON.parse(getStorageItem('admin') ?? '{}').type === UserType.UserSU,
    tabs = isSU ? ['个人资料', '管理管理员'] : ['个人资料'];
</script>

<template>
    <div class="mx-auto w-full px-4">
        <Tabs :tabs="tabs" v-model:tab="tab" />

        <div v-if="isSU && tab === 1">
            <AdminManagemenet />
        </div>
        <div v-else-if="tab === 0">
            <AdminProfile />
        </div>
    </div>
</template>
