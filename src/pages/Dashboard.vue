<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">My Dashboard</h1>

    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-20 left-1/2 -translate-x-1/2 transform z-50 px-6 py-4 rounded-lg shadow-lg text-white text-center max-w-md',
        toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      ]"
    >
      {{ toast.message }}
    </div>

    <!-- Confirm Dialog -->
    <div
      v-if="confirmDialog.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-2">Confirm Cancellation</h3>
        <p class="text-gray-600 mb-6">{{ confirmDialog.message }}</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="confirmDialog.show = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            No, Keep It
          </button>
          <button
            @click="confirmCancel"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-3xl mb-2">📅</div>
        <h3 class="text-2xl font-bold">{{ upcomingCount }}</h3>
        <p class="text-gray-600">Upcoming</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-3xl mb-2">✅</div>
        <h3 class="text-2xl font-bold">{{ completedCount }}</h3>
        <p class="text-gray-600">Completed</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-3xl mb-2">⏱️</div>
        <h3 class="text-2xl font-bold">{{ totalHours }}</h3>
        <p class="text-gray-600">Total Hours</p>
      </div>
    </div>

    <!-- Bookings List -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">My Bookings</h2>
        <button @click="loadBookings" class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Refresh</button>
      </div>

      <!-- Tabs -->
      <div class="border-b">
        <div class="flex">
          <button
            @click="activeTab = 'upcoming'"
            :class="[
              'px-6 py-3 font-medium transition-colors',
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Upcoming ({{ upcomingBookings.length }})
          </button>
          <button
            @click="activeTab = 'past'"
            :class="[
              'px-6 py-3 font-medium transition-colors',
              activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Past ({{ pastBookings.length }})
          </button>
        </div>
      </div>

      <div class="p-6">
        <div v-if="loading" class="text-center py-8 text-gray-500">Loading bookings...</div>
        <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>
        <div v-else-if="bookings.length === 0" class="text-center py-12 text-gray-600">
          <p class="mb-4">No bookings yet — browse pools to make your first booking.</p>
          <router-link to="/pools" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Browse Pools</router-link>
        </div>

        <!-- Upcoming Bookings -->
        <div v-else-if="activeTab === 'upcoming'">
          <div v-if="upcomingBookings.length === 0" class="text-center py-8 text-gray-600">
            No upcoming bookings
          </div>
          <div v-else class="space-y-4">
            <div v-for="b in upcomingBookings" :key="b.id" class="border rounded p-4 flex items-center justify-between">
              <div>
                <div class="font-semibold">{{ b.pool.name }}</div>
                <div class="text-sm text-gray-600">{{ b.pool.address }}, {{ b.pool.city }}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-medium">{{ formatDate(b.bookingDate) }}</div>
                  <div class="text-sm text-gray-600">{{ b.startTime }}–{{ b.endTime }}</div>
                </div>
                <button
                  v-if="canCancel(b)"
                  @click="cancelBooking(b)"
                  class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Cancel
                </button>
                <span v-else class="text-xs text-gray-400">{{ getStatus(b) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Bookings -->
        <div v-else-if="activeTab === 'past'">
          <div v-if="pastBookings.length === 0" class="text-center py-8 text-gray-600">
            No past bookings
          </div>
          <div v-else class="space-y-4">
            <div v-for="b in pastBookings" :key="b.id" class="border rounded p-4 flex items-center justify-between opacity-75">
              <div>
                <div class="font-semibold">{{ b.pool.name }}</div>
                <div class="text-sm text-gray-600">{{ b.pool.address }}, {{ b.pool.city }}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-medium">{{ formatDate(b.bookingDate) }}</div>
                  <div class="text-sm text-gray-600">{{ b.startTime }}–{{ b.endTime }}</div>
                </div>
                <span class="text-xs text-green-600 font-medium">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const bookings = ref([])
const loading = ref(false)
const error = ref('')
const activeTab = ref('upcoming')

// Toast notification state
const toast = ref({
  show: false,
  message: '',
  type: 'success' // 'success' | 'error' | 'info'
})

// Confirm dialog state
const confirmDialog = ref({
  show: false,
  message: '',
  booking: null
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const upcomingBookings = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return bookings.value.filter(b => {
    const bookingDate = new Date(b.bookingDate)
    bookingDate.setHours(0, 0, 0, 0)
    return bookingDate >= now
  }).sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
})

const pastBookings = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return bookings.value.filter(b => {
    const bookingDate = new Date(b.bookingDate)
    bookingDate.setHours(0, 0, 0, 0)
    return bookingDate < now
  }).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
})

const upcomingCount = computed(() => upcomingBookings.value.length)

const completedCount = computed(() => pastBookings.value.length)

const totalHours = computed(() => bookings.value.reduce((sum, b) => sum + (b.duration || 1), 0))

function canCancel(booking) {
  const bookingDateTime = new Date(booking.bookingDate)
  const [hours, minutes] = booking.startTime.split(':')
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const now = new Date()
  const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60)
  
  return hoursUntil >= 24
}

function getStatus(booking) {
  const bookingDateTime = new Date(booking.bookingDate)
  const [hours, minutes] = booking.startTime.split(':')
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const now = new Date()
  if (bookingDateTime < now) return 'Completed'
  return 'Cannot cancel (<24h)'
}

async function cancelBooking(booking) {
  confirmDialog.value = {
    show: true,
    message: `Cancel booking at ${booking.pool.name} on ${formatDate(booking.bookingDate)} at ${booking.startTime}?`,
    booking
  }
}

async function confirmCancel() {
  const booking = confirmDialog.value.booking
  confirmDialog.value.show = false
  
  try {
    await api.delete(`/bookings/${booking.id}`)
    showToast('Booking cancelled successfully. You will receive a confirmation email.', 'success')
    await loadBookings()
  } catch (err) {
    showToast(err.response?.data?.error || 'Failed to cancel booking', 'error')
  }
}

async function loadBookings() {
  try {
    loading.value = true
    error.value = ''
    const res = await api.get('/bookings/my-bookings')
    bookings.value = res.data || []
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load bookings'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBookings()
})
</script>
