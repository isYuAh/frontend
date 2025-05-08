<script lang="ts" setup>
import { ActivityDetail } from '@models/detail';
import { inject, ref } from 'vue';
import Spinner from '@components/spinner.vue';
import DetailRow from '@components/detail-row.vue';
import { nanoid } from '@utils/crypto';
import { devConfig } from '@utils/devConfig';

const { setMessage } = inject('banner') as any;

const { id, editable, ticketable } = defineProps<{ id: string; editable: boolean; ticketable: boolean }>();

interface Model {
    id: string;
    name: string;
    maxPoints: number;
}

const emit = defineEmits(['checkTicket']);
let details = ref<Model[]>([]),
    status = ref(0);

const getActivityDetails = async () => {
    status.value = 0;
    try {
        const t = await ActivityDetail.list(id, {
            serverEndpoint: devConfig.serverEndpoint,
        });
        details.value = t.map((detail) => {
            return {
                id: detail.id,
                name: detail.name,
                maxPoints: detail.maxPoints,
            };
        });
        setMessage({
            type: 'success',
            message: '成功获取活动信息',
        });
        status.value = 1;
    } catch (e) {
        setMessage({
            type: 'error',
            message: '无法获取活动信息',
        });
        console.error(e);
        status.value = 2;
    }
};

getActivityDetails();

const addDetail = () => {
    let newDetail: Model = {
        id: 'new_' + nanoid(6),
        name: '',
        maxPoints: 0,
    };

    details.value.push(newDetail);
    setTimeout(() => {
        let el = document.querySelector('tbody tr:last-child');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
};
</script>

<template>
    <Spinner v-if="status === 0" />
    <div v-if="status !== 2" class="relative overflow-x-auto shadow-lg sm:rounded-lg">
        <table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <caption
                class="bg-white p-5 text-left text-lg font-semibold text-gray-900 rtl:text-right dark:bg-gray-800 dark:text-white"
            >
                活动事项列表
                <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    <template v-if="editable">
                        选择活动修改活动事项。
                        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="addDetail">
                            添加一个新事项
                        </a>
                    </template>
                    <template v-else>查看活动事项。</template>
                    或者
                    <a
                        class="text-primary dark:text-primary-200 underline"
                        href="?"
                        @click.prevent="getActivityDetails"
                    >
                        重新加载
                        <template v-if="editable"> （这会丢失未提交的数据）</template>
                    </a>
                </p>
            </caption>
            <thead class="bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th class="px-6 py-3" scope="col">ID</th>
                    <th class="px-6 py-3" scope="col">名称</th>
                    <th class="px-6 py-3" scope="col">最大分数</th>
                    <th class="px-6 py-3" scope="col">操作</th>
                </tr>
            </thead>
            <tbody>
                <DetailRow
                    v-for="detail in details"
                    :key="detail.id"
                    :activity-id="id"
                    :detail="detail"
                    :editable="editable"
                    :ticketable="ticketable"
                    @check-ticket="(detailId: any) => emit('checkTicket', detailId)"
                    @delete-temporary-detail="details.splice(details.indexOf(detail), 1)"
                />
            </tbody>
        </table>
        <p v-if="details.length === 0" class="my-4 block text-center font-bold">无活动事项</p>
    </div>
    <p v-if="status === 2">
        无法获取活动事项信息；
        <a class="text-primary dark:text-primary-200 underline" href="?" @click.prevent="getActivityDetails">
            重新加载
        </a>
    </p>
    <p class="mt-8 font-bold">
        注意：若要新建或修改活动事项，最大分值请填入 ×100 后的值。例如，参与 A 活动最多可以加 4 分时请最大分值请填入
        400。分值精度保留到 0.01。
    </p>
</template>
