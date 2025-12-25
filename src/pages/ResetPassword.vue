<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h1 class="text-2xl font-bold mb-4 text-center">Reset Password</h1>
      <p class="text-sm text-gray-600 mb-6 text-center">Enter a new password for your account.</p>

      <form @submit.prevent="handleReset">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            class="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          :disabled="submitting"
        >
          {{ submitting ? 'Submitting...' : 'Set New Password' }}
        </button>
      </form>

      <p v-if="message" class="mt-4 text-sm" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'">
        {{ message }}
      </p>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-blue-600 hover:text-blue-800 text-sm">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const token = ref('')
const newPassword = ref('')
const submitting = ref(false)
const message = ref('')
const messageType = ref('success')

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    messageType.value = 'error'
    message.value = 'Missing or invalid reset token.'
  }
})

async function handleReset() {
  if (!token.value) return
  submitting.value = true
  message.value = ''
  try {
    const { data } = await api.post('/auth/reset-password', {
      token: token.value,
      newPassword: newPassword.value
    })
    messageType.value = 'success'
    message.value = data.message || 'Password reset successful.'
  } catch (err) {
    messageType.value = 'error'
    message.value = err.response?.data?.error || 'Failed to reset password.'
  } finally {
    submitting.value = false
  }
}
</script>
