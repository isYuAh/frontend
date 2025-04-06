<script lang="ts" setup>
import { Activity } from '@models/activity';
import ActivityEdit from '@components/activity-edit.vue';

interface Model {
    id: string;
    name: string;
    date: string;
    description: string;
    location: string;
}

const { id, editable, onSaved } = defineProps<{
    id: string;
    editable: boolean;
    onSaved: (activity: Model) => void;
}>();
</script>

<template>
    <h3 class="mb-4 text-2xl font-black">活动详情</h3>
    <activity-edit :id="id" :editable="editable" :on-saved="onSaved" />
</template>
