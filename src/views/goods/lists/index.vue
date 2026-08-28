<template>
    <div class="goods-list" :class="{ 'edit-page': editPage }">
        <template v-if="editPage">
            <el-page-header :content="editingId ? '编辑商品' : '添加商品'" @back="backToList" />
            <el-card class="!border-none mt-4 edit-card" shadow="never">
                <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
                    <el-row :gutter="20">
                        <el-col :span="12"><el-form-item label="商品分类" prop="category"><el-select v-model="form.category" class="!w-full" placeholder="请选择商品分类"><el-option v-for="item in categories" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
                        <el-col :span="12"><el-form-item label="商品名称" prop="name"><el-input v-model="form.name" placeholder="请输入商品名称" /></el-form-item></el-col>
                        <el-col :span="24"><el-form-item label="商品图片" prop="image"><div class="image-uploader"><div class="image-grid"><div v-for="(image, index) in form.images" :key="image" class="image-item"><el-image :src="image" fit="cover" /><el-button circle size="small" type="danger" class="remove-image" @click="removeImage(index)">×</el-button></div><label v-if="form.images.length < 9" class="upload-trigger"><input type="file" accept="image/*" multiple @change="handleImageUpload" /><span>+</span><small>上传图片</small></label></div><span class="upload-tip">支持本地上传多张图片，最多 9 张，每张固定 100×100px 展示</span></div></el-form-item></el-col>
                        <el-col :span="6"><el-form-item label="进货价" prop="purchasePrice"><el-input v-model="form.purchasePrice" placeholder="请输入进货价" /></el-form-item></el-col>
                        <el-col :span="6"><el-form-item label="扫码积分" prop="scanPoints"><el-input v-model="form.scanPoints" placeholder="请输入扫码积分" /></el-form-item></el-col>
                        <el-col :span="6"><el-form-item label="价值" prop="value"><el-input v-model="form.value" placeholder="请输入商品价值" /></el-form-item></el-col>
                        <el-col :span="6"><el-form-item label="排序"><el-input v-model="form.sort" placeholder="请输入排序" /></el-form-item></el-col>
                        <el-col :span="12"><el-form-item label="商品状态"><el-select v-model="form.status" class="!w-full"><el-option label="出售中" value="出售中" /><el-option label="仓库中" value="仓库中" /></el-select></el-form-item></el-col>
                    </el-row>
                    <el-form-item label="商品详情"><Editor v-model="form.detail" height="320px" /></el-form-item>
                    <div class="form-actions"><el-button @click="backToList">取消</el-button><el-button type="primary" @click="saveGoods">保存商品</el-button></div>
                </el-form>
            </el-card>
        </template>
        <template v-else>
        <el-card class="!border-none" shadow="never">
            <el-form :model="filters" inline class="filter-form">
                <el-form-item label="商品分类"><el-select v-model="filters.category" clearable placeholder="全部分类"><el-option v-for="item in categories" :key="item" :label="item" :value="item" /></el-select></el-form-item>
                <el-form-item label="商品搜索"><el-input v-model="filters.keyword" clearable placeholder="商品名称 / 关键词 / ID" @keyup.enter="resetPage" /></el-form-item>
                <el-form-item><el-button type="primary" @click="resetPage">查询</el-button><el-button @click="resetFilters">重置</el-button></el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <template #header><div class="table-heading"><el-tabs v-model="filters.status" class="status-tabs" @tab-change="resetPage"><el-tab-pane :label="`全部（${goods.length}）`" name="全部" /><el-tab-pane :label="`出售中（${statusCount('出售中')}）`" name="出售中" /><el-tab-pane :label="`仓库中（${statusCount('仓库中')}）`" name="仓库中" /><el-tab-pane :label="`回收站（${statusCount('回收站')}）`" name="回收站" /></el-tabs><div class="table-actions"><el-button type="primary" :icon="Plus" @click="openForm()">添加商品</el-button><el-button :icon="Download" @click="exportGoods">导出商品</el-button></div></div></template>
            <div class="toolbar"><span>共 {{ filteredGoods.length }} 件商品</span></div>
            <el-table :data="pagedGoods" size="large" stripe table-layout="fixed" class="goods-table">
                <el-table-column label="商品ID" prop="id" min-width="140" class-name="first-column" label-class-name="first-column" />
                <el-table-column label="商品图片" min-width="140"><template #default="{ row }"><el-image :src="row.image" :preview-src-list="[row.image]" fit="cover" class="product-image" preview-teleported /></template></el-table-column>
                <el-table-column label="商品名称" prop="name" min-width="140" show-overflow-tooltip /><el-table-column label="商品分类" prop="category" min-width="140" />
                <el-table-column label="采购积分" prop="purchasePoints" min-width="140" /><el-table-column label="扫码积分" prop="scanPoints" min-width="140" /><el-table-column label="排序" prop="sort" min-width="140" />
                <el-table-column label="状态" min-width="140"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
                <el-table-column label="操作" min-width="240" fixed="right" class-name="last-column" label-class-name="last-column"><template #default="{ row }"><el-button v-if="row.status !== '回收站'" type="primary" link @click="openForm(row)">编辑</el-button><el-button v-if="row.status !== '出售中' && row.status !== '回收站'" type="success" link @click="setStatus(row, '出售中')">上架</el-button><el-button v-if="row.status === '出售中'" type="warning" link @click="setStatus(row, '仓库中')">下架</el-button><el-button v-if="row.status !== '回收站'" type="danger" link @click="removeGoods(row)">删除</el-button><template v-else><el-button type="success" link @click="restoreGoods(row)">恢复</el-button><el-button type="danger" link @click="permanentDelete(row)">彻底删除</el-button></template></template></el-table-column>
            </el-table>
            <div class="flex justify-end mt-4"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next" :total="filteredGoods.length" @current-change="scrollToTop" /></div>
        </el-card>

        </template>
    </div>
