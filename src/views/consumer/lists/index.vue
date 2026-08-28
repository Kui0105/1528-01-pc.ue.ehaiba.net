<template>
    <div class="consumer-list">
        <el-card class="!border-none" shadow="never">
            <el-form :model="filters" inline class="filter-form">
                <el-form-item label="用户查询"><el-input v-model="filters.keyword" clearable placeholder="手机号 / 用户ID" @keyup.enter="resetPage" /></el-form-item>
                <el-form-item label="注册时间"><el-date-picker v-model="filters.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></el-form-item>
                <el-form-item><el-button type="primary" @click="resetPage">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button :icon="Download" @click="exportUsers">导出用户</el-button></el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <template #header><div class="table-heading"><div><span class="card-title">用户列表</span><span class="table-count">共 {{ filteredUsers.length }} 位用户</span></div></div></template>
            <el-table :data="pagedUsers" size="large" stripe table-layout="fixed" class="user-table">
                <el-table-column label="用户ID" prop="id" min-width="136" class-name="first-column" label-class-name="first-column" />
                <el-table-column label="用户头像" min-width="136"><template #default="{ row }"><el-avatar :size="38" :src="row.avatar">{{ row.nickname.slice(0, 1) }}</el-avatar></template></el-table-column>
                <el-table-column label="用户昵称" prop="nickname" min-width="136" /><el-table-column label="手机号码" prop="mobile" min-width="136" />
                <el-table-column label="积分余额" min-width="136"><template #default="{ row }">{{ formatNumber(row.points) }}</template></el-table-column>
                <el-table-column label="用户身份" min-width="136"><template #default="{ row }"><el-tag :type="identityTagType(row.identity)" effect="light">{{ row.identity }}</el-tag></template></el-table-column>
                <el-table-column label="用户状态" min-width="136"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'" effect="light">{{ row.status }}</el-tag></template></el-table-column>
                <el-table-column label="注册时间" prop="registeredAt" min-width="136" />
                <el-table-column label="操作" min-width="136" fixed="right" class-name="last-column" label-class-name="last-column"><template #default="{ row }"><el-button type="primary" link @click="openDetail(row)">查看详情</el-button><el-button :type="row.status === '启用' ? 'danger' : 'success'" link @click="toggleStatus(row)">{{ row.status === '启用' ? '禁用' : '启用' }}</el-button></template></el-table-column>
            </el-table>
            <div class="flex justify-end mt-4"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" background layout="total, prev, pager, next" :total="filteredUsers.length" @current-change="scrollToTop" /></div>
        </el-card>

        <el-drawer v-model="detailVisible" title="用户详情" size="760px" destroy-on-close>
            <template v-if="selectedUser">
                <el-tabs v-model="detailTab" class="detail-tabs">
                    <el-tab-pane label="基本信息" name="basic">
                        <div class="profile-summary"><el-avatar :size="64" :src="selectedUser.avatar">{{ selectedUser.nickname.slice(0, 1) }}</el-avatar><div><strong>{{ selectedUser.nickname }}</strong><span>用户ID：{{ selectedUser.id }}</span></div><el-tag :type="selectedUser.status === '启用' ? 'success' : 'info'">{{ selectedUser.status }}</el-tag></div>
                        <el-descriptions :column="2" border><el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item><el-descriptions-item label="用户昵称">{{ selectedUser.nickname }}</el-descriptions-item><el-descriptions-item label="手机号码">{{ selectedUser.mobile }}</el-descriptions-item><el-descriptions-item label="积分余额">{{ formatNumber(selectedUser.points) }}</el-descriptions-item><el-descriptions-item label="用户身份">{{ selectedUser.identity }}</el-descriptions-item><el-descriptions-item label="用户状态">{{ selectedUser.status }}</el-descriptions-item><el-descriptions-item label="注册时间" :span="2">{{ selectedUser.registeredAt }}</el-descriptions-item></el-descriptions>
                    </el-tab-pane>
                    <el-tab-pane label="积分订单" name="orders"><el-table :data="detailData.orders" size="small"><el-table-column prop="orderNo" label="订单编号" min-width="160" /><el-table-column prop="product" label="商品信息" min-width="170" /><el-table-column prop="quantity" label="兑换数量" width="90" /><el-table-column prop="points" label="兑换积分" width="90" /><el-table-column prop="status" label="订单状态" width="90" /><el-table-column prop="createdAt" label="下单时间" min-width="160" /></el-table></el-tab-pane>
                    <el-tab-pane label="扫码记录" name="scans"><el-table :data="detailData.scans" size="small"><el-table-column prop="product" label="产品名称" min-width="120" /><el-table-column prop="spec" label="规格" width="100" /><el-table-column prop="dealer" label="经销商" min-width="110" /><el-table-column prop="salesperson" label="业务员" width="90" /><el-table-column prop="store" label="门店" min-width="110" /><el-table-column prop="result" label="扫码结果" width="90" /><el-table-column prop="scannedAt" label="扫码时间" min-width="160" /></el-table></el-tab-pane>
                    <el-tab-pane label="积分明细" name="points"><el-table :data="detailData.pointChanges" size="small"><el-table-column prop="id" label="记录ID" width="100" /><el-table-column prop="reason" label="变动原因" min-width="150" /><el-table-column prop="count" label="变动数量" width="100" /><el-table-column prop="before" label="变动前余额" width="110" /><el-table-column prop="after" label="变动后余额" width="110" /><el-table-column prop="createdAt" label="变动时间" min-width="160" /></el-table><p class="detail-tip">积分原因：一物一码获得积分、兑换商品扣减积分、订单取消退回积分</p></el-tab-pane>
                </el-tabs>
            </template>
        </el-drawer>
    </div>
