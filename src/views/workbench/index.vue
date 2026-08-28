<template>
    <div class="workbench">
        <div>
            <el-card class="!border-none mb-4 overview-card" shadow="never">
                <template #header>
                    <div class="overview-header">
                        <div class="overview-heading">
                            <span class="overview-title">数据概览</span>
                            <span class="overview-time">更新时间：{{ workbenchData.today.time }}</span>
                        </div>
                        <div class="data-filters">
                            <el-radio-group v-model="dataPeriod" size="small" @change="applyDataFilter">
                                <el-radio-button value="today">今日</el-radio-button>
                                <el-radio-button value="7days">近7天</el-radio-button>
                                <el-radio-button value="30days">近30天</el-radio-button>
                                <el-radio-button value="custom">自定义</el-radio-button>
                            </el-radio-group>
                            <el-date-picker v-if="dataPeriod === 'custom'" v-model="dataDateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="applyDataFilter" />
                            <el-button size="small" @click="resetDataFilter">重置</el-button>
                        </div>
                    </div>
                </template>

                <div class="metrics-grid">
                    <div v-for="metric in metricDefinitions" :key="metric.key" class="metric-item">
                        <div class="metric-topline">
                            <span class="metric-label">{{ metric.label }}</span>
                            <span class="metric-icon" :class="`metric-icon-${metric.key}`">
                                <component :is="metric.icon" />
                            </span>
                        </div>
                        <div class="metric-value">{{ formatNumber(workbenchData.today[metric.key]) }}</div>
                        <div class="metric-total">累计 {{ formatNumber(workbenchData.today[metric.totalKey]) }}</div>
                    </div>
                </div>
            </el-card>
        </div>
        <!--
        <div class="lg:flex gap-4">
            <el-card class="!border-none mb-4 lg:mb-0 w-full lg:w-2/3" shadow="never">
                <template #header>
                    <div class="chart-header">
                        <span>进货订单趋势图</span>
                        <el-radio-group v-model="purchasePeriod" size="small" @change="applyTrendFilter">
                            <el-radio-button value="day">按日</el-radio-button>
                            <el-radio-button value="week">按周</el-radio-button>
                            <el-radio-button value="month">按月</el-radio-button>
                        </el-radio-group>
                    </div>
                </template>
                <div>
                    <v-charts
                        ref="purchaseChart"
                        style="height: 350px"
                        :option="workbenchData.purchaseOption"
                        :autoresize="true"
                    />
                </div>
            </el-card>
            <el-card class="!border-none w-full lg:w-1/3" shadow="never">
                <template #header>
                    <div class="chart-header">
                        <span>产品订单趋势图</span>
                        <div class="chart-filters">
                            <el-select v-model="selectedProduct" size="small" @change="applyTrendFilter">
                                <el-option v-for="product in productOptions" :key="product" :label="product" :value="product" />
                            </el-select>
                            <el-radio-group v-model="productPeriod" size="small" @change="applyTrendFilter">
                                <el-radio-button value="day">日</el-radio-button>
                                <el-radio-button value="week">周</el-radio-button>
                                <el-radio-button value="month">月</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                </template>
                <div>
                    <v-charts
                        ref="productChart"
                        style="height: 350px"
                        :option="workbenchData.productOption"
                        :autoresize="true"
                    />
                </div>
            </el-card>
        </div>
        -->
        <el-card class="!border-none comparison-card" shadow="never">
            <template #header>
                <div class="comparison-header">
                    <div>
                        <div class="card-title">数据环比趋势图</div>
                        <div class="comparison-subtitle">对比所选时间段内的业务数据变化</div>
                    </div>
                    <div class="comparison-filters">
                        <el-radio-group v-model="comparisonMetric" size="small" @change="applyComparisonFilter">
                            <el-radio-button value="store">拓店环比</el-radio-button>
                            <el-radio-button value="activation">激活环比</el-radio-button>
                            <el-radio-button value="activity">动销环比</el-radio-button>
                        </el-radio-group>
                        <el-radio-group v-model="comparisonType" size="small" @change="resetComparisonRange">
                            <el-radio-button value="month">月份环比</el-radio-button>
                            <el-radio-button value="year">年份环比</el-radio-button>
                        </el-radio-group>
                        <el-select v-model="comparisonStart" size="small" @change="applyComparisonFilter">
                            <el-option v-for="item in comparisonOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                        <span class="comparison-separator">与</span>
                        <el-select v-model="comparisonEnd" size="small" @change="applyComparisonFilter">
                            <el-option v-for="item in comparisonOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </div>
                </div>
            </template>
            <v-charts ref="comparisonChart" style="height: 360px" :option="workbenchData.comparisonOption" :autoresize="true" />
        </el-card>
        <section class="sales-section">
            <div class="ranking-grid sales-ranking-grid">
                <el-card v-for="ranking in salesRankings" :key="ranking.key" class="!border-none ranking-card" shadow="never">
                    <template #header>
                        <div class="ranking-header">
                            <span class="card-title">{{ ranking.title }}TOP5</span>
                            <el-button link type="primary" @click="openLeaderboard(ranking.key)">查看总榜</el-button>
                        </div>
                    </template>
                    <div class="ranking-filters">
                        <el-radio-group v-model="ranking.period" size="small">
                            <el-radio-button value="month">月榜</el-radio-button>
                            <el-radio-button value="year">年榜</el-radio-button>
                            <el-radio-button value="custom">自定义</el-radio-button>
                        </el-radio-group>
                        <el-date-picker v-if="ranking.period === 'custom'" v-model="ranking.dateRange" class="date-range" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </div>
                    <div class="rank-column-head"><span>排名</span><span>姓名</span><span>动销量</span></div>
                    <div class="rank-list">
                        <div v-for="item in getLeaderboard(ranking).slice(0, 5)" :key="item.name" class="rank-item">
                            <span class="rank-number" :class="`rank-number-${item.rank}`">{{ item.rank }}</span>
                            <span class="rank-name">{{ item.name }}</span>
                            <span class="rank-value">{{ item.value }}{{ ranking.unit }}</span>
                        </div>
                    </div>
                </el-card>
            </div>
        </section>
        <div class="ranking-grid mt-4">
            <el-card
                v-for="ranking in rankings"
                :key="ranking.key"
                class="!border-none ranking-card"
                shadow="never"
            >
                <template #header>
                    <div class="ranking-header">
                        <span class="card-title">{{ ranking.title }}TOP5</span>
                        <el-button link type="primary" @click="openLeaderboard(ranking.key)">
                            查看总榜
                        </el-button>
                    </div>
                </template>
                <div class="ranking-filters">
                    <el-radio-group v-model="ranking.period" size="small">
                        <el-radio-button value="month">月榜</el-radio-button>
                        <el-radio-button value="year">年榜</el-radio-button>
                        <el-radio-button value="custom">自定义</el-radio-button>
                    </el-radio-group>
                    <el-date-picker
                        v-if="ranking.period === 'custom'"
                        v-model="ranking.dateRange"
                        class="date-range"
                        type="daterange"
                        value-format="YYYY-MM-DD"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    />
                </div>
                <div class="rank-list">
                    <div v-for="item in getLeaderboard(ranking).slice(0, 5)" :key="item.name" class="rank-item">
                        <span class="rank-number" :class="`rank-number-${item.rank}`">{{ item.rank }}</span>
                        <span class="rank-name">{{ item.name }}</span>
                        <span class="rank-value">{{ item.value }}{{ ranking.unit }}</span>
                    </div>
                </div>
            </el-card>
        </div>
        <el-dialog v-model="leaderboardVisible" :title="`${activeRanking?.title || ''}总榜`" width="680px">
            <div v-if="activeRanking" class="dialog-filter-summary">
                {{ getPeriodLabel(activeRanking) }} · 共 {{ getLeaderboard(activeRanking).length }} 条记录
            </div>
            <el-table v-if="activeRanking" :data="getLeaderboard(activeRanking)" max-height="420">
                <el-table-column prop="rank" label="排名" width="90" />
                <el-table-column prop="name" :label="activeRanking.key === 'productSales' ? '产品名称' : activeRanking.key.startsWith('sales') ? '姓名' : '经销商'" />
                <el-table-column :label="activeRanking.key.startsWith('sales') ? '动销量' : activeRanking.key === 'productSales' ? '销售量' : activeRanking.key === 'dealerOrders' ? '进货订单量' : '业绩'" align="right">
                    <template #default="{ row }">{{ row.value }}{{ activeRanking.unit }}</template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="workbench">
