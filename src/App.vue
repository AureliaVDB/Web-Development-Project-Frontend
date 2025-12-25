<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="text-xl font-bold">
            Swimming Pool Booking
          </router-link>
          
          <div class="flex gap-6">
            <router-link to="/" class="hover:text-blue-200">Home</router-link>
            <router-link to="/pools" class="hover:text-blue-200">Pools</router-link>
            <router-link to="/map" class="hover:text-blue-200">Map</router-link>

            <template v-if="authed">
              <router-link v-if="isAdmin" to="/admin" class="hover:text-blue-200">Admin</router-link>
              <router-link to="/profile" class="hover:text-blue-200">Profile</router-link>
              <button @click="logout" class="hover:text-blue-200">Logout</button>
            </template>
            <template v-else>
              <router-link to="/login" class="hover:text-blue-200">Login</router-link>
              <router-link to="/register" class="hover:text-blue-200">Register</router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 transform z-50 bg-green-600 text-white px-5 py-3 rounded shadow-lg text-center"
      role="status"
      aria-live="polite"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated, clearToken, clearUser, getUser } from '@/utils/auth'

const router = useRouter()
const authed = ref(isAuthenticated())
const currentUser = ref(getUser())
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'admin'
})

// Toast state
const showToast = ref(false)
const toastMessage = ref('')

function triggerToast(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function logout() {
  clearToken()
  clearUser()
  authed.value = isAuthenticated()
  currentUser.value = getUser()
  triggerToast('Logged out successfully')
  router.push({ name: 'login' })
}

function refreshAuth() {
  authed.value = isAuthenticated()
  currentUser.value = getUser()
}

onMounted(() => {
  refreshAuth()
})

router.afterEach(() => {
  refreshAuth()
})
</script>
