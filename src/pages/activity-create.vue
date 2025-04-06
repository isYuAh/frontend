<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { nanoid } from '@utils/crypto';
import ActivityEdit from '@components/activity-edit.vue';
import { inject } from 'vue';

const { setMessage } = inject('banner') as any;

setTitle('创建活动');

let id = 'new_' + nanoid(8);

const onSaved = () => {
    setMessage({
        type: 'success',
        message: '成功创建活动',
    });
    setTimeout(() => {
        window.location.reload();
    }, 3000);
};
</script>

<template>
    <h2 class="mb-4 text-2xl font-black">创建活动</h2>
    <ActivityEdit :id="id" :on-saved="onSaved" />
</template>
