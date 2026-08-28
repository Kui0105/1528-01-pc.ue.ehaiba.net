<template>
    <div class="dealer-list">
        <el-card class="!border-none" shadow="never">
            <el-form :model="filters" inline class="filter-form">
                <el-form-item label="筛选搜索"><el-input v-model="filters.keyword" clearable placeholder="经销商名称 / 联系人" @keyup.enter="resetPage" /></el-form-item>
                <el-form-item label="地区"><el-cascader v-model="filters.region" :options="regionOptions" clearable filterable placeholder="请选择省 / 市 / 区" /></el-form-item>
                <el-form-item label="状态"><el-select v-model="filters.status" clearable placeholder="全部状态" class="status-select"><el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" /></el-select></el-form-item>
                <el-form-item label="创建时间"><el-date-picker v-model="filters.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></el-form-item>
                <el-form-item><el-button type="primary" @click="resetPage">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button :icon="Download" @click="exportDealers">导出</el-button></el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <template #header><div class="table-heading"><span class="card-title">经销商列表</span><el-button type="primary" :icon="Plus" @click="openForm()">新增经销商</el-button></div></template>
            <el-table :data="pagedDealers" stripe table-layout="fixed" class="dealer-table">
                <el-table-column prop="name" label="经销商名称" min-width="170" class-name="first-column" label-class-name="first-column" />
                <el-table-column prop="taxNo" label="税号" min-width="160" />
                <el-table-column prop="email" label="邮箱" min-width="180" />
                <el-table-column prop="contact" label="联系人" min-width="110" />
                <el-table-column prop="phone" label="联系电话" min-width="140" />
                <el-table-column prop="region" label="地区/详细地址" min-width="220" show-overflow-tooltip />
                <el-table-column label="状态" width="100"><template #default="{ row }"><el-switch v-model="row.enabled" inline-prompt active-text="启用" inactive-text="禁用" @change="toggleStatus(row)" /></template></el-table-column>
                <el-table-column prop="createdAt" label="创建时间" min-width="170" />
                <el-table-column label="操作" width="150" fixed="right" class-name="last-column" label-class-name="last-column"><template #default="{ row }"><el-button link type="primary" @click="openForm(row)">编辑</el-button><el-button link type="danger" @click="removeDealer(row)">删除</el-button></template></el-table-column>
            </el-table>
            <div class="pagination"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next" :total="filteredDealers.length" @current-change="scrollToTop" /></div>
        </el-card>

        <el-dialog v-model="formVisible" :title="editingId ? '编辑经销商' : '新增经销商'" width="680px" destroy-on-close>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-row :gutter="20"><el-col :span="12"><el-form-item label="经销商名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="税号" prop="taxNo"><el-input v-model="form.taxNo" /></el-form-item></el-col><el-col :span="12"><el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item></el-col><el-col :span="12"><el-form-item label="联系人" prop="contact"><el-input v-model="form.contact" /></el-form-item></el-col><el-col :span="12"><el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" /></el-form-item></el-col><el-col :span="12"><el-form-item label="地区" prop="regionPath"><el-cascader v-model="form.regionPath" :options="regionOptions" clearable filterable placeholder="请选择省 / 市 / 区" /></el-form-item></el-col><el-col :span="24"><el-form-item label="详细地址" prop="address"><el-input v-model="form.address" placeholder="请输入街道、道路、门牌号等" /></el-form-item></el-col><el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.enabled"><el-radio :label="true">启用</el-radio><el-radio :label="false">禁用</el-radio></el-radio-group></el-form-item></el-col></el-row>
            </el-form>
            <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" @click="saveDealer">确认</el-button></template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="dealerLists">
import type { FormInstance, FormRules } from 'element-plus'
import { Download, Plus } from '@element-plus/icons-vue'

