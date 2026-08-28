<template>
    <div class="mall-page">
        <el-card shadow="never" class="!border-none"
            ><el-form inline :model="filters"
                ><el-form-item label="订单搜索"
                    ><el-input
                        v-model="filters.keyword"
                        clearable
                        placeholder="订单号 / 用户昵称 / 手机号" /></el-form-item
                ><el-form-item label="创建时间"
                    ><el-date-picker
                        v-model="filters.dateRange"
                        type="daterange"
                        value-format="YYYY-MM-DD"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期" /></el-form-item
                ><el-form-item
                    ><el-button type="primary" @click="page = 1">查询</el-button
                    ><el-button @click="reset">重置</el-button
                    ><el-button @click="exportData">导出</el-button></el-form-item
                ></el-form
            ></el-card
        ><el-card shadow="never" class="!border-none mt-4"
            ><template #header
                ><div class="heading">
                    <el-tabs v-model="filters.status" class="status-tabs" @tab-change="page = 1"
                        ><el-tab-pane v-for="s in tabs" :key="s" :label="s" :name="s" /></el-tabs
                    ><el-button type="primary" @click="batchShip">批量发货</el-button>
                </div></template
            ><el-table :data="paged" stripe table-layout="fixed"
                ><el-table-column prop="id" label="订单编号" min-width="160" /><el-table-column
                    label="用户昵称/手机号码"
                    min-width="180"
                    ><template #default="{ row }"
                        >{{ row.user }}<br /><span class="muted">{{ row.phone }}</span></template
                    ></el-table-column
                ><el-table-column label="商品信息" min-width="230"
                    ><template #default="{ row }"
                        ><div class="product-cell">
                            <el-image :src="row.image" class="product-image" fit="cover" />
                            <div>
                                {{ row.product }}<br /><span class="muted"
                                    >兑换 {{ row.quantity }} 件</span
                                >
                            </div>
                        </div></template
                    ></el-table-column
                ><el-table-column prop="points" label="兑换积分" min-width="110" /><el-table-column
                    prop="status"
                    label="订单状态"
                    min-width="110"
                /><el-table-column
                    prop="createdAt"
                    label="下单时间"
                    min-width="170"
                /><el-table-column label="操作" width="190" fixed="right"
                    ><template #default="{ row }"
                        ><el-button link type="primary" @click="detail(row)">订单详情</el-button
                        ><el-button
                            v-if="row.status === '待收货' || row.status === '已完成'"
                            link
                            @click="delivery(row)"
                            >配送信息</el-button
                        ><el-button
                            v-if="row.status === '待发货'"
                            link
                            type="success"
                            @click="ship(row)"
                            >发货</el-button
                        ></template
                    ></el-table-column
                ></el-table
            >
            <div class="pagination">
                <el-pagination
                    v-model:current-page="page"
                    background
                    layout="total,prev,pager,next"
                    :total="filtered.length"
                /></div></el-card
        ><el-dialog v-model="batchVisible" title="批量发货" width="560px"
            ><el-upload
                drag
                :auto-upload="false"
                :limit="1"
                accept=".xls,.xlsx"
                @change="onFileChange"
                ><el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">将批量发货文件拖到此处，或点击上传</div></el-upload
            >
            <div class="template-link" @click="downloadTemplate">下载Excel模板</div>
            <template #footer
                ><el-button @click="batchVisible = false">取消</el-button
                ><el-button type="primary" @click="confirmBatch">确认</el-button></template
            ></el-dialog
        ><el-dialog v-model="shipVisible" title="订单发货" width="520px"><el-form :model="shipForm" label-width="90px"><el-form-item label="快递公司" required><el-select v-model="shipForm.company" placeholder="请选择快递公司"><el-option label="顺丰速运" value="顺丰速运"/><el-option label="中通快递" value="中通快递"/><el-option label="圆通速递" value="圆通速递"/></el-select></el-form-item><el-form-item label="快递单号" required><el-input v-model="shipForm.trackingNo" placeholder="请输入快递单号"/></el-form-item></el-form><template #footer><el-button @click="shipVisible=false">取消</el-button><el-button type="primary" @click="confirmShip">确认</el-button></template></el-dialog><el-dialog v-model="deliveryVisible" title="配送信息" width="460px"
            ><el-descriptions v-if="selected" :column="1" border
                ><el-descriptions-item label="快递公司">{{
                    selected.company || '-'
                }}</el-descriptions-item
                ><el-descriptions-item label="快递单号">{{
                    selected.trackingNo || '-'
                }}</el-descriptions-item></el-descriptions
            ></el-dialog
        ><el-dialog v-model="detailVisible" title="订单详情" width="820px"
            ><template v-if="selected"
                ><section>
                    <h3>订单信息</h3>
                    <el-descriptions :column="3" border
                        ><el-descriptions-item label="订单编号">{{
                            selected.id
                        }}</el-descriptions-item
                        ><el-descriptions-item label="用户昵称/手机号码"
                            >{{ selected.user }} {{ selected.phone }}</el-descriptions-item
                        ><el-descriptions-item label="订单状态">{{
                            selected.status
                        }}</el-descriptions-item
                        ><el-descriptions-item label="下单时间">{{
                            selected.createdAt
                        }}</el-descriptions-item
                        ><el-descriptions-item label="支付时间">{{
                            selected.paidAt
                        }}</el-descriptions-item
                        ><el-descriptions-item label="完成时间">{{
                            selected.completedAt
                        }}</el-descriptions-item></el-descriptions
                    >
                </section>
                <section>
                    <h3>商品信息</h3>
                    <el-table :data="[selected]" size="small" border
                        ><el-table-column label="商品图片" width="80"
                            ><template #default="{ row }"
                                ><el-image
                                    :src="row.image"
                                    class="detail-image" /></template></el-table-column
                        ><el-table-column prop="product" label="商品名称" /><el-table-column
                            prop="quantity"
                            label="兑换数量" /><el-table-column
                            prop="points"
                            label="商品总积分" /><el-table-column
                            prop="total"
                            label="合计总额" /><el-table-column prop="payTotal" label="支付总额"
                    /></el-table>
                </section>
                <section>
                    <h3>订单记录</h3>
                    <el-table :data="selected.logs" size="small" border
                        ><el-table-column prop="id" label="订单ID" /><el-table-column
                            prop="action"
                            label="操作记录" /><el-table-column prop="time" label="操作时间"
                    /></el-table>
                </section>
                <section>
                    <h3>订单发货</h3>
                    <el-descriptions :column="2" border
                        ><el-descriptions-item label="收货人名称">{{
                            selected.receiver
                        }}</el-descriptions-item
                        ><el-descriptions-item label="电话">{{
                            selected.receiverPhone
                        }}</el-descriptions-item
                        ><el-descriptions-item label="地址" :span="2">{{
                            selected.address
                        }}</el-descriptions-item
                        ><el-descriptions-item label="物流公司">{{
                            selected.company || '-'
                        }}</el-descriptions-item
                        ><el-descriptions-item label="快递单号">{{
                            selected.trackingNo || '-'
                        }}</el-descriptions-item></el-descriptions
                    ><el-button
                        v-if="selected.status === '待发货'"
                        type="primary"
                        class="section-action"
                        @click="ship(selected)"
                        >发货</el-button
                    >
                </section>
                <section>
                    <h3>订单备注</h3>
                    <div class="note">{{ selected.note || '暂无备注' }}</div>
                    <el-button class="section-action" @click="editNote">编辑备注</el-button>
                </section></template
            ></el-dialog
        >
    </div>
