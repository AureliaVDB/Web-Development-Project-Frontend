<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="flex border-b">
        <button @click="activeTab = 'users'" :class="tabClass('users')">Users</button>
        <button @click="activeTab = 'bookings'" :class="tabClass('bookings')">Bookings</button>
        <button @click="activeTab = 'pools'" :class="tabClass('pools')">Pools</button>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="bg-white rounded-lg shadow">
      <div class="p-6 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">Users ({{ users.length }})</h2>
        <div class="flex gap-2">
          <button @click="openUserForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add User</button>
          <button @click="loadUsers" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">Loading...</div>
        <div v-else-if="users.length === 0" class="text-center py-12 text-gray-600">
          <p class="mb-4">No users found.</p>
          <div class="flex justify-center gap-3">
            <button @click="openUserForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add User</button>
            <button @click="loadUsers" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
          </div>
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Bookings</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ user.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-3">
                <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 text-xs rounded">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ user._count.bookings }}</td>
              <td class="px-4 py-3">
                <button @click="openUserForm(user)" class="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                <button @click="deleteUser(user)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bookings Tab -->
    <div v-if="activeTab === 'bookings'" class="bg-white rounded-lg shadow">
      <div class="p-6 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">Bookings ({{ bookings.length }})</h2>
        <div class="flex gap-2">
          <button @click="openBookingForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Booking</button>
          <button @click="loadBookings" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">Loading...</div>
        <div v-else-if="bookings.length === 0" class="text-center py-12 text-gray-600">
          <p class="mb-4">No bookings found.</p>
          <div class="flex justify-center gap-3">
            <button @click="openBookingForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Booking</button>
            <button @click="loadBookings" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
          </div>
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pool</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ booking.user.name }}</td>
              <td class="px-4 py-3 text-sm">{{ booking.pool.name }}<br><span class="text-xs text-gray-500">{{ booking.pool.city }}</span></td>
              <td class="px-4 py-3 text-sm">{{ formatDate(booking.bookingDate) }}</td>
              <td class="px-4 py-3 text-sm">{{ booking.startTime }}–{{ booking.endTime }}</td>
              <td class="px-4 py-3">
                <span :class="booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 text-xs rounded">
                  {{ booking.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button @click="openBookingForm(booking)" class="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                <button @click="deleteBooking(booking)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pools Tab -->
    <div v-if="activeTab === 'pools'" class="bg-white rounded-lg shadow">
      <div class="p-6 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">Pools ({{ pools.length }})</h2>
        <div class="flex gap-2">
          <button @click="openPoolForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Pool</button>
          <button @click="loadPools" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">Loading...</div>
        <div v-else-if="pools.length === 0" class="text-center py-12 text-gray-600">
          <p class="mb-4">No pools found.</p>
          <div class="flex justify-center gap-3">
            <button @click="openPoolForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Pool</button>
            <button @click="loadPools" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Refresh</button>
          </div>
        </div>
        <table v-else class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">City</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Capacity</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hours</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="pool in pools" :key="pool.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">{{ pool.name }}</td>
              <td class="px-4 py-3">{{ pool.city }}</td>
              <td class="px-4 py-3">
                <span :class="pool.isIndoor ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'" class="px-2 py-1 text-xs rounded">
                  {{ pool.isIndoor ? 'Indoor' : 'Outdoor' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ pool.capacity }}</td>
              <td class="px-4 py-3">{{ pool.openingTime }}–{{ pool.closingTime }}</td>
              <td class="px-4 py-3">
                <button @click="openPoolForm(pool)" class="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                <button @click="deletePool(pool)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Form Modal -->
    <div v-if="showUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeUserForm">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ editingUser?.id ? 'Edit User' : 'Add User' }}</h3>
          <button @click="closeUserForm" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name *</label>
            <input v-model="userForm.name" required class="w-full border rounded px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email *</label>
            <input v-model="userForm.email" type="email" required class="w-full border rounded px-3 py-2">
          </div>
          <div v-if="!editingUser?.id">
            <label class="block text-sm font-medium mb-1">Password *</label>
            <input v-model="userForm.password" type="password" required class="w-full border rounded px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Role *</label>
            <select v-model="userForm.role" required class="w-full border rounded px-3 py-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="flex gap-2 pt-4">
            <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save</button>
            <button type="button" @click="closeUserForm" class="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Booking Form Modal -->
    <div v-if="showBookingForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeBookingForm">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ editingBooking?.id ? 'Edit Booking' : 'Add Booking' }}</h3>
          <button @click="closeBookingForm" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form @submit.prevent="saveBooking" class="p-6 space-y-4">
          <div v-if="!editingBooking?.id">
            <label class="block text-sm font-medium mb-1">User *</label>
            <select v-model="bookingForm.userId" required class="w-full border rounded px-3 py-2">
              <option value="">Select User</option>
              <option v-for="user in users.filter(u => u.role !== 'admin')" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
            </select>
          </div>
          <div v-if="!editingBooking?.id">
            <label class="block text-sm font-medium mb-1">Pool *</label>
            <select v-model="bookingForm.poolId" required class="w-full border rounded px-3 py-2">
              <option value="">Select Pool</option>
              <option v-for="pool in pools" :key="pool.id" :value="pool.id">{{ pool.name }} - {{ pool.city }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Date *</label>
            <input v-model="bookingForm.bookingDate" type="date" required class="w-full border rounded px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Start Time *</label>
            <input v-model="bookingForm.startTime" type="time" required class="w-full border rounded px-3 py-2">
          </div>
          <div v-if="editingBooking?.id">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="bookingForm.status" class="w-full border rounded px-3 py-2">
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="flex gap-2 pt-4">
            <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save</button>
            <button type="button" @click="closeBookingForm" class="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pool Form Modal -->
    <div v-if="showPoolForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" @click.self="closePoolForm">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ editingPool?.id ? 'Edit Pool' : 'Add Pool' }}</h3>
          <button @click="closePoolForm" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form @submit.prevent="savePool" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2" v-if="!editingPool?.id">
              <label class="block text-sm font-medium mb-1">Pool ID *</label>
              <input v-model="poolForm.id" required class="w-full border rounded px-3 py-2" placeholder="unique-pool-id">
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Name *</label>
              <input v-model="poolForm.name" required class="w-full border rounded px-3 py-2">
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Address *</label>
              <input v-model="poolForm.address" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">City *</label>
              <input v-model="poolForm.city" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Type</label>
              <select v-model="poolForm.isIndoor" class="w-full border rounded px-3 py-2">
                <option :value="true">Indoor</option>
                <option :value="false">Outdoor</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Latitude *</label>
              <input v-model="poolForm.latitude" type="number" step="any" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Longitude *</label>
              <input v-model="poolForm.longitude" type="number" step="any" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Capacity *</label>
              <input v-model="poolForm.capacity" type="number" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Pool Type</label>
              <input v-model="poolForm.poolType" class="w-full border rounded px-3 py-2" placeholder="recreational">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Opening Time *</label>
              <input v-model="poolForm.openingTime" type="time" required class="w-full border rounded px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Closing Time *</label>
              <input v-model="poolForm.closingTime" type="time" required class="w-full border rounded px-3 py-2">
            </div>
          </div>
          <div class="flex gap-2 pt-4">
            <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save</button>
            <button type="button" @click="closePoolForm" class="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
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

    <!-- Confirm Modal -->
    <div v-if="confirm.visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeConfirm">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ confirm.title }}</h3>
          <button @click="closeConfirm" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="p-6">
          <p class="text-gray-700">{{ confirm.message }}</p>
          <div class="flex gap-2 pt-6">
            <button @click="handleConfirm" class="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">{{ confirm.confirmText }}</button>
            <button @click="closeConfirm" class="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">{{ confirm.cancelText }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const activeTab = ref('users')
const loading = ref(false)
const users = ref([])
const bookings = ref([])
const pools = ref([])

const showUserForm = ref(false)
const showBookingForm = ref(false)
const showPoolForm = ref(false)
const editingUser = ref(null)
const editingBooking = ref(null)
const editingPool = ref(null)

const userForm = ref({ name: '', email: '', password: '', role: 'user' })
const bookingForm = ref({ userId: '', poolId: '', bookingDate: '', startTime: '', status: 'confirmed' })
const poolForm = ref({ id: '', name: '', address: '', city: '', latitude: '', longitude: '', isIndoor: true, capacity: 20, poolType: 'recreational', openingTime: '08:00', closingTime: '20:00' })

// Toast state
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

// Confirm modal state
const confirm = ref({ visible: false, title: '', message: '', confirmText: 'Delete', cancelText: 'Cancel', onConfirm: null })

function openConfirm({ title, message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm }) {
  confirm.value = { visible: true, title, message, confirmText, cancelText, onConfirm }
}

function closeConfirm() {
  confirm.value.visible = false
  confirm.value.onConfirm = null
}

async function handleConfirm() {
  try {
    if (typeof confirm.value.onConfirm === 'function') {
      await confirm.value.onConfirm()
    }
  } finally {
    closeConfirm()
  }
}

function tabClass(tab) {
  return activeTab.value === tab 
    ? 'px-6 py-3 font-medium border-b-2 border-blue-600 text-blue-600' 
    : 'px-6 py-3 font-medium text-gray-600 hover:text-gray-900'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await api.get('/admin/users')
    users.value = res.data.users || []
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to load users', 'error')
  } finally {
    loading.value = false
  }
}

