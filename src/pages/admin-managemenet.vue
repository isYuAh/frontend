<script setup lang="ts">
import { setTitle } from '@utils/title';
import { Admin, getUserTypeString } from '@models/user';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';

const { setMessage } = inject('banner');

setTitle('管理管理员');

interface Model {
    id: string;
    name: string;
    type: string;
    password: string | null;
    head: string;
}

let admins = ref<Model[]>([]),
    status = ref(0);

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
                password: null,
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
        console.log(e);
        status.value = 2;
    }
};

getAdmins();

const getAdminHead = (head: string) => {
    let admin = admins.value.find((admin) => admin.id === head);
    return admin ? `${admin.name}（${getUserTypeString(admin.type)}）` : '错误 ❌（无上级）';
};

const addAdmin = () => {
    let newAdmin = {
        id: 'new',
        name: '',
        type: '0',
        password: null,
        head: '0',
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
                <tr
                    v-for="admin in admins"
                    :key="admin.id"
                    class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                    <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                        {{ admin.id }}
                    </th>
                    <td>{{ admin.name }}</td>
                    <td>{{ getUserTypeString(admin.type) }}</td>
                    <td>{{ getAdminHead(admin.head) }}</td>
                    <td>{{ admin.password }}</td>
                    <td>
                        <a class="text-primary dark:text-primary-200 underline" :href="'/admin/' + admin.id">修改</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <p v-if="status === 2">
        无法获取管理员信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getAdmins">重试</a>
    </p>
</template>