</template>

<script lang="ts" setup name="consumerLists">
import { Download } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

type UserIdentity = '经销商' | '业务员' | '销售员' | '用户'
interface MockUser { id: string; nickname: string; mobile: string; points: number; identity: UserIdentity; status: '启用' | '禁用'; registeredAt: string; avatar: string }
const names = ['林晓', '张晨', '王敏', '李伟', '陈静', '赵磊', '刘洋', '周婷', '吴峰', '孙悦', '何帆', '高阳']
const identities: UserIdentity[] = ['经销商', '业务员', '销售员', '用户']
const mockUsers = reactive<MockUser[]>(Array.from({ length: 24 }, (_, index) => ({
    id: `U202608${String(index + 1).padStart(4, '0')}`, nickname: names[index % names.length], mobile: `138${String(12340000 + index * 781).slice(-8)}`,
    points: 5600 - index * 137, identity: identities[index % identities.length], status: index === 8 || index === 17 ? '禁用' : '启用', registeredAt: `2026-08-${String(27 - index).padStart(2, '0')} ${String(9 + index % 10).padStart(2, '0')}:2${index % 6}:00`,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${names[index % names.length]}`
})))
const filters = reactive({ keyword: '', dateRange: [] as string[] })
const page = ref(1); const pageSize = ref(10); const detailVisible = ref(false); const detailTab = ref('basic'); const selectedUser = ref<MockUser>()
const filteredUsers = computed(() => mockUsers.filter((user) => {
    const keyword = filters.keyword.trim()
    return (!keyword || user.id.includes(keyword) || user.mobile.includes(keyword)) && (filters.dateRange.length !== 2 || (user.registeredAt.slice(0, 10) >= filters.dateRange[0] && user.registeredAt.slice(0, 10) <= filters.dateRange[1]))
}))
const pagedUsers = computed(() => filteredUsers.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const detailData = computed(() => {
    const user = selectedUser.value
    if (!user) return { orders: [], scans: [], pointChanges: [] }
    return { orders: [{ orderNo: `JF${user.id.slice(-6)}001`, product: '青柠气泡水 500ml', quantity: 2, points: 360, status: '已完成', createdAt: '2026-08-26 14:25:00' }, { orderNo: `JF${user.id.slice(-6)}002`, product: '轻乳茶礼盒', quantity: 1, points: 520, status: '待发货', createdAt: '2026-08-22 10:18:00' }], scans: [{ product: '青柠气泡水', spec: '500ml*12', dealer: '华东经销商', salesperson: '张晨', store: '安心便利店', result: '获得积分', scannedAt: '2026-08-26 14:20:00' }, { product: '经典原味茶', spec: '450ml*12', dealer: '华南经销商', salesperson: '李伟', store: '悦享超市', result: '获得积分', scannedAt: '2026-08-18 16:42:00' }], pointChanges: [{ id: 'PT20260826001', reason: '一物一码获得积分', count: '+80', before: user.points - 80, after: user.points, createdAt: '2026-08-26 14:20:00' }, { id: 'PT20260822001', reason: '兑换商品扣减积分', count: '-520', before: user.points + 520, after: user.points, createdAt: '2026-08-22 10:18:00' }] }
})
const resetPage = () => { page.value = 1 }
const resetFilters = () => { filters.keyword = ''; filters.dateRange = []; resetPage() }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const openDetail = (user: MockUser) => { selectedUser.value = user; detailTab.value = 'basic'; detailVisible.value = true }
const toggleStatus = async (user: MockUser) => { try { await ElMessageBox.confirm(`确定${user.status === '启用' ? '禁用' : '启用'}用户“${user.nickname}”吗？`, '状态确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }); user.status = user.status === '启用' ? '禁用' : '启用'; ElMessage.success(`已${user.status === '启用' ? '启用' : '禁用'}用户`) } catch {} }
const formatNumber = (value: number) => value.toLocaleString('zh-CN')
const identityTagType = (identity: UserIdentity): 'warning' | 'primary' | 'success' | 'info' => ({ 经销商: 'warning', 业务员: 'primary', 销售员: 'success', 用户: 'info' } as const)[identity]
const exportUsers = () => { const rows = [['用户ID', '用户昵称', '手机号码', '积分余额', '用户身份', '用户状态', '注册时间'], ...filteredUsers.value.map((item) => [item.id, item.nickname, item.mobile, item.points, item.identity, item.status, item.registeredAt])]; const url = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = '用户列表.csv'; link.click(); URL.revokeObjectURL(url) }
</script>

<style lang="scss" scoped>
.filter-form { margin-bottom: -18px; }.filter-form :deep(.el-input) { width: 220px; }.table-heading { display: flex; align-items: center; justify-content: space-between; }.table-count { margin-left: 10px; color: var(--el-text-color-secondary); font-size: 13px; }.user-table :deep(.el-table__cell) { padding: 13px 0; }.user-table :deep(.first-column .cell) { padding-left: 16px; }.user-table :deep(.last-column .cell) { padding-right: 16px; }.profile-summary { display: flex; gap: 14px; align-items: center; padding: 16px; margin-bottom: 18px; background: var(--el-fill-color-extra-light); border-radius: 8px; }.profile-summary div { display: flex; flex: 1; flex-direction: column; gap: 6px; }.profile-summary span { color: var(--el-text-color-secondary); font-size: 13px; }.detail-tip { margin: 16px 0 0; color: var(--el-text-color-secondary); font-size: 13px; }@media (max-width: 640px) { .filter-form :deep(.el-input), .filter-form :deep(.el-date-editor) { width: 100%; }.filter-form :deep(.el-form-item) { width: 100%; margin-right: 0; } }
</style>
