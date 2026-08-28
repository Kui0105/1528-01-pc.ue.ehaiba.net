<template>
    <div class="order-list">
        <el-card class="!border-none" shadow="never">
            <el-form :model="filters" inline class="filter-form">
                <el-form-item label="创建时间"><el-date-picker v-model="filters.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" /></el-form-item>
                <el-form-item label="筛选搜索"><el-input v-model="filters.keyword" clearable placeholder="订单号 / 经销商 / 商品名称" @keyup.enter="resetPage" /></el-form-item>
                <el-form-item><el-button type="primary" @click="resetPage">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button :icon="Download" @click="exportOrders">订单导出</el-button></el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <template #header><div class="table-heading"><el-tabs v-model="filters.status" class="status-tabs" @tab-change="resetPage"><el-tab-pane v-for="status in statusTabs" :key="status" :label="`${status}（${statusCount(status)}）`" :name="status" /></el-tabs><span class="table-count">共 {{ filteredOrders.length }} 笔订单</span></div></template>
            <el-table :data="pagedOrders" size="large" stripe table-layout="fixed" class="orders-table">
                <el-table-column label="订单编号" prop="id" min-width="152" class-name="first-column" label-class-name="first-column" />
                <el-table-column label="商品信息" min-width="250"><template #default="{ row }"><div class="product-cell"><el-image :src="row.image" :preview-src-list="[row.image]" fit="cover" class="product-image" preview-teleported /><div><p>{{ row.product }}</p><span>{{ row.category }} · {{ row.unitPrice }} 元/件 · 采购 {{ row.quantity }} 件</span></div></div></template></el-table-column>
                <el-table-column label="经销商" prop="dealer" min-width="146" /><el-table-column label="订单状态" min-width="128"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
                <el-table-column label="提交时间" prop="createdAt" min-width="170" />
                <el-table-column label="操作" min-width="236" fixed="right" class-name="last-column" label-class-name="last-column"><template #default="{ row }"><el-button v-if="row.status === '待入库'" type="success" link @click="approveOrder(row)">审核通过</el-button><el-button v-if="row.status === '待入库'" type="danger" link @click="rejectOrder(row)">审核驳回</el-button><el-button type="primary" link @click="openDetail(row)">订单详情</el-button><el-button link @click="openNote(row)">订单备注</el-button></template></el-table-column>
            </el-table>
            <div class="flex justify-end mt-4"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next" :total="filteredOrders.length" @current-change="scrollToTop" /></div>
        </el-card>

        <el-drawer v-model="detailVisible" title="订单详情" size="760px" destroy-on-close>
            <template v-if="selectedOrder"><section class="detail-section"><h3>订单信息</h3><el-descriptions :column="2" border><el-descriptions-item label="订单编号">{{ selectedOrder.id }}</el-descriptions-item><el-descriptions-item label="订单状态"><el-tag :type="statusType(selectedOrder.status)">{{ selectedOrder.status }}</el-tag></el-descriptions-item><el-descriptions-item label="提交时间">{{ selectedOrder.createdAt }}</el-descriptions-item><el-descriptions-item label="审核时间">{{ selectedOrder.auditedAt || '-' }}</el-descriptions-item><el-descriptions-item label="经销商">{{ selectedOrder.dealer }}</el-descriptions-item><el-descriptions-item label="备注">{{ selectedOrder.note || '-' }}</el-descriptions-item></el-descriptions></section>
                <section class="detail-section"><h3>商品信息</h3><el-table :data="[selectedOrder]" size="small" border><el-table-column label="商品图片" width="92"><template #default="{ row }"><el-image :src="row.image" fit="cover" class="detail-product-image" /></template></el-table-column><el-table-column label="商品名称" prop="product" min-width="130" /><el-table-column label="商品分类" prop="category" min-width="100" /><el-table-column label="单价" min-width="84"><template #default="{ row }">{{ row.unitPrice }} 元</template></el-table-column><el-table-column label="采购数量" min-width="90"><template #default="{ row }">{{ row.quantity }} 件</template></el-table-column><el-table-column label="商品总价" min-width="96"><template #default="{ row }">{{ row.totalPrice }} 元</template></el-table-column><el-table-column label="合计总额" min-width="96"><template #default="{ row }">{{ row.totalPrice }} 元</template></el-table-column></el-table></section>
                <section class="detail-section"><h3>订单备注</h3><p class="note-content">{{ selectedOrder.note || '暂无备注' }}</p></section>
                <section class="detail-section"><h3>订单操作记录</h3><el-table :data="selectedOrder.logs" size="small" border><el-table-column label="订单日志ID" prop="id" min-width="150" /><el-table-column label="操作记录" prop="action" min-width="180" /><el-table-column label="操作时间" prop="time" min-width="170" /></el-table></section>
            </template>
        </el-drawer>

        <el-dialog v-model="noteVisible" title="订单备注" width="480px" destroy-on-close><el-input v-model="noteText" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入订单备注信息" /><template #footer><el-button @click="noteVisible = false">取消</el-button><el-button type="primary" @click="saveNote">保存</el-button></template></el-dialog>
    </div>
