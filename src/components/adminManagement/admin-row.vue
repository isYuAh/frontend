<script setup lang="ts">
import { Admin, getUserTypeString, UserType } from '@/models/user';
import { devConfig } from '@/utils/devConfig';
import { inject, ref } from 'vue';
import InputText from '@components/input-text.vue';
import InputSelect from '@components/input-select.vue';

const { setMessage } = inject('banner') as any;

const userTypeIterator = Object.entries(UserType)
    .filter(([_, k]) => !Number.isInteger(k))
    .map(([k, _]) => {
        return {
            label: getUserTypeString(k)!,
            value: k,
        };
    });

interface AdminView {
    id: string;
    name: string;
    type: string;
    password: string;
    head: string;
}

const props = defineProps<{
    admin: AdminView;
    headChoices: {
        label: string;
        value: string;
    }[];
}>();
const editing = ref(props.admin.id.startsWith('new_'));

function handleSubmit() {
    if (props.admin.id.startsWith('new_')) {
        if (props.admin.password === '') {
            setMessage({ message: '新用户密码不能为空', type: 'error' });
            return;
        }
        if (props.admin.name === '') {
            setMessage({ message: '用户名称不能为空', type: 'error' });
            return;
        }
        Admin.createAdmin(
            {
                id: props.admin.id.substring(4),
                name: props.admin.name,
                type: props.admin.type,
                head: props.admin.head,
                password: props.admin.password,
            },
            {
                serverEndpoint: devConfig.serverEndpoint,
            }
        ).then((res) => {
            setMessage({ message: '创建成功', type: 'success' });
            props.admin.id = res.id;
            editing.value = false;
        });
    } else {
        if (props.admin.name === '') {
            setMessage({ message: '用户名称不能为空', type: 'error' });
            return;
        }
        Admin.updateAdmin(
            props.admin.id,
            {
                description: '',
                name: props.admin.name,
                type: Number(props.admin.type),
                head: props.admin.head.startsWith('new_') ? props.admin.head.substring(4) : props.admin.head,
                password: props.admin.password,
            },
            {
                serverEndpoint: devConfig.serverEndpoint,
            }
        ).then((_) => {
            setMessage({ message: '修改成功', type: 'success' });
            editing.value = false;
        });
    }
}

function handleDelete() {
    if (!confirm('确认删除？')) return;
    if (props.admin.id.startsWith('new_')) {
        // TODO:
    } else {
        Admin.deleteAdmin(props.admin.id, {
            serverEndpoint: devConfig.serverEndpoint,
        });
    }
}
</script>

<template>
    <tr class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
            <span>{{ admin.id }}</span>
        </th>
        <td>
            <template v-if="!editing">
                <span>{{ admin.name }}</span>
            </template>
            <template v-else>
                <input-text class="mx-1 w-32 py-2" name="name" type="text" v-model="admin.name" />
            </template>
        </td>
        <td>
            <template v-if="!editing">
                {{ getUserTypeString(admin.type) }}
            </template>
            <template v-else>
                <input-select class="mx-1 py-2" name="userType" :options="userTypeIterator" v-model="admin.type" />
            </template>
        </td>
        <td>
            <template v-if="!editing">
                {{
                    headChoices.find(({ value }) => admin.head !== '' && value === admin.head)?.label || '❌（无上级）'
                }}
            </template>
            <template v-else>
                <input-select class="mx-1 py-2" name="head" :options="headChoices" v-model="admin.head" />
            </template>
        </td>
        <td>
            <template v-if="!editing">
                <span>{{ admin.password }}</span>
            </template>
            <template v-else>
                <input-text
                    class="mx-1 py-2"
                    name="password"
                    type="text"
                    v-model="admin.password"
                    placeholder="输入新密码，为空则不修改"
                />
            </template>
        </td>
        <td>
            <a
                class="text-primary dark:text-primary-200 m-1 underline"
                href="?"
                v-if="!props.admin.id.startsWith('new_')"
                @click.prevent="editing = !editing"
                >{{ editing ? '取消' : '修改' }}</a
            >
            <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="handleSubmit">提交</a>
            <a class="m-1 text-red-500 underline dark:text-red-200" href="?" @click.prevent="handleDelete">删除</a>
        </td>
    </tr>
</template>