import vCharts from 'vue-echarts'
import { DataAnalysis, Goods, OfficeBuilding, Tickets, Box, Medal } from '@element-plus/icons-vue'

import useSettingStore from '@/stores/modules/setting'
import { useComponentRef } from '@/utils/getExposeType'
import { calcColor } from '@/utils/util'

const settingStore = useSettingStore()
const productChart = useComponentRef(vCharts)
const purchaseChart = useComponentRef(vCharts)
const comparisonChart = useComponentRef(vCharts)
type TrendPeriod = 'day' | 'week' | 'month'
type ComparisonType = 'month' | 'year'
type ComparisonMetric = 'store' | 'activation' | 'activity'
const purchasePeriod = ref<TrendPeriod>('day')
const productPeriod = ref<TrendPeriod>('day')
const productOptions = ['青柠气泡水', '经典原味茶', '轻乳茶']
const selectedProduct = ref(productOptions[0])
const comparisonType = ref<ComparisonType>('month')
const comparisonMetric = ref<ComparisonMetric>('store')
const comparisonStart = ref('2026-07')
const comparisonEnd = ref('2026-08')
const comparisonOptions = computed(() => comparisonType.value === 'month'
    ? ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08']
    : ['2022年', '2023年', '2024年', '2025年', '2026年'])