</template>

<script lang="ts" setup name="ordersLists">
import { Download } from '@element-plus/icons-vue'

type OrderStatus = '待入库' | '已入库' | '已驳回'
type OrderTab = '全部' | OrderStatus
interface OrderLog { id: string; action: string; time: string }
interface MockOrder { id: string; dealer: string; product: string; category: string; image: string; unitPrice: number; quantity: number; totalPrice: number; status: OrderStatus; createdAt: string; auditedAt: string; note: string; logs: OrderLog[] }
const statusTabs: OrderTab[] = ['全部', '待入库', '已入库', '已驳回']
const dealers = ['华东经销商', '华南经销商', '华北经销商', '西南经销商', '华中经销商', '西北经销商']
const products = [{ name: '青柠气泡水 500ml', category: '饮料', price: 28, image: 'photo-1544145945-f90425340c7e' }, { name: '经典原味茶 450ml', category: '饮料', price: 32, image: 'photo-1554866585-cd94860890b7' }, { name: '轻乳茶礼盒', category: '礼品礼盒', price: 128, image: 'photo-1505253716362-afaea1d3d1af' }, { name: '香脆薯片组合', category: '休闲食品', price: 48, image: 'photo-1601050690597-df0568f70950' }]
const orders = reactive<MockOrder[]>(Array.from({ length: 32 }, (_, index) => {
    const product = products[index % products.length]; const quantity = 20 + (index % 6) * 10; const status: OrderStatus = index % 6 === 0 ? '已驳回' : index % 3 === 0 ? '已入库' : '待入库'; const createdAt = `2026-08-${String(28 - (index % 24)).padStart(2, '0')} ${String(9 + index % 10).padStart(2, '0')}:${String(10 + index).padStart(2, '0')}:00`; const auditedAt = status === '待入库' ? '' : `2026-08-${String(28 - (index % 24)).padStart(2, '0')} 16:${String(10 + index).padStart(2, '0')}:00`
    return { id: `JH202608${String(3201 + index)}`, dealer: dealers[index % dealers.length], product: product.name, category: product.category, image: `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=160&q=80`, unitPrice: product.price, quantity, totalPrice: product.price * quantity, status, createdAt, auditedAt, note: index % 5 === 0 ? '请优先安排入库并通知经销商。' : '', logs: [{ id: `LOG${String(10001 + index)}`, action: '经销商提交进货订单', time: createdAt }, ...(status === '待入库' ? [] : [{ id: `LOG${String(20001 + index)}`, action: status === '已入库' ? '审核通过，已入库' : '审核驳回', time: auditedAt }]) ] }
}))
const filters = reactive({ keyword: '', status: '全部' as OrderTab, dateRange: [] as string[] })
const page = ref(1); const pageSize = 10; const detailVisible = ref(false); const noteVisible = ref(false); const selectedOrder = ref<MockOrder>(); const noteOrder = ref<MockOrder>(); const noteText = ref('')
const filteredOrders = computed(() => orders.filter((item) => { const keyword = filters.keyword.trim(); return (!keyword || `${item.id}${item.dealer}${item.product}`.includes(keyword)) && (filters.status === '全部' || item.status === filters.status) && (filters.dateRange.length !== 2 || (item.createdAt.slice(0, 10) >= filters.dateRange[0] && item.createdAt.slice(0, 10) <= filters.dateRange[1])) }))
const pagedOrders = computed(() => filteredOrders.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const statusCount = (status: OrderTab) => status === '全部' ? orders.length : orders.filter((item) => item.status === status).length
const resetPage = () => { page.value = 1 }
const resetFilters = () => { filters.keyword = ''; filters.dateRange = []; filters.status = '全部'; resetPage() }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const statusType = (status: OrderStatus): 'warning' | 'success' | 'danger' => ({ 待入库: 'warning', 已入库: 'success', 已驳回: 'danger' } as const)[status]
const timestamp = () => '2026-08-28 17:30:00'
const openDetail = (order: MockOrder) => { selectedOrder.value = order; detailVisible.value = true }
const approveOrder = async (order: MockOrder) => { try { await ElMessageBox.confirm(`确认审核通过订单 ${order.id}？审核通过后将完成经销商入库。`, '审核通过', { type: 'warning', confirmButtonText: '确认通过', cancelButtonText: '取消' }); order.status = '已入库'; order.auditedAt = timestamp(); order.logs.push({ id: `LOG${Date.now()}`, action: '审核通过，已入库', time: order.auditedAt }); ElMessage.success('操作审核通过，经销商入库成功') } catch {} }
const rejectOrder = async (order: MockOrder) => { try { await ElMessageBox.confirm(`确认驳回订单 ${order.id}？`, '审核驳回', { type: 'warning', confirmButtonText: '确认驳回', cancelButtonText: '取消' }); order.status = '已驳回'; order.auditedAt = timestamp(); order.logs.push({ id: `LOG${Date.now()}`, action: '审核驳回', time: order.auditedAt }); ElMessage.success('订单已驳回') } catch {} }
const openNote = (order: MockOrder) => { noteOrder.value = order; noteText.value = order.note; noteVisible.value = true }
const saveNote = () => { if (!noteOrder.value) return; noteOrder.value.note = noteText.value.trim(); noteOrder.value.logs.push({ id: `LOG${Date.now()}`, action: `更新订单备注：${noteOrder.value.note || '清空备注'}`, time: timestamp() }); if (selectedOrder.value?.id === noteOrder.value.id) selectedOrder.value = noteOrder.value; noteVisible.value = false; ElMessage.success('订单备注已保存') }
const exportOrders = () => { const rows = [['订单编号', '商品名称', '商品分类', '采购数量', '经销商', '订单状态', '提交时间'], ...filteredOrders.value.map((item) => [item.id, item.product, item.category, item.quantity, item.dealer, item.status, item.createdAt])]; const url = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = '订单列表.csv'; link.click(); URL.revokeObjectURL(url) }
</script>

<style lang="scss" scoped>
.filter-form { margin-bottom: -18px; }.filter-form :deep(.el-input) { width: 240px; }.table-heading { display: flex; align-items: center; }.table-count { margin-left: 10px; color: var(--el-text-color-secondary); font-size: 13px; }.status-tabs { margin-bottom: 2px; }.status-tabs :deep(.el-tabs__header) { margin-bottom: 8px; }.orders-table :deep(.el-table__cell) { padding: 13px 0; }.orders-table :deep(.first-column .cell) { padding-left: 16px; }.orders-table :deep(.last-column .cell) { padding-right: 16px; }.product-cell { display: flex; gap: 10px; align-items: center; min-width: 0; }.product-cell p { overflow: hidden; margin: 0 0 5px; color: var(--el-text-color-primary); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }.product-cell span { color: var(--el-text-color-secondary); font-size: 12px; }.product-image { width: 48px; height: 48px; flex: 0 0 auto; border-radius: 5px; }.detail-section { margin-bottom: 26px; }.detail-section h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }.detail-product-image { width: 46px; height: 46px; border-radius: 4px; }.note-content { min-height: 48px; padding: 12px; margin: 0; color: var(--el-text-color-regular); line-height: 24px; background: var(--el-fill-color-extra-light); border-radius: 4px; }@media (max-width: 640px) { .filter-form :deep(.el-input), .filter-form :deep(.el-date-editor) { width: 100%; }.filter-form :deep(.el-form-item) { width: 100%; margin-right: 0; } }
 .status-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
 .status-tabs :deep(.el-tabs__header) { margin: 0; }
 .status-tabs :deep(.el-tabs__item) { padding-top: 2px; padding-bottom: 2px; }
</style>
