<template>
  <div class="reward-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="关键词"><el-input v-model="filters.keyword" clearable placeholder="批次号/总批次/经销商/产品" /></el-form-item>
        <el-form-item label="生成状态"><el-select v-model="filters.generated" clearable placeholder="全部"><el-option label="全部" value="" /><el-option label="未生成" value="未生成" /><el-option label="已生成" value="已生成" /></el-select></el-form-item>
        <el-form-item label="批次状态"><el-select v-model="filters.status" clearable placeholder="全部"><el-option label="全部" value="" /><el-option label="正常" value="正常" /><el-option label="禁用" value="禁用" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="applyFilters">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button @click="exportBatch">数据导出</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-card" shadow="never">
      <el-table :data="filteredRows" stripe class="batch-table">
        <el-table-column prop="batchNo" label="批次号" min-width="150" /><el-table-column prop="totalBatch" label="总批次" min-width="130" /><el-table-column prop="dealer" label="经销商" min-width="130" /><el-table-column prop="product" label="产品名称" min-width="130" /><el-table-column prop="count" label="奖码数量" min-width="110" align="center" /><el-table-column prop="pending" label="待激活数" min-width="110" align="center" /><el-table-column prop="unscanned" label="未扫数量" min-width="110" align="center" /><el-table-column prop="scanned" label="已扫码数" min-width="110" align="center" /><el-table-column prop="winning" label="中奖数量" min-width="110" align="center" /><el-table-column prop="generated" label="生成状态" min-width="100" /><el-table-column prop="status" label="状态" min-width="80" />
        <el-table-column label="操作" width="250" fixed="right"><template #default="{ row }"><div class="row-actions"><el-button v-if="row.generated === '未生成'" link type="success" @click="generate(row)">立即生成</el-button><el-button v-else link type="primary" @click="downloadCodes(row)">下载奖码</el-button><el-dropdown trigger="hover"><el-button link>更多<el-icon><ArrowDown /></el-icon></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="showPrize(row)">查看中奖率</el-dropdown-item><el-dropdown-item @click="showCodes(row)">奖码列表</el-dropdown-item><el-dropdown-item @click="downloadCodes(row)">下载奖码</el-dropdown-item><el-dropdown-item @click="showLogs(row)">下载记录</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="codesVisible" title="奖码列表" width="920px" class="codes-dialog" destroy-on-close>
      <div class="code-toolbar"><div class="code-filter"><span class="toolbar-label">奖码状态</span><el-select v-model="codeFilter" placeholder="全部状态" @change="codePage = 1"><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select></div><el-button type="primary" plain @click="exportCodes">导出奖码列表</el-button></div>
      <el-table :data="visibleCodes" height="420" stripe class="codes-table"><el-table-column prop="id" label="奖码ID" min-width="150" /><el-table-column prop="link" label="二维码链接" min-width="220" show-overflow-tooltip /><el-table-column prop="verify" label="验证码" min-width="100" /><el-table-column prop="status" label="奖码状态" min-width="100" /><el-table-column prop="result" label="扫码结果" min-width="210" show-overflow-tooltip /><el-table-column prop="time" label="创建时间" min-width="160" /></el-table>
      <div class="dialog-pagination"><el-pagination v-model:current-page="codePage" :page-size="8" layout="total, prev, pager, next" :total="filteredCodes.length" background /></div>
    </el-dialog>
    <el-dialog v-model="prizeVisible" title="中奖率" width="700px"><el-table v-if="selected" :data="selected.prizes" stripe><el-table-column prop="name" label="关联奖项" /><el-table-column label="中奖率" width="170"><template #default="{ row }"><el-input v-model="row.rate" class="rate-input"><template #append>%</template></el-input></template></el-table-column><el-table-column prop="stock" label="奖项库存" /><el-table-column label="已中数"><template #default="{ row }">{{ Math.floor(row.stock * 0.2) }}</template></el-table-column><el-table-column label="剩余数"><template #default="{ row }">{{ row.stock - Math.floor(row.stock * 0.2) }}</template></el-table-column></el-table><template #footer><el-button type="primary" @click="savePrize">保存修改</el-button></template></el-dialog>
    <el-dialog v-model="logsVisible" title="下载记录" width="620px"><el-table :data="selected?.logs || []" stripe><el-table-column prop="operator" label="操作人" /><el-table-column prop="time" label="下载时间" /><el-table-column prop="ip" label="操作IP" /></el-table></el-dialog>
  </div>