type Period = 'month' | 'year' | 'custom'
type RankingKey = 'store' | 'activity' | 'activation' | 'productSales' | 'dealerOrders' | 'salesActivity' | 'salesStore' | 'salesActivation'

interface Ranking {
    key: RankingKey
    title: string
    unit: string
    period: Period
    dateRange: string[]
}

interface RankingItem {
    rank: number
    name: string
    value: number
}

const mockWorkbench = {
    today: {
        time: '2026-08-27 10:30:00',
        sales: 12580, totalSales: 386240, distribution: 2186, totalDistribution: 68420,
        stores: 326, totalStores: 8642, orders: 86, totalOrders: 3684,
        batches: 42, totalBatches: 1286, codes: 1248, totalCodes: 286430
    },
    purchase: {
        date: ['08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27'],
        day: [86, 94, 102, 98, 116, 124, 132], week: [612, 728, 806, 914], month: [2_486, 2_918, 3_204, 3_684]
    },
    product: {
        date: ['08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27'],
        products: {
            '青柠气泡水': { day: [32, 38, 35, 44, 48, 52, 56], week: [236, 284, 316, 368], month: [1_126, 1_284, 1_468, 1_806] },
            '经典原味茶': { day: [26, 31, 29, 36, 42, 45, 49], week: [188, 224, 268, 304], month: [886, 1_026, 1_194, 1_426] },
            '轻乳茶': { day: [18, 24, 22, 28, 31, 36, 40], week: [146, 182, 214, 248], month: [624, 746, 862, 1_016] }
        }
    }
}

