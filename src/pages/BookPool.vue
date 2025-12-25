<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-gray-600">Loading pool details...</div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-center py-6">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <router-link to="/pools" class="text-blue-600 hover:underline">← Back to Pools</router-link>
    </div>

    <!-- Booking Page -->
    <div v-else-if="pool">
      <!-- Pool Info -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <router-link to="/pools" class="text-blue-600 hover:underline mb-4 inline-block">← Back to Pools</router-link>
        <h1 class="text-3xl font-bold mb-2">{{ pool.name }}</h1>
        <p class="text-gray-600 mb-1">📍 {{ pool.address }}, {{ pool.city }}</p>
        <p class="text-sm text-gray-500 mb-2">
          {{ pool.isIndoor ? 'Indoor' : 'Outdoor' }} • Capacity: {{ pool.capacity }} people per hour
        </p>
        <p class="text-sm text-gray-700 font-medium">
          Operating Hours: {{ pool.openingTime }} – {{ pool.closingTime }}
        </p>
      </div>

      <!-- Calendar Section -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Select a Date</h2>
        
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-4">
          <button @click="previousMonth" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
            ← Previous
          </button>
          <h3 class="text-xl font-semibold">{{ currentMonthYear }}</h3>
          <button @click="nextMonth" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
            Next →
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <!-- Day Headers -->
          <div v-for="day in dayHeaders" :key="day" class="text-center font-semibold text-gray-700 py-2">
            {{ day }}
          </div>
          
          <!-- Calendar Days -->
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="day.date && !day.isPast ? selectDate(day.date) : null"
            :class="[
              'text-center py-3 rounded cursor-pointer border',
              day.date ? 'font-medium' : 'bg-gray-50',
              day.isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : '',
              day.isSelected ? 'ring-2 ring-blue-500' : '',
              getDayColorClass(day)
            ]"
          >
            {{ day.label }}
          </div>
        </div>

        <div class="mt-4 flex gap-4 text-sm">
          <span class="flex items-center gap-2">
            <span class="w-4 h-4 bg-green-200 border border-green-400 rounded"></span>
            Available
          </span>
          <span class="flex items-center gap-2">
            <span class="w-4 h-4 bg-red-200 border border-red-400 rounded"></span>
            Fully Booked
          </span>
          <span class="flex items-center gap-2">
            <span class="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></span>
            Closed
          </span>
        </div>
      </div>

      <!-- Time Slots Section -->
      <div v-if="selectedDate" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Select Time Slot</h2>
        <p class="text-gray-600 mb-4">{{ formatDate(selectedDate) }}</p>

        <div v-if="loadingSlots" class="text-center py-6 text-gray-600">Loading available slots...</div>
        
        <div v-else-if="timeSlots.length === 0" class="text-center py-6 text-gray-600">
          No available time slots for this date.
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            v-for="slot in timeSlots"
            :key="slot.startTime"
            @click="selectTimeSlot(slot)"
            :disabled="!slot.available"
            :class="[
              'py-3 px-4 rounded font-medium border-2 transition-all',
              slot.available 
                ? 'bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer text-green-800'
                : 'bg-red-50 border-red-300 cursor-not-allowed text-red-800 opacity-60',
              slot.isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            ]"
          >
            {{ slot.startTime }}–{{ slot.endTime }}
            <span v-if="!slot.available" class="block text-xs">Full</span>
          </button>
        </div>

        <!-- Book Button -->
        <div v-if="selectedTimeSlot" class="mt-6">
          <button
            @click="createBooking"
            :disabled="bookingInProgress"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ bookingInProgress ? 'Booking...' : `Book ${selectedTimeSlot.startTime}–${selectedTimeSlot.endTime} on ${formatDate(selectedDate)}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const poolId = route.params.id

const pool = ref(null)
const loading = ref(true)
const error = ref('')

// Calendar state
const currentDate = ref(new Date())
const selectedDate = ref(null)
const dayAvailability = ref({}) // { 'YYYY-MM-DD': 'available' | 'full' | 'closed' }

// Time slots state
const loadingSlots = ref(false)
const timeSlots = ref([])
const selectedTimeSlot = ref(null)

// Booking state
const bookingInProgress = ref(false)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ label: '', date: null })
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDateISO(date)
    const isPast = date < today
    
    days.push({
      label: day,
      date: date,
      dateStr: dateStr,
      isPast: isPast,
      isSelected: selectedDate.value && formatDateISO(selectedDate.value) === dateStr,
      availability: dayAvailability.value[dateStr] || 'unknown'
    })
  }
  
  return days
})

function getDayColorClass(day) {
  if (!day.date || day.isPast) return ''
  
  const avail = day.availability
  if (avail === 'available') return 'bg-green-50 border-green-300 hover:bg-green-100'
  if (avail === 'full') return 'bg-red-50 border-red-300 cursor-not-allowed'
  if (avail === 'closed') return 'bg-gray-200 border-gray-400 cursor-not-allowed'
  return 'bg-white border-gray-300 hover:bg-gray-100'
}

function formatDateISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
  loadMonthAvailability()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
  loadMonthAvailability()
}

async function selectDate(date) {
  selectedDate.value = date
  selectedTimeSlot.value = null
  await loadTimeSlots(date)
}

function selectTimeSlot(slot) {
  if (slot.available) {
    selectedTimeSlot.value = slot
  }
}

async function fetchPoolDetails() {
  try {
    loading.value = true
    const response = await api.get(`/pools/${poolId}`)
    pool.value = response.data
    await loadMonthAvailability()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load pool details'
  } finally {
    loading.value = false
  }
}

async function loadMonthAvailability() {
  // For now, we'll load availability when user selects a date
  // Later we can optimize by loading the whole month at once
  // This keeps it simple for the initial implementation
}

async function loadTimeSlots(date) {
  try {
    loadingSlots.value = true
    const dateStr = formatDateISO(date)
    
    // Fetch availability for this date
    const response = await api.get(`/pools/${poolId}/availability`, { params: { date: dateStr } })
    const slots = response.data?.slots || []

    // Map backend slots to UI shape and filter by pool operating hours
    const withinHours = slots.filter(s => isWithinHours(s.startTime, pool.value.openingTime, pool.value.closingTime))
    timeSlots.value = withinHours.map(s => ({
      startTime: s.startTime,
      endTime: s.endTime,
      available: s.isAvailable,
      isSelected: false
    }))
    
  } catch (err) {
    console.error('Error loading time slots:', err)
    timeSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

function isWithinHours(slotStart, openingTime, closingTime) {
  const toMinutes = t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])
  const s = toMinutes(slotStart)
  const o = toMinutes(openingTime)
  const c = toMinutes(closingTime)
  return s >= o && s < c
}

async function createBooking() {
  if (!selectedDate.value || !selectedTimeSlot.value) return
  
  try {
    bookingInProgress.value = true
    
    const dateStr = formatDateISO(selectedDate.value)
    
    await api.post('/bookings', {
      poolId: poolId,
      bookingDate: dateStr,
      startTime: selectedTimeSlot.value.startTime
    })
    
    // Success! Show message and redirect
    alert('Booking created successfully!')
    router.push('/dashboard')
    
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create booking')
  } finally {
    bookingInProgress.value = false
  }
}

onMounted(() => {
  fetchPoolDetails()
})
</script>