interface RegionOption { value: string; label: string; children?: RegionOption[] }
const regionOptions: RegionOption[] = [{ value: '上海市', label: '上海市', children: [{ value: '浦东新区', label: '浦东新区' }, { value: '徐汇区', label: '徐汇区' }] }, { value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市', children: [{ value: '天河区', label: '天河区' }, { value: '越秀区', label: '越秀区' }] }, { value: '深圳市', label: '深圳市', children: [{ value: '南山区', label: '南山区' }, { value: '福田区', label: '福田区' }] }] }, { value: '北京市', label: '北京市', children: [{ value: '朝阳区', label: '朝阳区' }, { value: '海淀区', label: '海淀区' }] }, { value: '四川省', label: '四川省', children: [{ value: '成都市', label: '成都市', children: [{ value: '武侯区', label: '武侯区' }, { value: '锦江区', label: '锦江区' }] }] }]
interface Dealer { id: string; name: string; taxNo: string; email: string; contact: string; phone: string; region: string; regionPath: string[]; address: string; enabled: boolean; createdAt: string }
const regionSamples = [['上海市', '浦东新区'], ['广东省', '广州市', '天河区'], ['北京市', '朝阳区'], ['四川省', '成都市', '武侯区']]
const dealers = reactive<Dealer[]>(Array.from({ length: 24 }, (_, index) => { const regionPath = regionSamples[index % regionSamples.length]; return { id: `DL${10001 + index}`, name: ['华东食品商贸有限公司', '华南优选供应链有限公司', '华北盛达商贸有限公司', '西南佳品经销有限公司'][index % 4], taxNo: `9131${String(100000000 + index).padStart(9, '0')}`, email: `dealer${index + 1}@example.com`, contact: ['张伟', '李娜', '王强', '陈晨'][index % 4], phone: `138${String(10000000 + index * 137).slice(0, 8)}`, region: regionPath.join(' / '), regionPath, address: `${regionPath.join('')}示例商务园区${88 + index}号${index % 2 ? 'A座1203室' : '沿街商铺2-108号'}`, enabled: index % 6 !== 0, createdAt: `2026-08-${String(28 - index % 20).padStart(2, '0')} 10:20:00` } }))
const filters = reactive({ keyword: '', region: [] as string[], status: '', dateRange: [] as string[] }); const page = ref(1); const pageSize = 10
const filteredDealers = computed(() => dealers.filter((item) => { const keyword = filters.keyword.trim(); const selectedRegion = filters.region.join(' / '); return (!keyword || `${item.name}${item.contact}${item.phone}`.includes(keyword)) && (!selectedRegion || item.region.startsWith(selectedRegion)) && (!filters.status || (filters.status === '启用' ? item.enabled : !item.enabled)) && (filters.dateRange.length !== 2 || (item.createdAt.slice(0, 10) >= filters.dateRange[0] && item.createdAt.slice(0, 10) <= filters.dateRange[1])) }))
const pagedDealers = computed(() => filteredDealers.value.slice((page.value - 1) * pageSize, page.value * pageSize)); const resetPage = () => { page.value = 1 }; const resetFilters = () => { Object.assign(filters, { keyword: '', region: [], status: '', dateRange: [] }); resetPage() }; const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const formVisible = ref(false); const editingId = ref(''); const formRef = ref<FormInstance>(); const form = reactive({ name: '', taxNo: '', email: '', contact: '', phone: '', regionPath: [] as string[], address: '', enabled: true }); const rules: FormRules = { name: [{ required: true, message: '请输入经销商名称', trigger: 'blur' }], contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }], phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }], regionPath: [{ type: 'array', required: true, message: '请选择地区', trigger: 'change' }] }
const openForm = (dealer?: Dealer) => { editingId.value = dealer?.id || ''; Object.assign(form, dealer ? { ...dealer, regionPath: [...dealer.regionPath] } : { name: '', taxNo: '', email: '', contact: '', phone: '', regionPath: [], address: '', enabled: true }); formVisible.value = true }
const saveDealer = async () => { if (!(await formRef.value?.validate().catch(() => false))) return; const region = form.regionPath.join(' / '); if (editingId.value) { const dealer = dealers.find((item) => item.id === editingId.value); if (dealer) Object.assign(dealer, form, { region, regionPath: [...form.regionPath] }) } else dealers.unshift({ ...form, region, regionPath: [...form.regionPath], id: `DL${Date.now()}`, createdAt: '2026-08-28 17:30:00' }); formVisible.value = false; ElMessage.success(editingId.value ? '经销商已更新' : '经销商已新增') }
const removeDealer = async (dealer: Dealer) => { try { await ElMessageBox.confirm(`确定删除“${dealer.name}”吗？删除后不可恢复`, '删除经销商', { type: 'warning' }); dealers.splice(dealers.indexOf(dealer), 1); ElMessage.success('经销商已删除') } catch {} }
const toggleStatus = async (dealer: Dealer) => { try { await ElMessageBox.confirm(`确定${dealer.enabled ? '启用' : '禁用'}经销商“${dealer.name}”吗？`, '状态确认', { type: 'warning' }); ElMessage.success(`经销商已${dealer.enabled ? '启用' : '禁用'}`) } catch { dealer.enabled = !dealer.enabled } }
const exportDealers = () => { const data = [['经销商名称', '税号', '邮箱', '联系人', '联系电话', '地区/详细地址', '状态', '创建时间'], ...filteredDealers.value.map((item) => [item.name, item.taxNo, item.email, item.contact, item.phone, `${item.region}${item.address}`, item.enabled ? '启用' : '禁用', item.createdAt])]; const url = URL.createObjectURL(new Blob([`\ufeff${data.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = '经销商列表.csv'; link.click(); URL.revokeObjectURL(url) }
</script>

<style lang="scss" scoped>
.filter-form { margin-bottom: -18px; }.filter-form :deep(.el-input), .filter-form :deep(.el-cascader) { width: 220px; }.filter-form :deep(.el-date-editor) { width: 280px; }.filter-form :deep(.status-select) { width: 150px; }.table-heading { display: flex; align-items: center; justify-content: space-between; }.dealer-table :deep(.el-table__cell) { padding: 13px 0; }.dealer-table :deep(.first-column .cell) { padding-left: 16px; }.dealer-table :deep(.last-column .cell) { padding-right: 16px; }.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }.rate-input { white-space: nowrap; }@media (max-width: 700px) { .filter-form :deep(.el-input), .filter-form :deep(.el-date-editor), .filter-form :deep(.el-select), .filter-form :deep(.el-cascader) { width: 100%; }.filter-form :deep(.el-form-item) { width: 100%; margin-right: 0; } }
</style>