const rankingBaseData: Record<RankingKey, Array<{ name: string; value: number }>> = {
    store: [
        { name: '华东经销商', value: 186 },
        { name: '华南经销商', value: 172 },
        { name: '华北经销商', value: 159 },
        { name: '西南经销商', value: 146 },
        { name: '华中经销商', value: 128 },
        { name: '东北经销商', value: 116 },
        { name: '西北经销商', value: 98 },
        { name: '海外经销商', value: 86 }
    ],
    activity: [
        { name: '华南经销商', value: 2_486 },
        { name: '华东经销商', value: 2_318 },
        { name: '华中经销商', value: 1_976 },
        { name: '华北经销商', value: 1_865 },
        { name: '西南经销商', value: 1_658 },
        { name: '东北经销商', value: 1_426 },
        { name: '西北经销商', value: 1_248 },
        { name: '海外经销商', value: 986 }
    ],
    activation: [
        { name: '华东经销商', value: 438 },
        { name: '华南经销商', value: 412 },
        { name: '华北经销商', value: 386 },
        { name: '华中经销商', value: 352 },
        { name: '西南经销商', value: 318 },
        { name: '东北经销商', value: 276 },
        { name: '西北经销商', value: 234 },
        { name: '海外经销商', value: 198 }
    ],
    productSales: [
        { name: '青柠气泡水', value: 1_806 }, { name: '经典原味茶', value: 1_426 },
        { name: '轻乳茶', value: 1_016 }, { name: '鲜橙果汁', value: 884 }, { name: '乌龙茶', value: 768 },
        { name: '蜂蜜柚子茶', value: 642 }, { name: '山泉水', value: 586 }, { name: '能量饮料', value: 498 }
    ],
    dealerOrders: [
        { name: '华东经销商', value: 486 }, { name: '华南经销商', value: 452 },
        { name: '华北经销商', value: 426 }, { name: '华中经销商', value: 398 }, { name: '西南经销商', value: 366 },
        { name: '东北经销商', value: 324 }, { name: '西北经销商', value: 286 }, { name: '海外经销商', value: 248 }
    ],
    salesActivity: [
        { name: '张晨', value: 2_486 }, { name: '李伟', value: 2_318 }, { name: '王敏', value: 1_976 }, { name: '赵磊', value: 1_865 },
        { name: '陈静', value: 1_658 }, { name: '刘洋', value: 1_426 }, { name: '周婷', value: 1_248 }, { name: '吴峰', value: 986 }
    ],
    salesStore: [
        { name: '李伟', value: 286 }, { name: '张晨', value: 268 }, { name: '赵磊', value: 246 }, { name: '王敏', value: 224 },
        { name: '陈静', value: 208 }, { name: '刘洋', value: 186 }, { name: '周婷', value: 164 }, { name: '吴峰', value: 148 }
    ],
    salesActivation: [
        { name: '王敏', value: 638 }, { name: '张晨', value: 592 }, { name: '李伟', value: 548 }, { name: '陈静', value: 512 },
        { name: '赵磊', value: 486 }, { name: '周婷', value: 438 }, { name: '刘洋', value: 396 }, { name: '吴峰', value: 352 }
    ]
}

const rankings = reactive<Ranking[]>([
    { key: 'store', title: '经销商拓店排名', unit: '家', period: 'month', dateRange: [] },
    { key: 'activity', title: '经销商动销排名', unit: '次', period: 'month', dateRange: [] },
    { key: 'activation', title: '经销商激活排名', unit: '次', period: 'month', dateRange: [] }
    ,{ key: 'productSales', title: '产品销售排行', unit: '袋', period: 'month', dateRange: [] }
    ,{ key: 'dealerOrders', title: '经销商排行', unit: '单', period: 'month', dateRange: [] }
])
const salesRankings = reactive<Ranking[]>([
    { key: 'salesActivity', title: '销售动销数量排名', unit: '袋', period: 'month', dateRange: [] },
    { key: 'salesStore', title: '销售拓店数量排名', unit: '袋', period: 'month', dateRange: [] },
    { key: 'salesActivation', title: '销售激活数量排名', unit: '袋', period: 'month', dateRange: [] }
])
type DataPeriod = 'today' | '7days' | '30days' | 'custom'
const dataPeriod = ref<DataPeriod>('today')
const dataDateRange = ref<string[]>([])
const metricDefinitions = [
    { key: 'sales', totalKey: 'totalSales', label: '动销量', icon: DataAnalysis },
    { key: 'distribution', totalKey: 'totalDistribution', label: '铺货量', icon: Goods },
    { key: 'stores', totalKey: 'totalStores', label: '门店量', icon: OfficeBuilding },
    { key: 'orders', totalKey: 'totalOrders', label: '订单量', icon: Tickets },
    { key: 'batches', totalKey: 'totalBatches', label: '批次量', icon: Box },
    { key: 'codes', totalKey: 'totalCodes', label: '奖码量', icon: Medal }
]
const leaderboardVisible = ref(false)
const activeRankingKey = ref<RankingKey>('store')
const activeRanking = computed(() => [...salesRankings, ...rankings].find((item) => item.key === activeRankingKey.value))

