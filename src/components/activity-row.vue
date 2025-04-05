<script lang="ts" setup>
import { ActivityState, getActivityStateString } from '@models/activity';
import { inject } from 'vue';
import { GoodDate } from '@utils/datetime';

const { setMessage } = inject('banner') as any;

interface ActivityView {
    id: string;
    name: string;
    date: GoodDate;
    state: ActivityState;
    actions: string[];
}

const { activity, onAction } = defineProps<{
    activity: ActivityView;
    onAction: (action: string) => void;
}>();
</script>

<template>
    <tr class="border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <th class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white" scope="row">
            <span>{{ activity.id }}</span>
        </th>
        <td>
            <span>{{ activity.name }}</span>
        </td>
        <td>
            <span>{{ activity.date.toLocalizedDateString() }}</span>
        </td>
        <td>
            <span>{{ getActivityStateString(activity.state) }}</span>
        </td>
        <td>
            <a
                v-for="action in activity.actions"
                class="text-primary dark:text-primary-200 m-1 underline"
                href="?"
                @click.prevent="
                    () => {
                        onAction(action);
                    }
                "
            >
                {{ action }}
            </a>
        </td>
    </tr>
</template>
