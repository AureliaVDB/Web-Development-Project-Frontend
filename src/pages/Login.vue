<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h1 class="text-3xl font-bold mb-6">Login</h1>
      
      <p v-if="error" class="mb-2 px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">
        {{ error }}
      </p>
      <div v-if="showResend" class="mb-4 px-4 py-2 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
        <p class="mb-2">Your email isn’t verified yet. Resend the verification email?</p>
        <button 
          class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 font-semibold"
          :disabled="resending"
          @click="resendVerification"
        >
          <span v-if="!resending">Resend Verification Email</span>
          <span v-else>Sending...</span>
        </button>
        <p v-if="resendMessage" class="mt-2 text-sm">{{ resendMessage }}</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            v-model="email"
            required
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            v-model="password"
            required
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
        </div>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Login</span>
          <span v-else>Signing in...</span>
        </button>
      </form>
      
      <p class="mt-4 text-center text-gray-600">
        Don't have an account? 
        <router-link to="/register" class="text-blue-600 hover:underline">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/utils/api'
import { setToken, setUser } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showResend = ref(false)
const resending = ref(false)
const resendMessage = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    setToken(data.token)
    if (data.user) setUser(data.user)
    const redirect = route.query.redirect || '/dashboard'
    router.replace(redirect)
  } catch (err) {
    const status = err.response?.status
    const msg = err.response?.data?.error || 'Login failed'
    error.value = msg
    // If email not verified (403), show resend option
    if (status === 403 && err.response?.data?.emailVerified === false) {
      showResend.value = true
    }
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  resendMessage.value = ''
  try {
    const { data } = await api.post('/auth/resend-verification', { email: email.value })
    resendMessage.value = data.message || 'Verification email sent'
  } catch (err) {
    resendMessage.value = err.response?.data?.error || 'Failed to resend verification email'
  } finally {
    resending.value = false
  }
}
</script>