watch(
    () => settingStore.theme,
    () => {
        updateColor()
    }
)

// 表单数据
const workbenchData: any = reactive({
    today: {}, // 今日数据
    purchase: [], // 进货订单

    purchaseOption: {
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            type: 'value'
        },
        legend: {
            data: ['进货订单量']
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [
            {
                name: '进货订单量',
                data: [],
                type: 'line',
                smooth: true,
                color: settingStore.theme,
                lineStyle: {
                    color: settingStore.theme,
                    width: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: settingStore.theme
                            },
                            {
                                offset: 1,
                                color: settingStore.theme
                            }
                        ]
                    },
                    opacity: 0.1
                }
            }
        ]
    },

    productOption: {
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            type: 'value',
            name: '单位（万）'
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [
            {
                name: '产品订单量',
                data: [],
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: { width: 3, color: calcColor(settingStore.theme, 0.7) },
                areaStyle: { opacity: 0.08 },
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: calcColor(settingStore.theme, 0.7)
                            },
                            {
                                offset: 1,
                                color: settingStore.theme
                            }
                        ]
                    }
                }
            }
        ]
    },

    comparisonOption: {
        color: ['#4a5dff', '#f28b30'],
        grid: { top: 62, right: 32, bottom: 36, left: 52 },
        tooltip: { trigger: 'axis' },
        legend: { top: 12, data: [] },
        xAxis: { type: 'category', boundaryGap: false, data: [] },
        yAxis: { type: 'value' },
        series: [
            { name: '', type: 'line', smooth: true, data: [], symbol: 'circle', symbolSize: 7, lineStyle: { width: 3 }, areaStyle: { opacity: 0.06 } },
            { name: '', type: 'line', smooth: true, data: [], symbol: 'circle', symbolSize: 7, lineStyle: { width: 3 }, areaStyle: { opacity: 0.06 } }
        ]
    }
})

const getData = () => {
    workbenchData.today = mockWorkbench.today
    applyTrendFilter()
    applyComparisonFilter()
}

const applyTrendFilter = () => {
    const periodLabels: Record<TrendPeriod, string[]> = {
        day: ['08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27'],
        week: ['第1周', '第2周', '第3周', '第4周'],
        month: ['05月', '06月', '07月', '08月']
    }
    workbenchData.purchaseOption.xAxis.data = periodLabels[purchasePeriod.value]
    workbenchData.purchaseOption.series[0].data = mockWorkbench.purchase[purchasePeriod.value]
    workbenchData.productOption.xAxis.data = periodLabels[productPeriod.value]
    workbenchData.productOption.series[0].data = mockWorkbench.product.products[selectedProduct.value][productPeriod.value]
}

const applyComparisonFilter = () => {
    const metricBase: Record<ComparisonMetric, number> = { store: 48, activation: 116, activity: 420 }
    const monthLabels = ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
    const yearLabels = ['1月', '3月', '5月', '7月', '9月', '11月']
    const labels = comparisonType.value === 'month' ? monthLabels : yearLabels
    const startIndex = comparisonOptions.value.indexOf(comparisonStart.value) + 1
    const endIndex = comparisonOptions.value.indexOf(comparisonEnd.value) + 1
    const base = metricBase[comparisonMetric.value]
    const createSeries = (periodIndex: number, uplift: number) => labels.map((_, index) => Math.round(base * (1 + index * 0.08 + periodIndex * 0.018 + uplift)))
    const startData = createSeries(Math.max(startIndex, 1), 0)
    const endData = createSeries(Math.max(endIndex, 1), 0.08)
    workbenchData.comparisonOption.xAxis.data = labels
    workbenchData.comparisonOption.legend.data = [comparisonStart.value, comparisonEnd.value]
    workbenchData.comparisonOption.series[0].name = comparisonStart.value
    workbenchData.comparisonOption.series[0].data = startData
    workbenchData.comparisonOption.series[1].name = comparisonEnd.value
    workbenchData.comparisonOption.series[1].data = endData
}

