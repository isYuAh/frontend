<script lang="ts" setup>
import { Admin } from '@models/user';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import { devConfig } from '@utils/devConfig';
import AppBreadcrumbs from '@components/app-breadcrumbs.vue';

const { setMessage } = inject('banner') as any;

const adminList: any = ref([]);
const listLoading = ref(false);

const selectedAdminId: any = ref('');

const admin = ref(Admin.template);

const adminStatus = ref(0);

const fetchAdminList = async () => {
    listLoading.value = true;
    try {
        adminList.value = await Admin.listAdmin(true, {
            serverEndpoint: devConfig.serverEndpoint,
        });

        if (adminList.value.length > 0 && !selectedAdminId.value) {
            selectedAdminId.value = adminList.value[0].id;
            await getAdmin(selectedAdminId.value);
        }

        listLoading.value = false;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '获取组织列表失败',
        });
        listLoading.value = false;
    }
};

const getAdmin = async (id: string) => {
    adminStatus.value = 0;
    try {
        admin.value = await Admin.getAdmin(id, {
            serverEndpoint: devConfig.serverEndpoint,
        });

        adminStatus.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取组织信息',
        });
        adminStatus.value = 2;
    }
};

const selectAdmin = (id: string) => {
    selectedAdminId.value = id;
    getAdmin(id);
};

fetchAdminList();
</script>

<template>
    <app-breadcrumbs name="组织列表" />
    <div class="container mx-auto max-w-320 p-4">
        <h1 class="mb-6 text-4xl font-black">组织列表</h1>

        <div class="flex w-full flex-col gap-6 md:flex-row">
            <div class="w-full md:w-1/3">
                <div class="admin-detail rounded-lg border p-4">
                    <h3 class="text-primary dark:text-primary-200 mb-4 text-xl font-bold">组织列表</h3>

                    <div class="admin-list">
                        <Spinner v-if="listLoading" />
                        <div v-else-if="adminList.length === 0" class="py-2 text-gray-700 dark:text-gray-300">
                            暂无组织数据
                        </div>
                        <div
                            v-for="admin in adminList"
                            v-else
                            :key="admin.id"
                            :class="[
                                'admin-item mb-2 flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700',
                                selectedAdminId === admin.id
                                    ? 'border-primary text-primary dark:text-primary-200 border-2 bg-gray-200 dark:bg-gray-800'
                                    : '',
                            ]"
                            @click="selectAdmin(admin.id)"
                        >
                            <div class="text-lg font-semibold">{{ admin.name }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full rounded-lg border p-4 md:w-2/3">
                <h3 class="text-primary dark:text-primary-200 mb-4 text-xl font-bold">组织详细信息</h3>
                <template v-if="selectedAdminId">
                    <Spinner v-if="adminStatus === 0" />

                    <div v-if="adminStatus === 1">
                        <div v-if="adminStatus === 1" class="space-y-4">
                            <div class="flex space-x-2">
                                <div class="font-bold text-gray-700 dark:text-gray-300">名称</div>
                                <div class="flex-1 truncate">{{ admin.name }}</div>
                            </div>

                            <div class="flex space-x-2">
                                <div class="font-bold text-gray-700 dark:text-gray-300">类型</div>
                                <div class="flex-1 truncate">{{ admin.typeString() }}</div>
                            </div>
                            <div class="flex items-start space-x-2">
                                <div class="mb-2 font-bold text-gray-700 dark:text-gray-300">简介</div>
                                <div class="flex-1 break-all">
                                    {{ admin.description || '暂无简介' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-if="adminStatus === 2" class="rounded-lg border p-4">
                        无法获取组织信息；
                        <a
                            class="text-primary dark:text-primary-200 underline"
                            href="#"
                            @click.prevent="() => getAdmin(selectedAdminId)"
                            >重试</a
                        >
                    </p>
                </template>

                <div v-else class="rounded-lg border p-4 text-gray-700 dark:text-gray-300">
                    请在左侧选择一个组织查看详情
                </div>
            </div>
        </div>
    </div>
</template>
