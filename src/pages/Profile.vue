<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">My Profile</h1>
    
    <div class="max-w-2xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Profile Information</h2>
        <form @submit.prevent="handleUpdateProfile">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              v-model="name"
              class="w-full border border-gray-300 rounded px-4 py-2"
            >
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              v-model="email"
              disabled
              class="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100"
            >
          </div>
          <button 
            type="submit"
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Change Password</h2>
        <p class="text-gray-600 mb-4">To change your password, we'll send a confirmation link to your email. Click the link to securely set a new password.</p>
        <button 
          @click="handleChangePassword"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Send Password Change Email
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow border-2 border-red-200">
        <h2 class="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p class="text-gray-600 mb-4">Delete your account and all your bookings permanently.</p>
        <button 
          @click="handleDeleteAccount"
          class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 transform z-50 px-5 py-3 rounded shadow-lg text-center"
      :class="toastVariant === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      role="status"
      aria-live="polite"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const name = ref('')
const email = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastVariant = ref('success') // 'success' | 'error'

function triggerToast(message, variant = 'success') {
  toastMessage.value = message
  toastVariant.value = variant
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

onMounted(async () => {
  try {
    const { data } = await api.get('/users/profile')
    name.value = data.name || ''
    email.value = data.email || ''
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to load profile', 'error')
  }
})

const handleUpdateProfile = async () => {
  try {
    const { data } = await api.put('/users/profile', { name: name.value })
    triggerToast(data.message || 'Profile updated successfully', 'success')
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to update profile', 'error')
  }
}

const handleChangePassword = async () => {
  try {
    // Use email confirmation flow via forgot-password
    const { data } = await api.post('/auth/forgot-password', { email: email.value })
    triggerToast(data.message || 'If that email exists, a reset link has been sent.', 'success')
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to send password email', 'error')
  }
}

const handleDeleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    return
  }
  // Optional: implement delete with password confirmation
  alert('Please implement account deletion with password confirmation if needed.')
}
</script>