const resetComparisonRange = () => {
    const options = comparisonOptions.value
    comparisonStart.value = options[options.length - 2]
    comparisonEnd.value = options[options.length - 1]
    applyComparisonFilter()
}

const formatNumber = (value: number) => value?.toLocaleString('zh-CN') || '0'
const applyDataFilter = () => {
    const days = dataPeriod.value === 'today' ? 1 : dataPeriod.value === '7days' ? 7 : dataPeriod.value === '30days' ? 30 : Math.max(1, dataDateRange.value.length === 2 ? 7 : 1)
    const base = mockWorkbench.today
    const next: Record<string, any> = { time: base.time }
    metricDefinitions.forEach((metric) => {
        next[metric.key] = Math.round(base[metric.key] * days)
        next[metric.totalKey] = base[metric.totalKey]
    })
    workbenchData.today = next
}
const resetDataFilter = () => {
    dataPeriod.value = 'today'
    dataDateRange.value = []
    applyDataFilter()
}

const getLeaderboard = (ranking: Ranking): RankingItem[] => {
    const multiplier = ranking.period === 'year' ? 8.6 : ranking.period === 'custom' ? 0.72 : 1
    const dayCount = ranking.dateRange.length === 2 ? 1 : 0

    return rankingBaseData[ranking.key]
        .map((item) => ({ name: item.name, value: Math.round(item.value * (multiplier + dayCount * 0.08)) }))
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({ ...item, rank: index + 1 }))
}

const getPeriodLabel = (ranking: Ranking) => {
    if (ranking.period === 'month') return '本月'
    if (ranking.period === 'year') return '本年'
    return ranking.dateRange.length === 2 ? ranking.dateRange.join(' 至 ') : '自定义时间段'
}

const openLeaderboard = (key: RankingKey) => {
    activeRankingKey.value = key
    leaderboardVisible.value = true
}

const updateColor = () => {
    workbenchData.purchaseOption.series[0].color = settingStore.theme
    workbenchData.purchaseOption.series[0].lineStyle.color = settingStore.theme
    workbenchData.purchaseOption.series[0].areaStyle.color.colorStops = [
        {
            offset: 0,
            color: settingStore.theme
        },
        {
            offset: 1,
            color: settingStore.theme
        }
    ]
    workbenchData.productOption.series[0].itemStyle.color.colorStops = [
        {
            offset: 0,
            color: calcColor(settingStore.theme, 0.7)
        },
        {
            offset: 1,
            color: settingStore.theme
        }
    ]

    productChart.value?.clear()
    purchaseChart.value?.clear()
    productChart.value?.setOption(workbenchData.productOption)
    purchaseChart.value?.setOption(workbenchData.purchaseOption)
    comparisonChart.value?.clear()
    comparisonChart.value?.setOption(workbenchData.comparisonOption)
}

onMounted(() => {
    getData()
})
</script>

<style lang="scss" scoped>
.ranking-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}

.chart-header,
.chart-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.chart-filters { justify-content: flex-end; }
.chart-filters :deep(.el-select) { width: 128px; }

.comparison-card {
    margin-bottom: 20px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgb(30 54 81 / 4%);
}

.comparison-card :deep(.el-card__header) { padding: 18px 20px; background: var(--el-fill-color-extra-light); }

.comparison-header,
.comparison-filters,
.rank-column-head {
    display: flex;
    align-items: center;
}

