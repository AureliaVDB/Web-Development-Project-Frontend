<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h1 class="text-3xl font-bold mb-6">Register</h1>
      
      <p v-if="error" class="mb-4 px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">
        {{ error }}
      </p>
      <p v-if="success" class="mb-4 px-4 py-2 rounded bg-green-50 text-green-700 border border-green-200">
        {{ success }}
      </p>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Name</label>
          <input 
            type="text" 
            v-model="name"
            required
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            v-model="email"
            required
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
          <p v-if="email && !isEmailValid" class="mt-2 text-sm text-red-600">Please enter a valid email address.</p>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            v-model="password"
            required
            minlength="6"
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
          <p v-if="password && !isPasswordValid" class="mt-2 text-sm text-red-600">
            Password must be at least 6 characters and contain letters and numbers.
          </p>
          <p v-else class="mt-2 text-xs text-gray-500">
            Password requirements: at least 6 characters, include letters and numbers.
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Confirm Password</label>
          <input 
            type="password" 
            v-model="confirmPassword"
            required
            class="w-full border border-gray-300 rounded px-4 py-2"
          >
          <p v-if="confirmPassword && !passwordsMatch" class="mt-2 text-sm text-red-600">
            Passwords do not match.
          </p>
        </div>
        
        <button 
          type="submit"
          :disabled="loading || !formValid"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Register</span>
          <span v-else>Registering...</span>
        </button>
      </form>
      
      <p class="mt-4 text-center text-gray-600">
        Already have an account? 
        <router-link to="/login" class="text-blue-600 hover:underline">
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const isEmailValid = computed(() => {
  // Simple email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value)
})

const isPasswordValid = computed(() => {
  const hasMinLength = (password.value || '').length >= 6
  const hasLetter = /[A-Za-z]/.test(password.value || '')
  const hasNumber = /[0-9]/.test(password.value || '')
  return hasMinLength && hasLetter && hasNumber
})

const passwordsMatch = computed(() => {
  return (password.value || '') === (confirmPassword.value || '')
})

const formValid = computed(() => {
  return !!name.value && isEmailValid.value && isPasswordValid.value && passwordsMatch.value
})

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    // Client-side guard
    if (!formValid.value) {
      error.value = 'Please fix the validation errors before submitting.'
      return
    }
    await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value
    })
    success.value = 'Registration successful! Please verify your email.'
    setTimeout(() => router.push({ name: 'login' }), 1200)
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
