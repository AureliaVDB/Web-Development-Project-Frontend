<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
      <h1 class="text-3xl font-bold mb-4">Verify Email</h1>

      <div v-if="loading" class="text-gray-600 py-4">Verifying your email...</div>

      <div v-else>
        <p v-if="success" class="mb-4 px-4 py-2 rounded bg-green-50 text-green-700 border border-green-200">
          {{ success }}
        </p>
        <p v-if="error" class="mb-4 px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">
          {{ error }}
        </p>

        <router-link
          v-if="success"
          :to="{ name: 'login' }"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </router-link>

        <router-link
          v-else
          :to="{ name: 'home' }"
          class="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
        >
          Back Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const success = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Missing verification token.'
    loading.value = false
    return
  }

  try {
    await api.get('/auth/verify-email', { params: { token } })
    success.value = 'Email verified successfully! You can now log in.'
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid or expired verification link.'
  } finally {
    loading.value = false
  }
})
</script>