</template>

<script lang="ts" setup name="goodsLists">
import { Download, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import Editor from '@/components/editor/index.vue'
import { useRoute, useRouter } from 'vue-router'

type GoodsStatus = '出售中' | '仓库中' | '回收站'
interface Goods { id: string; name: string; category: string; image: string; images: string[]; purchasePoints: string; purchasePrice: string; scanPoints: string; value: string; sort: string; status: GoodsStatus; detail: string }
const categories = ['饮料', '休闲食品', '日用百货', '礼品礼盒']
const images = ['photo-1544145945-f90425340c7e', 'photo-1554866585-cd94860890b7', 'photo-1505253716362-afaea1d3d1af', 'photo-1601050690597-df0568f70950']
const goods = reactive<Goods[]>(Array.from({ length: 24 }, (_, index) => { const image = `https://images.unsplash.com/${images[index % images.length]}?auto=format&fit=crop&w=160&q=80`; return { id: `SP${String(10001 + index)}`, name: ['青柠气泡水 500ml', '经典原味茶 450ml', '轻乳茶礼盒', '香脆薯片组合'][index % 4], category: categories[index % categories.length], image, images: [image], purchasePoints: String(80 + index * 10), purchasePrice: String((12.9 + index).toFixed(2)), scanPoints: String(20 + index * 5), value: String((12.9 + index).toFixed(2)), sort: String(100 - index), status: index === 6 || index === 16 ? '仓库中' : index === 21 ? '回收站' : '出售中', detail: '<p>精选商品，扫码可获得对应积分。</p>' } }))
const filters = reactive({ category: '', keyword: '', status: '全部' })
const route = useRoute(); const router = useRouter(); const editPage = computed(() => route.query.action === 'add' || route.query.action === 'edit'); const page = ref(1); const pageSize = 10; const editingId = ref(''); const formRef = ref<FormInstance>()
const emptyForm = (): Omit<Goods, 'id' | 'purchasePoints'> => ({ name: '', category: '', image: '', images: [], purchasePrice: '', scanPoints: '', value: '', sort: '0', status: '出售中', detail: '' })
const form = reactive(emptyForm())
const rules: FormRules = { name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }], category: [{ required: true, message: '请选择商品分类', trigger: 'change' }], image: [{ required: true, message: '请输入商品图片链接', trigger: 'blur' }] }
const filteredGoods = computed(() => goods.filter((item) => (!filters.category || item.category === filters.category) && (!filters.keyword.trim() || `${item.id}${item.name}`.includes(filters.keyword.trim())) && (filters.status === '全部' || item.status === filters.status)))
const pagedGoods = computed(() => filteredGoods.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const resetPage = () => { page.value = 1 }
const resetFilters = () => { filters.category = ''; filters.keyword = ''; filters.status = '全部'; resetPage() }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const statusType = (status: GoodsStatus): 'success' | 'warning' | 'info' => ({ 出售中: 'success', 仓库中: 'warning', 回收站: 'info' } as const)[status]
const statusCount = (status: GoodsStatus) => goods.filter((item) => item.status === status).length
const setStatus = (item: Goods, status: GoodsStatus) => { item.status = status; ElMessage.success(status === '出售中' ? '商品已上架' : status === '仓库中' ? '商品已下架至仓库' : '商品已移入回收站') }
const removeGoods = async (item: Goods) => { try { await ElMessageBox.confirm(`确定删除商品“${item.name}”吗？删除后商品将移入回收站。`, '删除商品', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }); item.status = '回收站'; ElMessage.success('商品已移入回收站') } catch {} }
const permanentDelete = async (item: Goods) => { try { await ElMessageBox.confirm(`确定彻底删除商品“${item.name}”吗？删除后不可恢复。`, '彻底删除', { type: 'error', confirmButtonText: '确认删除', cancelButtonText: '取消' }); goods.splice(goods.indexOf(item), 1); ElMessage.success('商品已彻底删除'); if (pagedGoods.value.length === 0 && page.value > 1) page.value-- } catch {} }
const restoreGoods = async (item: Goods) => { try { await ElMessageBox.confirm(`确定恢复商品“${item.name}”吗？恢复后将进入仓库（下架）状态。`, '恢复商品', { type: 'warning', confirmButtonText: '确认恢复', cancelButtonText: '取消' }); item.status = '仓库中'; ElMessage.success('商品已恢复至仓库') } catch {} }
const openForm = (item?: Goods) => { editingId.value = item?.id || ''; Object.assign(form, item ? { name: item.name, category: item.category, image: item.image, images: [...item.images], purchasePrice: item.purchasePrice, scanPoints: item.scanPoints, value: item.value, sort: item.sort, status: item.status === '回收站' ? '仓库中' : item.status, detail: item.detail } : emptyForm()); router.push({ query: { action: item ? 'edit' : 'add', ...(item ? { id: item.id } : {}) } }) }
const backToList = () => router.push({ path: route.path })
const handleImageUpload = (event: Event) => { const files = Array.from((event.target as HTMLInputElement).files || []).slice(0, 9 - form.images.length); files.forEach((file) => form.images.push(URL.createObjectURL(file))); form.image = form.images[0] || '' }
const removeImage = (index: number) => { const image = form.images.splice(index, 1)[0]; if (image?.startsWith('blob:')) URL.revokeObjectURL(image); form.image = form.images[0] || '' }
const saveGoods = async () => { if (!formRef.value || !(await formRef.value.validate().catch(() => false)) || !form.images.length) { if (!form.images.length) ElMessage.error('请至少上传一张商品图片'); return } if (editingId.value) { const item = goods.find((goodsItem) => goodsItem.id === editingId.value); if (item) Object.assign(item, form, { purchasePoints: form.scanPoints }) } else goods.unshift({ ...form, id: `SP${10001 + goods.length}`, purchasePoints: form.scanPoints }); ElMessage.success(editingId.value ? '商品已更新' : '商品已添加'); backToList() }
const exportGoods = () => { const rows = [['商品ID', '商品名称', '商品分类', '采购积分', '扫码积分', '排序', '状态'], ...filteredGoods.value.map((item) => [item.id, item.name, item.category, item.purchasePoints, item.scanPoints, item.sort, item.status])]; const url = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = '商品列表.csv'; link.click(); URL.revokeObjectURL(url) }
</script>