async function loadBookings() {
  loading.value = true
  try {
    const res = await api.get('/admin/bookings')
    bookings.value = res.data.bookings || []
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

async function loadPools() {
  loading.value = true
  try {
    const res = await api.get('/pools')
    pools.value = res.data.pools || []
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to load pools', 'error')
  } finally {
    loading.value = false
  }
}

// User CRUD
function openUserForm(user = null) {
  editingUser.value = user
  if (user) {
    userForm.value = { name: user.name, email: user.email, role: user.role, password: '' }
  } else {
    userForm.value = { name: '', email: '', password: '', role: 'user' }
  }
  showUserForm.value = true
}

function closeUserForm() {
  showUserForm.value = false
  editingUser.value = null
}

async function saveUser() {
  try {
    if (editingUser.value?.id) {
      await api.put(`/admin/users/${editingUser.value.id}`, userForm.value)
      triggerToast('User updated successfully', 'success')
    } else {
      await api.post('/admin/users', userForm.value)
      triggerToast('User created successfully', 'success')
    }
    closeUserForm()
    await loadUsers()
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to save user', 'error')
  }
}

async function deleteUser(user) {
  openConfirm({
    title: 'Delete User',
    message: `Delete user ${user.name}? This will also delete ${user._count.bookings} booking(s).`,
    onConfirm: async () => {
      try {
        await api.delete(`/admin/users/${user.id}`)
        triggerToast('User deleted', 'success')
        await loadUsers()
      } catch (err) {
        triggerToast(err.response?.data?.error || 'Failed to delete user', 'error')
      }
    }
  })
}

// Booking CRUD
function openBookingForm(booking = null) {
  editingBooking.value = booking
  if (booking) {
    bookingForm.value = {
      userId: booking.user.id,
      poolId: booking.pool.id,
      bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0],
      startTime: booking.startTime,
      status: booking.status
    }
  } else {
    bookingForm.value = { userId: '', poolId: '', bookingDate: '', startTime: '', status: 'confirmed' }
  }
  showBookingForm.value = true
}

function closeBookingForm() {
  showBookingForm.value = false
  editingBooking.value = null
}

async function saveBooking() {
  try {
    if (editingBooking.value?.id) {
      await api.put(`/admin/bookings/${editingBooking.value.id}`, bookingForm.value)
      triggerToast('Booking updated successfully', 'success')
    } else {
      await api.post('/admin/bookings', bookingForm.value)
      triggerToast('Booking created successfully', 'success')
    }
    closeBookingForm()
    await loadBookings()
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to save booking', 'error')
  }
}

async function deleteBooking(booking) {
  openConfirm({
    title: 'Delete Booking',
    message: `Delete booking for ${booking.user.name} at ${booking.pool.name}?`,
    onConfirm: async () => {
      try {
        await api.delete(`/admin/bookings/${booking.id}`)
        triggerToast('Booking deleted', 'success')
        await loadBookings()
      } catch (err) {
        triggerToast(err.response?.data?.error || 'Failed to delete booking', 'error')
      }
    }
  })
}

// Pool CRUD
function openPoolForm(pool = null) {
  editingPool.value = pool
  if (pool) {
    poolForm.value = {
      id: pool.id,
      name: pool.name,
      address: pool.address,
      city: pool.city,
      latitude: pool.latitude,
      longitude: pool.longitude,
      isIndoor: pool.isIndoor,
      capacity: pool.capacity,
      poolType: pool.poolType,
      openingTime: pool.openingTime,
      closingTime: pool.closingTime
    }
  } else {
    poolForm.value = { id: '', name: '', address: '', city: '', latitude: '', longitude: '', isIndoor: true, capacity: 20, poolType: 'recreational', openingTime: '08:00', closingTime: '20:00' }
  }
  showPoolForm.value = true
}

function closePoolForm() {
  showPoolForm.value = false
  editingPool.value = null
}

async function savePool() {
  try {
    if (editingPool.value?.id) {
      await api.put(`/admin/pools/${editingPool.value.id}`, poolForm.value)
      triggerToast('Pool updated successfully', 'success')
    } else {
      await api.post('/admin/pools', poolForm.value)
      triggerToast('Pool created successfully', 'success')
    }
    closePoolForm()
    await loadPools()
  } catch (err) {
    triggerToast(err.response?.data?.error || 'Failed to save pool', 'error')
  }
}

async function deletePool(pool) {
  openConfirm({
    title: 'Delete Pool',
    message: `Delete pool ${pool.name}?`,
    onConfirm: async () => {
      try {
        await api.delete(`/admin/pools/${pool.id}`)
        triggerToast('Pool deleted', 'success')
        await loadPools()
      } catch (err) {
        triggerToast(err.response?.data?.error || 'Failed to delete pool', 'error')
      }
    }
  })
}

onMounted(() => {
  loadUsers()
  loadBookings()
  loadPools()
})
</script>