</template>
<script setup lang="ts" name="pointsMallOrders">
import { UploadFilled } from '@element-plus/icons-vue'
const tabs = ['全部', '待付款', '待发货', '待收货', '已完成', '已取消']
const filters = reactive({ keyword: '', status: '全部', dateRange: [] as string[] })
const page = ref(1)
const detailVisible = ref(false)
const deliveryVisible = ref(false)
const shipVisible = ref(false)
const shipForm = reactive({ company: '顺丰速运', trackingNo: '' })
const batchVisible = ref(false)
const selected = ref<any>()
const uploadFile = ref<any>()
const users = ['小鹿用户', '青柠茶友', '山野拾光', '快乐汽水']
const products = ['茶饮礼盒', '坚果大礼包', '保温杯', '零食组合']
const orders = reactive<any[]>(
    Array.from({ length: 32 }, (_, i) => {
        const status =
            i % 7 === 0 ? '待发货' : i % 5 === 0 ? '已完成' : i % 6 === 0 ? '已取消' : '待收货'
        return {
            id: `JFDD202608${String(3201 + i)}`,
            user: users[i % 4],
            phone: `138****${1020 + i}`,
            product: products[i % 4],
            quantity: 1 + (i % 3),
            points: 100 + i * 20,
            total: 100 + i * 20,
            payTotal: 0,
            status,
            createdAt: `2026-08-${String(28 - (i % 20)).padStart(2, '0')} 10:20:00`,
            paidAt: '2026-08-28 10:22:00',
            completedAt: status === '已完成' ? '2026-08-28 16:20:00' : '-',
            receiver: users[i % 4],
            receiverPhone: '13800001234',
            address: '上海市浦东新区示例路88号',
            company: status === '待收货' || status === '已完成' ? '顺丰速运' : '',
            trackingNo: status === '待收货' || status === '已完成' ? `SF202608${1000 + i}` : '',
            note: '请尽快配送',
            image: `https://images.unsplash.com/${['photo-1544145945-f90425340c7e', 'photo-1505253716362-afaea1d3d1af'][i % 2]}?auto=format&fit=crop&w=100&q=80`,
            logs: [
                {
                    id: `LOG${i + 1}`,
                    action: '用户提交积分订单',
                    time: `2026-08-${String(28 - (i % 20)).padStart(2, '0')} 10:20:00`
                }
            ]
        }
    })
)
const filtered = computed(() =>
    orders.filter(
        (r) =>
            (filters.status === '全部' || r.status === filters.status) &&
            (!filters.keyword ||
                `${r.id}${r.user}${r.phone}${r.product}`.includes(filters.keyword.trim()))
    )
)
const paged = computed(() => filtered.value.slice((page.value - 1) * 10, page.value * 10))
const reset = () => {
    Object.assign(filters, { keyword: '', status: '全部', dateRange: [] })
    page.value = 1
}
const detail = (r: any) => {
    selected.value = r
    detailVisible.value = true
}
const delivery = (r: any) => {
    selected.value = r
    deliveryVisible.value = true
}
const ship = async (r: any) => {
    selected.value = r
    shipForm.company = r.company || '顺丰速运'
    shipForm.trackingNo = r.trackingNo || ''
    shipVisible.value = true
}
const confirmShip = () => { if (!selected.value || !shipForm.trackingNo.trim()) return ElMessage.warning('请输入快递单号'); selected.value.status = '待收货'; selected.value.company = shipForm.company; selected.value.trackingNo = shipForm.trackingNo.trim(); shipVisible.value = false; ElMessage.success('订单已发货') }
const batchShip = () => {
    uploadFile.value = null
    batchVisible.value = true
}
const onFileChange = (file: any) => {
    uploadFile.value = file
}
const confirmBatch = () => {
    if (!uploadFile.value) return ElMessage.warning('请上传批量发货文件')
    orders
        .filter((r) => r.status === '待发货')
        .forEach((r) => {
            r.status = '待收货'
            r.company = '顺丰速运'
            r.trackingNo = `SF${Date.now()}`
        })
    batchVisible.value = false
    ElMessage.success('批量发货成功')
}
const downloadTemplate = () => {
    const url = URL.createObjectURL(
        new Blob(['订单编号,快递公司,快递单号\n'], { type: 'application/vnd.ms-excel' })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = '批量发货模板.xlsx'
    a.click()
    URL.revokeObjectURL(url)
}
const editNote = () => ElMessage.info('备注编辑功能已打开')
const exportData = () => {
    const data = [
        [
            '订单编号',
            '用户昵称',
            '手机号',
            '商品名称',
            '兑换数量',
            '兑换积分',
            '订单状态',
            '下单时间'
        ],
        ...filtered.value.map((r) => [
            r.id,
            r.user,
            r.phone,
            r.product,
            r.quantity,
            r.points,
            r.status,
            r.createdAt
        ])
    ]
    const url = URL.createObjectURL(
        new Blob([`\ufeff${data.map((r) => r.join(',')).join('\n')}`], {
            type: 'text/csv;charset=utf-8'
        })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = '积分订单.csv'
    a.click()
    URL.revokeObjectURL(url)
}
</script>
<style scoped>
.mall-page :deep(.el-input) {
    width: 240px;
}
.mall-page :deep(.el-date-editor) {
    width: 280px;
}
.heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.status-tabs :deep(.el-tabs__header) {
    margin: 0;
}
.status-tabs :deep(.el-tabs__nav-wrap::after) {
    display: none;
}
.pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
.product-cell {
    display: flex;
    gap: 10px;
    align-items: center;
}
.product-image {
    width: 48px;
    height: 48px;
    border-radius: 5px;
}
.detail-image {
    width: 46px;
    height: 46px;
}
.muted {
    color: var(--el-text-color-secondary);
    font-size: 12px;
}
.mall-page section {
    margin-bottom: 24px;
}
.mall-page h3 {
    margin: 0 0 12px;
    font-size: 15px;
}
.section-action {
    margin-top: 12px;
}
.note {
    padding: 12px;
    background: var(--el-fill-color-extra-light);
}
.template-link {
    margin-top: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
}
@media (max-width: 700px) {
    .mall-page :deep(.el-input),
    .mall-page :deep(.el-date-editor) {
        width: 100%;
    }
}
</style>