<style lang="scss" scoped>
.filter-form { margin-bottom: -18px; }.filter-form :deep(.el-input), .filter-form :deep(.el-select) { width: 220px; }.table-heading { display: flex; align-items: center; justify-content: space-between; }.table-actions { display: flex; flex-shrink: 0; gap: 8px; }.status-tabs { margin-bottom: -1px; }.status-tabs :deep(.el-tabs__header) { margin-bottom: 0; }.status-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }.status-tabs :deep(.el-tabs__item) { padding-top: 2px; padding-bottom: 2px; }.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }.toolbar span { color: var(--el-text-color-secondary); font-size: 13px; }.product-image { width: 54px; height: 54px; border-radius: 6px; }.goods-table :deep(.el-table__cell) { padding: 12px 0; }.goods-table :deep(.first-column .cell) { padding-left: 16px; }.goods-table :deep(.last-column .cell) { padding-right: 16px; }.image-grid { display: flex; flex-wrap: wrap; gap: 12px; }.image-item, .upload-trigger { position: relative; width: 100px; height: 100px; }.image-item { overflow: visible; }.image-item :deep(.el-image) { width: 100px; height: 100px; border-radius: 6px; }.upload-trigger { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 1px dashed var(--el-border-color); border-radius: 6px; color: var(--el-text-color-secondary); cursor: pointer; }.upload-trigger input { display: none; }.upload-trigger span { font-size: 28px; line-height: 28px; }.upload-trigger small { font-size: 12px; }.remove-image { position: absolute; top: -8px; right: -8px; z-index: 1; }.upload-tip { display: block; margin-top: 8px; color: var(--el-text-color-secondary); font-size: 12px; }.form-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }.edit-page { min-height: 100%; padding: 24px; background: #fff; }.edit-card { max-width: none; border: none !important; box-shadow: none !important; }@media (max-width: 640px) { .filter-form :deep(.el-input), .filter-form :deep(.el-select) { width: 100%; }.filter-form :deep(.el-form-item) { width: 100%; margin-right: 0; }.edit-card :deep(.el-col) { width: 100%; max-width: 100%; flex: 0 0 100%; }.edit-page { padding: 16px; } }
</style>
