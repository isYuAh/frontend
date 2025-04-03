<template>
  <tr
    class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
  >
    <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
      <span>{{ admin.id }}</span>
    </th>
    <td>
      <template v-if="editing === false">
        <span>{{ admin.name }}</span>
      </template>
      <template v-else>
        <input class="border border-gray-500 px-2 py-1" type="text" v-model="admin.name">
      </template>
    </td>
    <td>
      <template v-if="editing === false">
        {{ getUserTypeString(admin.type) }}
      </template>
      <template v-else>
        <select class="border border-gray-500 px-2 py-1" v-model="admin.type">
          <option :value="userType[0]" v-for="userType in userTypeIterator">{{ userType[1] }}</option>
        </select>
      </template>
    </td>
    <td>
      <template v-if="editing === false">
        {{ headChoice.find(({id}) => admin.head !== '' && id === admin.head)?.text || '❌（无上级）' }}
      </template>
      <template v-else>
        <select class="border border-gray-500 px-2 py-1" v-model="admin.head">
          <option :value="choice.id" v-for="choice in headChoice">{{ choice.text }}</option>
        </select>
      </template>
    </td>
    <td>
      <template v-if="editing === false">
        <span>{{ admin.password }}</span>
      </template>
      <template v-else>
        <input class="border border-gray-500 px-2 py-1" type="text" v-model="admin.password" placeholder="输入新密码，为空则不修改">
      </template>
    </td>
    <td>
        <a class="text-primary dark:text-primary-200 underline m-1" @click.prevent="editing = !editing">{{ editing ? '取消修改' : '修改' }}</a>
        <a class="text-primary dark:text-primary-200 underline m-1" @click.prevent="handleSubmit">提交</a>
        <a class="text-red-500 dark:text-red-200 underline m-1" @click.prevent="handleDelete">删除</a>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Admin, getUserTypeString, UserType } from '@/models/user';
import { devConfig } from '@/utils/devConfig';
import { computed, inject, ref } from 'vue';
const { setMessage } = inject('banner') as any;
const userTypeIterator = Object.entries(UserType).filter(([_, k]) => !Number.isInteger(k)).map(([k, _]) => [k, getUserTypeString(k)])
interface AdminView {
  id: string,
  name: string,
  type: string,
  password: string,
  head: string,
}

const props = defineProps<{
  admin: AdminView,
  headChoice: {
    id: string,
    text: string,
  }[]
}>()
const mode = ref('view')
const editing = computed({
  get() {
    return mode.value === 'edit'
  },
  set(newVal) {
    if (newVal) {
      mode.value = 'edit'
    } else {
      mode.value = 'view'
    }
  }
})
function handleSubmit() {
  if (props.admin.id === '') {
    if (props.admin.password === '') {
      setMessage({message: '新用户密码不能为空', type: 'error'})
      return
    }
    if (props.admin.name === '') {
      setMessage({message: '用户名称不能为空', type: 'error'})
      return
    }
    Admin.createAdmin({
      name: props.admin.name,
      type: props.admin.type,
      head: props.admin.head,
      password: props.admin.password
    }, {
      serverEndpoint: devConfig.serverEndpoint
    }).then(res => {
      setMessage({ message: '创建成功', type: 'success' })
      props.admin.id = res.id
      editing.value = false
    })
  }else {
    if (props.admin.name === '') {
      setMessage({message: '用户名称不能为空', type: 'error'})
      return
    }
    Admin.updateAdmin(props.admin.id, {
      description: '',
      name: props.admin.name,
      type: Number(props.admin.type),
      head: props.admin.head,
      password: props.admin.password
    }, {
      serverEndpoint: devConfig.serverEndpoint
    }).then(_ => {
      setMessage({message: '修改成功', type: 'success'})
      editing.value = false
    })
  }
}
function handleDelete() {
  if (!confirm('确认删除？')) return
  Admin.deleteAdmin(props.admin.id, {
    serverEndpoint: devConfig.serverEndpoint 
  })
}
</script>