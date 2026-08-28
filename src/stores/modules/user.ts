import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

import { getUserInfo, login, logout } from '@/api/user'
import { TOKEN_KEY } from '@/enums/cacheEnums'
import { PageEnum } from '@/enums/pageEnum'
import router, { filterAsyncRoutes } from '@/router'
import { clearAuthInfo, getToken } from '@/utils/auth'
import cache from '@/utils/cache'

const mockGoodsMenu = {
    paths: 'goods',
    name: '商品管理',
    icon: 'local-icon-goods',
    type: 'M',
    is_show: 1,
    is_cache: 0,
    children: [
        { paths: 'lists', name: '商品列表', icon: 'local-icon-goods', type: 'C', component: 'goods/lists/index', is_show: 1, is_cache: 0 },
        { paths: 'category', name: '商品分类', icon: 'local-icon-list-2', type: 'C', component: 'goods/category/index', is_show: 1, is_cache: 0 }
    ]
}

const mockOrderMenu = {
    paths: 'orders',
    name: '订单管理',
    icon: 'local-icon-dingdan',
    type: 'M',
    is_show: 1,
    is_cache: 0,
    children: [
        { paths: 'lists', name: '订单列表', icon: 'local-icon-list-2', type: 'C', component: 'orders/lists/index', is_show: 1, is_cache: 0 }
    ]
}

const mockBatchMenu = {
    paths: 'batches',
    name: '批次管理',
    icon: 'local-icon-list-2',
    type: 'M',
    is_show: 1,
    is_cache: 0,
    children: [
        { paths: 'total', name: '总批次', icon: 'local-icon-list-2', type: 'C', component: 'batches/total/index', is_show: 1, is_cache: 0 },
        { paths: 'reward', name: '奖码批次', icon: 'local-icon-gift', type: 'C', component: 'batches/reward/index', is_show: 1, is_cache: 0 },
        { paths: 'prizes', name: '奖项列表', icon: 'local-icon-gift', type: 'C', component: 'batches/prizes/index', is_show: 1, is_cache: 0 }
    ]
}

const mockDealerMenu = {
    paths: 'dealers',
    name: '经销商管理',
    icon: 'local-icon-gongyingshang',
    type: 'M',
    is_show: 1,
    is_cache: 0,
    children: [
        { paths: 'lists', name: '经销商列表', icon: 'local-icon-list-2', type: 'C', component: 'dealers/lists/index', is_show: 1, is_cache: 0 }
    ]
}

const mockDetailMenu = {
    paths: 'details', name: '明细管理', icon: 'local-icon-list-2', type: 'M', is_show: 1, is_cache: 0,
    children: [
        { paths: 'prizes', name: '中奖明细', icon: 'local-icon-gift', type: 'C', component: 'details/prizes/index', is_show: 1, is_cache: 0 },
        { paths: 'points', name: '积分明细', icon: 'local-icon-caiwu_jifen', type: 'C', component: 'details/points/index', is_show: 1, is_cache: 0 }
    ]
}
const mockPointsMallMenu = { paths: 'points-mall', name: '积分商城', icon: 'local-icon-gift', type: 'M', is_show: 1, is_cache: 0, children: [
    { paths: 'goods', name: '积分商品', icon: 'local-icon-goods', type: 'C', component: 'points-mall/goods/index', is_show: 1, is_cache: 0 },
    { paths: 'category', name: '商品分类', icon: 'local-icon-list-2', type: 'C', component: 'points-mall/category/index', is_show: 1, is_cache: 0 },
    { paths: 'orders', name: '积分订单', icon: 'local-icon-dingdan', type: 'C', component: 'points-mall/orders/index', is_show: 1, is_cache: 0 }
] }
const mockWebsiteChildren = [
    { paths: 'rules', name: '规则说明', type: 'C', component: 'setting/website/rules', is_show: 1, is_cache: 0 },
    { paths: 'banner', name: 'Banner设置', type: 'C', component: 'setting/website/banner', is_show: 1, is_cache: 0 },
    { paths: 'order', name: '订单设置', type: 'C', component: 'setting/website/order', is_show: 1, is_cache: 0 },
    { paths: 'freight', name: '运费模板', type: 'C', component: 'setting/website/freight', is_show: 1, is_cache: 0 }
]

