<script setup lang="ts">
import { setTitle } from '@utils/title';
import { Admin, getUserTypeString } from '@models/user';
import { computed, inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import AdminRow from '@components/admin-row.vue';
import { nanoid } from '@utils/crypto';

const { setMessage } = inject('banner') as any;

setTitle('管理管理员');

interface Model {
    id: string;
    name: string;
    type: string;
    password: string;
    head: string;
}

let admins = ref<Model[]>([]),
    status = ref(0);
let headChoices = computed(() => {
    return [
        ...admins.value
            .filter((admin) => admin.id !== '')
            .map((admin) => {
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
const getAdmins = async () => {
    status.value = 0;
    try {
        const t = await Admin.listAdmin({
            serverEndpoint: 'http://127.0.0.1/api',
        });
        admins.value = t.map((admin) => {
            return {
                id: admin.id,
                name: admin.name,
                type: admin.type.toString(),
                password: '',
                head: admin.head,
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
        head: '',
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
                    <a @click.prevent="addAdmin" href="?" class="text-primary dark:text-primary-200 underline">
                        添加一个新管理员
                    </a>
                    或者
                    <a @click.prevent="getAdmins" class="text-primary dark:text-primary-200 underline" href="?">
                        重新加载（这会丢失未提交的数据）
                    </a>
                </p>
            </caption>
            <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">ID</th>
                    <th scope="col" class="px-6 py-3">名称</th>
                    <th scope="col" class="px-6 py-3">类型</th>
                    <th scope="col" class="px-6 py-3">上级</th>
                    <th scope="col" class="px-6 py-3">密码</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <AdminRow
                    v-for="admin in admins"
                    :key="admin.id"
                    :mode="'view'"
                    :admin="admin"
                    :head-choices="headChoices"
                    @delete-temporary-admin="admins.splice(admins.indexOf(admin), 1)"
                />
            </tbody>
        </table>
    </div>
    <p v-if="status === 2">
        无法获取管理员信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getAdmins">重试</a>
    </p>
</template>