.comparison-header { justify-content: space-between; gap: 16px; }
.comparison-filters { flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.comparison-filters :deep(.el-select) { width: 104px; }
.comparison-subtitle { margin-top: 5px; color: var(--el-text-color-secondary); font-size: 12px; }
.comparison-separator { color: var(--el-text-color-secondary); font-size: 13px; }

.sales-section { margin-top: 4px; }
.sales-ranking-grid { margin-bottom: 16px; }
.rank-column-head {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    gap: 10px;
    padding-bottom: 7px;
    color: var(--el-text-color-secondary);
    border-bottom: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
}
.rank-column-head span:last-child { text-align: right; }

.overview-card {
    overflow: hidden;
    background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-fill-color-extra-light) 100%);
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 8px 24px rgb(30 54 81 / 5%);
    :deep(.el-card__header) {
        padding: 18px 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
        padding: 20px;
    }
}

.overview-header {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    justify-content: space-between;
}

.overview-heading {
    display: flex;
    gap: 12px;
    align-items: baseline;
}

.overview-title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
}

.overview-time,
.metric-total {
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

.data-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 0;
}

.metric-item {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    min-height: 148px;
    padding: 18px 20px;
    overflow: hidden;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.metric-item::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 3px;
    content: '';
    background: var(--metric-accent, var(--el-color-primary));
}

.metric-item::after {
    position: absolute;
    right: -34px;
    bottom: -44px;
    width: 116px;
    height: 116px;
    content: '';
    background: var(--metric-tint, rgb(74 93 255 / 8%));
    border-radius: 50%;
}

.metric-item:nth-child(1) { --metric-accent: #4a5dff; --metric-tint: rgb(74 93 255 / 9%); }
.metric-item:nth-child(2) { --metric-accent: #f28b30; --metric-tint: rgb(242 139 48 / 10%); }
.metric-item:nth-child(3) { --metric-accent: #18a884; --metric-tint: rgb(24 168 132 / 10%); }
.metric-item:nth-child(4) { --metric-accent: #7569d8; --metric-tint: rgb(117 105 216 / 10%); }
.metric-item:nth-child(5) { --metric-accent: #d45d78; --metric-tint: rgb(212 93 120 / 10%); }
.metric-item:nth-child(6) { --metric-accent: #c08c22; --metric-tint: rgb(192 140 34 / 10%); }

.metric-item:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 8px 20px rgb(30 54 81 / 8%);
    transform: translateY(-2px);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
}

.metric-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}

.metric-label {
    color: var(--el-text-color-regular);
    font-size: 14px;
    font-weight: 500;
}

.metric-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 10px;
}

.metric-icon-distribution { color: #c07025; background: #fff4e9; }
.metric-icon-stores { color: #257d6b; background: #eaf8f4; }
.metric-icon-orders { color: #6260b9; background: #f0efff; }
.metric-icon-batches { color: #b1586b; background: #fff0f3; }
.metric-icon-codes { color: #9b7122; background: #fff8df; }

.metric-value {
    position: relative;
    z-index: 1;
    margin-top: 18px;
    color: var(--el-text-color-primary);
    font-family: Arial, sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
}

.metric-total {
    position: relative;
    z-index: 1;
    margin-top: 12px;
}

.ranking-card {
    min-width: 0;
}

.ranking-header,
.rank-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ranking-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
}

.date-range {
    width: 100%;
}

.rank-list {
    min-height: 194px;
}

.rank-item {
    gap: 10px;
    height: 38px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.rank-number {
    display: inline-flex;
    flex: 0 0 22px;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.rank-number-1 { color: #fff; background: #e2574c; }
.rank-number-2 { color: #fff; background: #e88c49; }
.rank-number-3 { color: #fff; background: #d5a843; }
.rank-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-value { color: var(--el-color-primary); font-weight: 600; }
.dialog-filter-summary { margin-bottom: 12px; color: var(--el-text-color-secondary); font-size: 13px; }

@media (max-width: 1100px) {
    .ranking-grid { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
    .overview-header { align-items: flex-start; }
    .overview-heading { flex-direction: column; gap: 4px; }
    .data-filters { width: 100%; }
    .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .metric-item { min-height: 126px; padding: 14px; }
    .metric-value { font-size: 24px; }
    .comparison-header { align-items: flex-start; flex-direction: column; }
    .comparison-filters { justify-content: flex-start; }
}
</style>