const addMockBusinessMenus = (menus: any[]) => {
    const insertedMenus = [...menus]
    if (!insertedMenus.some((item) => item.paths === 'goods')) {
        const consumerIndex = insertedMenus.findIndex((item) => item.paths === 'consumer')
        insertedMenus.splice(consumerIndex >= 0 ? consumerIndex + 1 : insertedMenus.length, 0, mockGoodsMenu)
    }
    if (!insertedMenus.some((item) => item.paths === 'orders')) {
        const goodsIndex = insertedMenus.findIndex((item) => item.paths === 'goods')
        insertedMenus.splice(goodsIndex >= 0 ? goodsIndex + 1 : insertedMenus.length, 0, mockOrderMenu)
    }
    if (!insertedMenus.some((item) => item.paths === 'batches')) {
        const orderIndex = insertedMenus.findIndex((item) => item.paths === 'orders')
        insertedMenus.splice(orderIndex >= 0 ? orderIndex + 1 : insertedMenus.length, 0, mockBatchMenu)
    }
    if (!insertedMenus.some((item) => item.paths === 'dealers')) {
        const batchIndex = insertedMenus.findIndex((item) => item.paths === 'batches')
        insertedMenus.splice(batchIndex >= 0 ? batchIndex + 1 : insertedMenus.length, 0, mockDealerMenu)
    }
    if (!insertedMenus.some((item) => item.paths === 'details')) {
        const dealerIndex = insertedMenus.findIndex((item) => item.paths === 'dealers')
        insertedMenus.splice(dealerIndex >= 0 ? dealerIndex + 1 : insertedMenus.length, 0, mockDetailMenu)
    }
    if (!insertedMenus.some((item) => item.paths === 'points-mall')) {
        const detailIndex = insertedMenus.findIndex((item) => item.paths === 'details')
        insertedMenus.splice(detailIndex >= 0 ? detailIndex + 1 : insertedMenus.length, 0, mockPointsMallMenu)
    }
    const findWebsite = (items: any[]): any => { for (const item of items) { if (item.paths === 'website' || item.name === '网站设置' || item.paths === 'web') return item; if (item.children) { const found = findWebsite(item.children); if (found) return found } } return undefined }
    const website = findWebsite(insertedMenus)
    if (website) website.children = [...(website.children || []), ...mockWebsiteChildren.filter((child) => !(website.children || []).some((item: any) => item.paths === child.paths))]
    return insertedMenus
}

export interface UserState {
    token: string
    userInfo: Record<string, any>
    routes: RouteRecordRaw[]
    perms: string[]
}

const useUserStore = defineStore({
    id: 'user',
    state: (): UserState => ({
        token: getToken() || '',
        // 用户信息
        userInfo: {},
        // 路由
        routes: [],
        // 权限
        perms: []
    }),
    getters: {},
    actions: {
        resetState() {
            this.token = ''
            this.userInfo = {}
            this.perms = []
        },
        login(playload: any) {
            const { account, password } = playload
            return new Promise((resolve, reject) => {
                login({
                    account: account.trim(),
                    password: password
                })
                    .then((data) => {
                        this.token = data.token
                        cache.set(TOKEN_KEY, data.token)
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        logout() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(async (data) => {
                        this.token = ''
                        await router.push(PageEnum.LOGIN)
                        clearAuthInfo()
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        getUserInfo() {
            return new Promise((resolve, reject) => {
                getUserInfo()
                    .then((data) => {
                        this.userInfo = data.user
                        this.perms = data.permissions
                        this.routes = filterAsyncRoutes(addMockBusinessMenus(data.menu || []))
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
    }
})

export default useUserStore
