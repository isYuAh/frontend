<script lang="ts" setup>
import { setTitle } from '@utils/title';
import { inject, ref } from 'vue';
import { devConfig } from '@utils/devConfig';
import * as XLSX from 'xlsx';
import { getCookie } from '@utils/cookie';

const { setMessage } = inject('banner') as any;

setTitle('学生管理页');

const uploading = ref(false);
const sessionID = ref<string | null>(null);
const csvData = ref<{ classes?: any[]; schools?: any[]; students?: any[] }>({});

function downloadCSV(data: any[], headers: string[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    console.log(ws, wb, data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const blob = new Blob([wbout], { type: 'text/csv;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function handleUploadCSV() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,text/csv';
    fileInput.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        uploading.value = true;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const lines: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
            const filteredLines = lines.filter(
                (row) => Array.isArray(row) && row.some((cell) => String(cell).trim() !== '')
            );
            if (!filteredLines.length) {
                setMessage({ message: '文件内容为空', type: 'error' });
                return;
            }
            const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(filteredLines));
            const res = await fetch(devConfig.serverEndpoint + '/user/student/import', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
                body: JSON.stringify({ csv }),
            });
            if (!res.ok) {
                let errMsg = '未知错误';
                const errData = await res.json();
                errMsg = errData.message || errMsg;
                console.error(errMsg);
                return;
            }
            const resData = await res.json();
            sessionID.value = resData.data.sessionID;
            csvData.value = resData.data;
            setMessage({ message: '上传成功', type: 'success' });
        } catch (err: any) {
            setMessage({ message: '上传失败', type: 'error' });
        } finally {
            uploading.value = false;
        }
    };
    fileInput.click();
}

async function handleConfirm() {
    if (!sessionID.value) {
        setMessage({ message: '请先上传并获取 sessionID', type: 'error' });
        return;
    }
    uploading.value = true;
    try {
        const res = await fetch(devConfig.serverEndpoint + '/user/student/import/' + sessionID.value, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
        });
        if (!res.ok) {
            let errMsg = '未知错误';
            const errData = await res.json();
            errMsg = errData.message || errMsg;
            console.error(errMsg);
            return;
        }
        setMessage({ message: '导入成功', type: 'success' });
    } catch (err: any) {
        setMessage({ message: '导入失败', type: 'error' });
        console.error(err);
    } finally {
        uploading.value = false;
    }
}

function handleDownload(type: 'classes' | 'schools' | 'students', headers: string[], filename: string) {
    const data = csvData.value[type];
    if (!data || !Array.isArray(data) || !data.length) {
        setMessage({ message: '请先上传数据', type: 'error' });
        return;
    }
    downloadCSV(data, headers, filename);
}

async function handleDelete() {
    if (confirm('确定要清空记录？该操作不可逆')) {
        try {
            const response = await fetch(devConfig.serverEndpoint + '/user/student', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: getCookie('token') || '',
                    },
                }),
                json = await response.json();
            if (!response.ok) {
                setMessage({ message: '清空失败', type: 'error' });
                console.error(json.message);
            }
        } catch (err) {
            setMessage({ message: '清空失败', type: 'error' });
            console.error(err);
        }
    }
}
</script>

<template>
    <div class="mx-auto flex min-h-[60vh] w-full flex-col items-center justify-center px-4">
        <h1 class="mb-10 text-3xl font-black">学生管理页</h1>
        <div class="m-4 rounded-lg border p-4">
            <div class="mb-8 flex flex-wrap items-center justify-center gap-4">
                <button
                    :disabled="uploading"
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="handleUploadCSV"
                >
                    上传 CSV
                </button>
                <button
                    :disabled="uploading || !sessionID"
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="() => handleDownload('classes', ['name', 'school'], '班级变化.csv')"
                >
                    下载班级变化
                </button>
                <button
                    :disabled="uploading || !sessionID"
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="() => handleDownload('schools', ['name'], '学院变化.csv')"
                >
                    下载学院变化
                </button>
                <button
                    :disabled="uploading || !sessionID"
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="() => handleDownload('students', ['class', 'oid', 'name', 'type'], '学生变化.csv')"
                >
                    下载学生变化
                </button>
                <button
                    :disabled="uploading || !sessionID"
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="handleConfirm"
                >
                    确认导入
                </button>
            </div>
            <div>
                <p class="text-lg font-bold">更新学生过程：</p>
                <ol class="list-inside list-decimal">
                    <li>选择包括需要更新的学生信息的 CSV 文件上传；</li>
                    <li>下载检查发生变动的班级、学生、学院信息是否正确；</li>
                    <li>点击“确认导入”，完成更新操作</li>
                </ol>
            </div>
        </div>
        <div class="m-4 rounded-lg border p-4">
            <div class="mb-8">
                <button
                    class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 dark:bg-primary-400 dark:hover:bg-primary-300 dark:disabled:bg-primary-100 rounded-lg px-6 py-3 text-lg font-semibold text-white shadow transition-colors disabled:cursor-not-allowed"
                    type="button"
                    @click="handleDelete"
                >
                    清空学生、学院、班级记录
                </button>
            </div>
            <div>
                <p class="text-lg font-bold">清空学生操作：</p>
                <p>该操作用于在学生记录被污染时清空记录，便于重新导入干净的记录</p>
            </div>
        </div>
    </div>
</template>
