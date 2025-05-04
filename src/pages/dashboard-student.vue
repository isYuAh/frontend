<script setup lang="ts">
import { setTitle } from '@utils/title';
import { ref } from 'vue';
import { devConfig } from '@utils/devConfig';
import axios from 'axios';
import * as XLSX from "xlsx";

setTitle('学生管理页');

// 用户类型枚举
enum UserType {
  UserSU,
  UserInstructor,
  UserLocalOrg,
  UserLocalCommittee,
  UserOrg,
  UserCommittee,
  UserStudent,
}

interface Student {
  id: string;
  name: string;
  class: string;
  college: string;
}

const students = ref<Student[]>([
  { id: '20230001', name: '张三', class: '计科2201', college: '计算机科学与技术学院' },
  { id: '20230002', name: '李四', class: '计科2202', college: '计算机科学与技术学院' },
  { id: '20230003', name: '王五', class: '自动化2201', college: '自动化学院' },
]);

const uploading = ref(false);
const sessionID = ref<string | null>(null);
const csvData = ref<{classes?: any[]; schools?: any[]; students?: any[]}>({});

function showMessage(msg: string, type: 'success' | 'error' = 'success') {
  // 这里可以替换为全局消息组件
  window.alert(msg);
}

function downloadCSV(data: any[], headers: string[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const wb = XLSX.utils.book_new();
  console.log(ws, wb, data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "csv", type: "array" });
  const blob = new Blob([wbout], { type: "text/csv;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
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
      // 过滤掉所有内容为空或仅包含空白的行
      const filteredLines = lines.filter(row => Array.isArray(row) && row.some(cell => String(cell).trim() !== ""));
      if (!filteredLines.length) throw new Error('CSV内容为空');
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(filteredLines));
      const res = await fetch(devConfig.serverEndpoint + '/user/student/import', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csv })
      });
      if (!res.ok) {
        let errMsg = '未知错误';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const resData = await res.json();
      sessionID.value = resData.data.sessionID;
      csvData.value = resData.data;
      showMessage('上传成功', 'success');
    } catch (err: any) {
      showMessage('上传失败: ' + (err?.message || err), 'error');
    } finally {
      uploading.value = false;
    }
  };
  fileInput.click();
}

async function handleConfirm() {
  if (!sessionID.value) {
    showMessage('请先上传并获取sessionID', 'error');
    return;
  }
  uploading.value = true;
  try {
    const res = await fetch(devConfig.serverEndpoint + '/user/student/import/' + sessionID.value, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      let errMsg = '未知错误';
      try {
        const errData = await res.json();
        errMsg = errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    showMessage('确认成功', 'success');
  } catch (err: any) {
    showMessage('确认失败: ' + (err?.message || err), 'error');
  } finally {
    uploading.value = false;
  }
}
function handleDownload(type: 'classes' | 'schools' | 'students', headers: string[], filename: string) {
  const data = csvData.value[type];
  if (!data || !Array.isArray(data) || !data.length) {
    showMessage('请先上传数据', 'error');
    return;
  }
  downloadCSV(data, headers, filename);
}
</script>

<template>
  <div class="mx-auto w-full px-4 flex flex-col items-center justify-center min-h-[60vh]">
    <h1 class="text-3xl font-black mb-10">学生管理页</h1>
    <div class="flex flex-wrap gap-4 justify-center items-center mb-8">
      <button class="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-primary-700 transition-colors font-semibold text-lg" type="button" @click="handleUploadCSV" :disabled="uploading">
        上传CSV
      </button>
      <button class="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors font-semibold text-lg" type="button" @click="() => handleDownload('classes', ['name','school'], '班级变化.csv')" :disabled="uploading">
        下载班级变化
      </button>
      <button class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-lg" type="button" @click="() => handleDownload('schools', ['name'], '学院变化.csv')" :disabled="uploading">
        下载学院变化
      </button>
      <button class="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-700 transition-colors font-semibold text-lg" type="button" @click="() => handleDownload('students', ['class','oid','name','type'], '学生变化.csv')" :disabled="uploading">
        下载学生变化
      </button>
      <button class="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 transition-colors font-semibold text-lg" type="button" @click="handleConfirm" :disabled="uploading">
        确认导入
      </button>
    </div>
  </div>
</template>
