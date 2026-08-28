<template>
    <div>
        <el-card shadow="never"
            ><el-form inline class="freight-filter"
                ><el-form-item label="模板名称"
                    ><el-input v-model="keyword" clearable placeholder="请输入模板名称" /></el-form-item
                ><el-form-item><el-button type="primary">查询</el-button><el-button type="primary" @click="openForm()">添加模板</el-button></el-form-item></el-form
            ></el-card
        ><el-card shadow="never" class="mt-4"
            ><el-table :data="filtered" stripe
                ><el-table-column prop="name" label="模板名称" /><el-table-column
                    prop="method"
                    label="计费方式"
                /><el-table-column prop="area" label="配置区域" /><el-table-column
                    prop="fee"
                    label="运费"
                /><el-table-column prop="freeArea" label="指定区域包邮" /><el-table-column
                    prop="blockedArea"
                    label="指定区域不送达"
                /><el-table-column prop="sort" label="排序" /><el-table-column
                    label="操作"
                    width="150"
                    ><template #default="{ row }"
                        ><el-button link type="primary" @click="openForm(row)">编辑</el-button
                        ><el-button link type="danger" @click="remove(row)"
                            >删除</el-button
                        ></template
                    ></el-table-column
                ></el-table
            ></el-card
        ><el-dialog
            v-model="visible"
            :title="editing ? '编辑运费模板' : '添加运费模板'"
            width="560px"
            ><el-form :model="form" label-width="120px"
                ><el-form-item label="模板名称"><el-input v-model="form.name" /></el-form-item
                ><el-form-item label="计费方式"
                    ><el-select v-model="form.method"
                        ><el-option label="按件计费" value="按件计费" /><el-option
                            label="按重量计费"
                            value="按重量计费" /></el-select></el-form-item
                ><el-form-item label="配置区域"
                    ><el-button class="region-picker" @click="openRegion('area')">{{ formatAreas(form.area) }}</el-button></el-form-item
                ><el-form-item label="运费"><el-input v-model="form.fee" /></el-form-item
                ><el-form-item label="指定区域包邮"
                    ><el-button class="region-picker" @click="openRegion('freeArea')">{{ formatAreas(form.freeArea) }}</el-button></el-form-item
                ><el-form-item label="指定区域不送达"
                    ><el-button class="region-picker" @click="openRegion('blockedArea')">{{ formatAreas(form.blockedArea) }}</el-button></el-form-item
                ><el-form-item label="排序"><el-input v-model="form.sort" /></el-form-item></el-form
            ><template #footer
                ><el-button @click="visible = false">取消</el-button
                ><el-button type="primary" @click="save">确认</el-button></template
            ></el-dialog><el-dialog v-model="regionVisible" title="选择行政区域" width="620px"><el-tree ref="regionTree" :data="regionOptions" node-key="value" show-checkbox default-expand-all/><template #footer><el-button @click="regionVisible=false">取消</el-button><el-button type="primary" @click="confirmRegion">确认</el-button></template></el-dialog
        >
    </div>
</template>
<script setup lang="ts" name="websiteFreight">
const keyword = ref('')
const visible = ref(false)
const regionVisible = ref(false)
const regionTarget = ref<'area' | 'freeArea' | 'blockedArea'>('area')
const regionTree = ref<any>()
const regionOptions = [{ value: '北京市', label: '北京市', children: [{ value: '朝阳区', label: '朝阳区' }, { value: '海淀区', label: '海淀区' }] }, { value: '上海市', label: '上海市', children: [{ value: '浦东新区', label: '浦东新区' }, { value: '徐汇区', label: '徐汇区' }] }, { value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市', children: [{ value: '天河区', label: '天河区' }, { value: '越秀区', label: '越秀区' }] }, { value: '深圳市', label: '深圳市', children: [{ value: '南山区', label: '南山区' }] }] }, { value: '四川省', label: '四川省', children: [{ value: '成都市', label: '成都市', children: [{ value: '武侯区', label: '武侯区' }] }] }]
const editing = ref('')
const form = reactive<any>({
    name: '',
    method: '按件计费',
    area: ['全国'],
    fee: '0',
    freeArea: [],
    blockedArea: [],
    sort: 0
})
const templates = reactive<any[]>([
    {
        id: 'FT1',
        name: '测试模板',
        method: '按件计费',
        area: ['全国'],
        fee: '0',
        freeArea: [],
        blockedArea: [],
        sort: 1
    }
])
const filtered = computed(() =>
    templates.filter((r) => !keyword.value || r.name.includes(keyword.value.trim()))
)
const openForm = (r?: any) => {
    editing.value = r?.id || ''
    Object.assign(
        form,
        r ? { ...r, area: [...(r.area || [])], freeArea: [...(r.freeArea || [])], blockedArea: [...(r.blockedArea || [])] } : {
            name: '',
            method: '按件计费',
            area: ['全国'],
            fee: '0',
            freeArea: [],
            blockedArea: [],
            sort: 0
        }
    )
    visible.value = true
}
const formatAreas = (areas: string[] | string) => Array.isArray(areas) ? (areas.length ? areas.join('、') : '请选择区域') : areas
const openRegion = (target: 'area' | 'freeArea' | 'blockedArea') => { regionTarget.value = target; regionVisible.value = true; nextTick(() => regionTree.value?.setCheckedKeys(form[target] || [])) }
const confirmRegion = () => { form[regionTarget.value] = regionTree.value?.getCheckedKeys() || []; regionVisible.value = false }
const save = () => {
    if (!form.name) return ElMessage.warning('请输入模板名称')
    if (editing.value) {
        const r = templates.find((x) => x.id === editing.value)
        if (r) Object.assign(r, form)
    } else templates.unshift({ ...form, id: `FT${Date.now()}` })
    visible.value = false
    ElMessage.success('运费模板已保存')
}
const remove = async (r: any) => {
    try {
        await ElMessageBox.confirm(`确认删除模板“${r.name}”吗？`, '删除确认', { type: 'warning' })
        templates.splice(templates.indexOf(r), 1)
        ElMessage.success('模板已删除')
    } catch {}
}
</script>
<style scoped>
.freight-filter { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 18px; }
.freight-filter :deep(.el-form-item) { margin: 0; }
.freight-filter :deep(.el-input) { width: 240px; }
.mt-4 {
    margin-top: 16px;
}
.filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.region-picker {
    width: 100%;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
}
@media (max-width: 760px) { .freight-filter :deep(.el-form-item) { width: 100%; } .freight-filter :deep(.el-input) { width: 100%; } }
</style>
