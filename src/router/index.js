import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '@/pages/Home.vue'
import PagePools from '@/pages/Pools.vue'
import PageLogin from '@/pages/Login.vue'
import PageRegister from '@/pages/Register.vue'
import PageDashboard from '@/pages/Dashboard.vue'
import PageProfile from '@/pages/Profile.vue'
import VerifyEmail from '@/pages/VerifyEmail.vue'
import ResetPassword from '@/pages/ResetPassword.vue'
import PageMap from '@/pages/Map.vue'
import BookPool from '@/pages/BookPool.vue'
import PageAdmin from '@/pages/Admin.vue'
import { isAuthenticated, getUser } from '@/utils/auth'

//routes
const routes = [
    { 
        path: '/', 
        name: 'home', 
        component: PageHome 
    },
    { 
        path: '/pools', 
        name: 'pools', 
        component: PagePools 
    },
    {
        path: '/pools/:id/book',
        name: 'book-pool',
        component: BookPool,
        meta: { requiresAuth: true }
    },
    { 
        path: '/map', 
        name: 'map', 
        component: PageMap 
    },
    { 
        path: '/login', 
        name: 'login', 
        component: PageLogin 
    },
    { 
        path: '/register', 
        name: 'register', 
        component: PageRegister 
    },
        { 
                path: '/dashboard', 
                name: 'dashboard', 
                component: PageDashboard,
                meta: { requiresAuth: true }
        },
        { 
                path: '/profile', 
                name: 'profile', 
                component: PageProfile,
                meta: { requiresAuth: true }
        },
        {
            path: '/verify-email',
            name: 'verify-email',
            component: VerifyEmail
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: ResetPassword
        },
        {
            path: '/admin',
            name: 'admin',
            component: PageAdmin,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
]

// Export because will use this in main.js
export const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple auth guard
router.beforeEach((to, from, next) => {
    if (to.meta?.requiresAuth && !isAuthenticated()) {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
    }
    
    // Check admin access
    if (to.meta?.requiresAdmin) {
        const user = getUser()
        if (!user || user.role !== 'admin') {
            next({ name: 'home' })
            return
        }
    }
    
    next()
})
