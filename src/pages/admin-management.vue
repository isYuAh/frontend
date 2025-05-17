<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { Admin, getUserTypeString } from '@models/user';
import { computed, inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import AdminRow from '@components/admin-row.vue';
import { nanoid } from '@utils/crypto';
import { devConfig } from '@utils/devConfig';

const { setMessage } = inject('banner') as any;

setTitle('管理管理员');

interface Model {
    id: string;
    name: string;
    type: string;
    password: string;
    instructor?: string;
    committee?: string;
}

let admins = ref<Model[]>([]),
    status = ref(0),
    config = ref({ current: 1, pageSize: 5 }),
    headChoices = computed(() => {
        return [
            ...admins.value.map((admin) => {
                return {
                    label: `${admin.name}（${getUserTypeString(admin.type)}）`,
                    value: admin.id,
                    level: Number(admin.type),
                };
            }),
            {
                label: '❌ 无上级',
                value: '',
                level: -1,
            },
        ];
    });

const totalPage = computed(() => {
    return Math.ceil(admins.value.length / config.value.pageSize);
});

const pagedAdmins = computed(() => {
    const start = (config.value.current - 1) * config.value.pageSize;
    return admins.value.slice(start, start + config.value.pageSize);
});

// 新增分页页码显示逻辑
const displayedPages = computed(() => {
    const pages = [];
    const total = totalPage.value;
    const current = config.value.current;
    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (current <= 4) {
            pages.push(1, 2, 3, 4, 5, -1, total);
        } else if (current >= total - 3) {
            pages.push(1, -1);
            for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
            pages.push(1, -1, current - 1, current, current + 1, -1, total);
        }
    }
    return pages;
});

const getAdmins = async () => {
    status.value = 0;
    try {
        const t = await Admin.listAdmin(false, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        admins.value = t.map((admin) => {
            return {
                id: admin.id,
                name: admin.name,
                type: admin.type.toString(),
                password: '',
                instructor: admin.instructor,
                committee: admin.committee,
            };
        });
        setMessage({
            type: 'success',
            message: '成功获取管理员信息',
        });
        status.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取管理员信息',
        });
        status.value = 2;
    }
};

getAdmins();

const addAdmin = () => {
    let newAdmin: Model = {
        id: 'new_' + nanoid(6),
        name: '',
        type: '0',
        password: '',
        instructor: undefined,
        committee: undefined,
    };
    admins.value.push(newAdmin);
    setTimeout(() => {
        let el = document.querySelector('tbody tr:last-child');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
};
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">管理管理员</h2>
    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <caption
                class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
            >
                管理员列表
                <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    浏览、编辑管理员。
                    <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="addAdmin">
                        添加一个新管理员
                    </a>
                    或者
                    <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getAdmins">
                        重新加载（这会丢失未提交的数据）
                    </a>
                </p>
            </caption>
            <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3" scope="col">ID</th>
                    <th class="px-6 py-3" scope="col">名称</th>
                    <th class="px-6 py-3" scope="col">类型</th>
                    <th class="px-6 py-3" scope="col">指导老师<sup>*</sup></th>
                    <th class="px-6 py-3" scope="col">所属团委<sup>*</sup></th>
                    <th class="px-6 py-3" scope="col">密码</th>
                    <th class="px-6 py-3" scope="col">操作</th>
                </tr>
            </thead>
            <tbody>
                <AdminRow
                    v-for="admin in pagedAdmins"
                    :key="admin.id"
                    :admin="admin"
                    :head-choices="headChoices"
                    @delete-temporary-admin="admins.splice(admins.indexOf(admin), 1)"
                />
            </tbody>
        </table>
        <div class="mt-4 px-4 py-2 flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-400">
                显示 {{ admins.length > 0 ? (config.current - 1) * config.pageSize + 1 : 0 }} 到
                {{ Math.min(config.current * config.pageSize, admins.length) }} 条，共 {{ admins.length }} 条
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
    </div>
    <p v-if="status === 2">
        无法获取管理员信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getAdmins">重试</a>
    </p>
    <p class="mt-8 font-bold">
        注意，当添加新用户时，若选择了新的用户作为指导老师/上级团委，该操作将不生效，请在保存好指导老师/上级团委后再选择组织的指导老师/上级团委。
    </p>
</template>
