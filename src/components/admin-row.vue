<script lang="ts" setup>
import { Admin, getUserTypeString, UserType } from '@models/user';
import { devConfig } from '@utils/devConfig';
import { computed, inject, ref } from 'vue';
import InputText from '@components/input-text.vue';
import InputSelect from '@components/input-select.vue';
import { getStorageItem } from '@utils/storage';

const { setMessage } = inject('banner') as any;
const emit = defineEmits(['deleteTemporaryAdmin']);

let currentUserID: string;
try {
    currentUserID = JSON.parse(getStorageItem('admin') || '{}').id;
} catch (_) {
    window.location.href = '/sign-in';
}

const userTypeIterator = Object.entries(UserType)
    .filter(([_, k]) => !Number.isInteger(k))
    .map(([k, _]) => {
        return {
            label: getUserTypeString(k)!,
            value: k,
        };
    });

const allInstructors = computed(() => {
        return props.headChoices.filter(({ level }) => level === UserType.UserInstructor);
    }),
    allCommittees = computed(() => {
        return props.headChoices.filter(
            ({ level }) => level === UserType.UserCommittee || level === UserType.UserLocalCommittee
        );
    });

interface AdminView {
    id: string;
    name: string;
    type: string;
    password: string;
    instructor?: string;
    committee?: string;
}

const props = defineProps<{
    admin: AdminView;
    headChoices: {
        label: string;
        value: string;
        level: number;
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
                type: parseInt(props.admin.type),
                instructor: props.admin.instructor,
                committee: props.admin.committee,
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
                instructor: props.admin.instructor?.startsWith('new_')
                    ? props.admin.instructor.substring(4)
                    : props.admin.instructor,
                committee: props.admin.committee?.startsWith('new_')
                    ? props.admin.committee.substring(4)
                    : props.admin.committee,
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
        emit('deleteTemporaryAdmin');
    } else {
        Admin.deleteAdmin(props.admin.id, {
            serverEndpoint: devConfig.serverEndpoint,
        });
    }
}
</script>

<template>
    <tr class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <th class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white" scope="row">
            <span>{{ admin.id }}</span>
        </th>
        <td>
            <template v-if="!editing">
                <span>{{ admin.name }}</span>
            </template>
            <template v-else>
                <input-text v-model="admin.name" class="mx-1 w-32 py-2" name="name" type="text" />
            </template>
        </td>
        <td>
            <template v-if="!editing || currentUserID === admin.id">
                {{ getUserTypeString(admin.type) }}
            </template>
            <template v-else>
                <input-select v-model="admin.type" :options="userTypeIterator" class="mx-1 py-2" name="userType" />
            </template>
        </td>
        <td>
            <template
                v-if="admin.type === UserType.UserOrg.toString() || admin.type === UserType.UserLocalOrg.toString()"
            >
                <template v-if="!editing">
                    {{ headChoices.find(({ value }) => value === admin.instructor)?.label || '❌（无上级）' }}
                </template>
                <template v-else>
                    <input-select v-model="admin.instructor" :options="allInstructors" class="mx-1 py-2" name="head" />
                </template>
            </template>
        </td>
        <td>
            <template
                v-if="admin.type === UserType.UserOrg.toString() || admin.type === UserType.UserLocalOrg.toString()"
            >
                <template v-if="!editing">
                    {{ headChoices.find(({ value }) => value === admin.committee)?.label || '❌（无上级）' }}
                </template>
                <template v-else>
                    <input-select v-model="admin.committee" :options="allCommittees" class="mx-1 py-2" name="head" />
                </template>
            </template>
        </td>
        <td>
            <template v-if="!editing">
                <span>{{ admin.password }}</span>
            </template>
            <template v-else>
                <input-text
                    v-model="admin.password"
                    class="mx-1 py-2"
                    name="password"
                    placeholder="输入新密码，为空则不修改"
                    type="text"
                />
            </template>
        </td>
        <td>
            <a
                v-if="!props.admin.id.startsWith('new_')"
                class="text-primary dark:text-primary-200 m-1 underline"
                href="?"
                @click.prevent="editing = !editing"
                >{{ editing ? '取消' : '修改' }}</a
            >
            <a class="text-primary dark:text-primary-200 m-1 underline" href="?" @click.prevent="handleSubmit">提交</a>
            <a class="m-1 text-red-500 underline dark:text-red-200" href="?" @click.prevent="handleDelete">删除</a>
        </td>
    </tr>
</template>