</template>
<script setup lang="ts" name="rewardBatch">
import { ArrowDown } from '@element-plus/icons-vue'
const statuses = ['全部状态', '待激活', '已激活', '待兑奖', '待核销', '已完成', '已回收']
const filters = reactive({ keyword: '', generated: '', status: '' }); const appliedFilters = reactive({ keyword: '', generated: '', status: '' })
const rows = reactive<any[]>(Array.from({ length: 12 }, (_, i) => { const count = 5000 + i * 280; const pending = Math.max(0, 680 - i * 24); const scanned = count - pending; return { batchNo: `JM202608${101 + i}`, totalBatch: `ZP202608${21 + i}`, dealer: ['华东经销商', '华南经销商'][i % 2], product: ['青柠气泡水', '经典原味茶'][i % 2], generated: i % 3 ? '已生成' : '未生成', status: i % 5 ? '正常' : '禁用', prizes: [{ name: '一等奖', rate: 1, stock: 20 }, { name: '二等奖', rate: 3, stock: 80 }], logs: [{ operator: '管理员', time: '2026-08-28 15:20:00', ip: '192.168.1.10' }], count, pending, unscanned: pending, scanned, winning: Math.round(scanned * 0.08) } }))
const filteredRows = computed(() => rows.filter(r => { const keyword = appliedFilters.keyword.trim(); return (!keyword || [r.batchNo, r.totalBatch, r.dealer, r.product].some(v => v.includes(keyword))) && (!appliedFilters.generated || r.generated === appliedFilters.generated) && (!appliedFilters.status || r.status === appliedFilters.status) }))
const codesVisible = ref(false); const prizeVisible = ref(false); const logsVisible = ref(false); const selected = ref<any>(); const codeRows = ref<any[]>([]); const codeFilter = ref('全部状态'); const codePage = ref(1)
const filteredCodes = computed(() => codeRows.value.filter(r => codeFilter.value === '全部状态' || r.status === codeFilter.value)); const visibleCodes = computed(() => filteredCodes.value.slice((codePage.value - 1) * 8, codePage.value * 8))
const applyFilters = () => Object.assign(appliedFilters, filters); const resetFilters = () => { Object.assign(filters, { keyword: '', generated: '', status: '' }); applyFilters() }
const generate = (r: any) => ElMessageBox.confirm(`确认生成${r.batchNo}奖码？`, '二次确认').then(() => { r.generated = '已生成'; ElMessage.success('奖码和验证码已生成') }).catch(() => {}); const showPrize = (r: any) => { selected.value = r; prizeVisible.value = true }; const savePrize = () => ElMessageBox.confirm('确认保存中奖率修改？', '二次确认').then(() => { prizeVisible.value = false; ElMessage.success('中奖率已保存') }).catch(() => {})
const showCodes = (r: any) => { selected.value = r; codeRows.value = Array.from({ length: 18 }, (_, i) => { const status = statuses[(i % 6) + 1]; const result = status === '已完成' ? (i === 4 ? '获得100积分' : '加5元兑换50元迈极炫一包') : ['待兑奖', '待核销'].includes(status) ? '加5元兑换50元迈极炫一包' : '-'; return { id: `${r.batchNo}-${i + 1}`, link: `https://m.example.com/${r.batchNo}-${i + 1}`, verify: String(100000 + i), status, result, time: '2026-08-28 11:20:00' } }); codeFilter.value = '全部状态'; codePage.value = 1; codesVisible.value = true }
const exportCodes = () => { const data = [['二维码链接', '验证码'], ...codeRows.value.map(r => [r.link, r.verify])]; const url = URL.createObjectURL(new Blob([`\ufeff${data.map(r => r.join(',')).join('\n')}`], { type: 'application/vnd.ms-excel' })); const a = document.createElement('a'); a.href = url; a.download = `${selected.value?.dealer || ''}${selected.value?.product || ''}${selected.value?.batchNo || ''}.xls`; a.click(); URL.revokeObjectURL(url) }
const downloadCodes = (r: any) => { selected.value = r; const data = [['二维码链接', '验证码'], ...Array.from({ length: Math.min(r.count, 100) }, (_, i) => [`https://m.example.com/${r.batchNo}-${i + 1}`, String(100000 + i).padStart(6, '0')])]; const url = URL.createObjectURL(new Blob([`\ufeff${data.map(x => x.join(',')).join('\n')}`], { type: 'application/vnd.ms-excel' })); const a = document.createElement('a'); a.href = url; a.download = `${r.dealer}${r.product}${r.batchNo}.xls`; a.click(); URL.revokeObjectURL(url); ElMessage.success('奖码文件已下载') }; const showLogs = (r: any) => { selected.value = r; logsVisible.value = true }; const exportBatch = () => ElMessage.success('批次数据已导出')
</script>
<style scoped>
.reward-page { padding: 20px; background: #f5f7fa; min-height: 100%; }
.filter-card, .list-card { border: 1px solid #ebeef5; box-shadow: none !important; }
.filter-card { margin-bottom: 16px; }
.filter-form { display: flex; flex-wrap: wrap; align-items: center; }
.filter-form :deep(.el-form-item) { margin-bottom: 0; margin-right: 18px; }
.filter-form :deep(.el-input) { width: 250px; }
.filter-form :deep(.el-select) { width: 150px; }
.batch-table :deep(.el-table__cell) { padding: 12px 0; }
.row-actions { display: flex; align-items: center; gap: 18px; white-space: nowrap; }
.code-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 2px 0; }
.code-filter { display: flex; align-items: center; gap: 10px; }
.code-filter :deep(.el-select) { width: 180px; }
.code-filter :deep(.el-input__inner), .code-filter :deep(.el-select__selected-item) { white-space: nowrap; }
.toolbar-label { color: #606266; font-size: 14px; }
.codes-table { width: 100%; }
.dialog-pagination { display: flex; justify-content: flex-end; padding-top: 16px; }
.codes-dialog :deep(.el-dialog__body) { padding-top: 12px; padding-bottom: 12px; }
.rate-input { width: 135px; }
.rate-input :deep(.el-input-group__append) { padding: 0 10px; white-space: nowrap; }
@media (max-width: 900px) {
  .reward-page { padding: 12px; }
  .code-toolbar { gap: 12px; flex-wrap: wrap; }
  .filter-form :deep(.el-form-item) { margin-bottom: 12px; }
}
</style>
