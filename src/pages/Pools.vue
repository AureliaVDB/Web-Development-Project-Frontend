<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Swimming Pools</h1>

    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by name..."
          class="border border-gray-300 rounded px-4 py-2"
        />
        <select v-model="filters.type" class="border border-gray-300 rounded px-4 py-2">
          <option value="">All Types</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
        </select>
        <div class="relative">
          <input
            v-model="filters.city"
            @input="onCityInput"
            @focus="onCityInput"
            @blur="onCityBlur"
            type="text"
            placeholder="City..."
            class="border border-gray-300 rounded px-4 py-2 w-full"
            autocomplete="off"
          />
          <div
            v-if="showSuggestions && citySuggestions.length"
            class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow"
          >
            <ul class="max-h-56 overflow-auto">
              <li
                v-for="city in citySuggestions"
                :key="city"
                @mousedown.prevent="selectCity(city)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {{ city }}
              </li>
            </ul>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded px-3 py-2">
          <input v-model="showFavoritesOnly" type="checkbox" class="h-4 w-4" />
          <span>Show favorites</span>
        </label>
        <div class="flex gap-2">
          <button @click="fetchPools" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Apply Filters
          </button>
          <button @click="resetFilters" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 w-full">
            Reset
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-2">Distance filter coming later (requires Lambert coords).</p>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-600">Loading pools...</div>
    <div v-else-if="error" class="text-center py-6 text-red-600">{{ error }}</div>

    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <p class="text-gray-700">Showing <span class="font-semibold">{{ visibleCount }}</span> pools</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="pool in visiblePools" :key="pool.id" class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="text-xl font-semibold mb-1">{{ pool.name }}</h3>
              <p class="text-gray-600 mb-1">📍 {{ pool.address }}, {{ pool.city }}</p>
            </div>
            <button
              v-if="isLoggedIn"
              @click="toggleFavoritePool(pool)"
              :disabled="favoriteLoading[pool.id]"
              class="text-2xl leading-none transition-opacity"
              :class="favoriteLoading[pool.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'"
              :aria-pressed="pool.isFavorited"
              :aria-label="pool.isFavorited ? 'Remove from favorites' : 'Add to favorites'"
            >
              <span v-if="pool.isFavorited">❤️</span>
              <span v-else>🤍</span>
            </button>
          </div>
          <p class="text-sm text-gray-500 mb-3">
            {{ pool.isIndoor ? 'Indoor' : 'Outdoor' }} • Capacity: {{ pool.capacity }}
          </p>
          <p class="text-xs text-gray-500 mb-4">Hours: {{ pool.openingTime }}–{{ pool.closingTime }}</p>
          <router-link
            v-if="!isAdmin"
            :to="`/pools/${pool.id}/book`"
            class="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Book
          </router-link>
          <div
            v-else
            class="block text-center bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
          >
            Admin View Only
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/utils/api'
import { getUser } from '@/utils/auth'
import { toggleFavorite as toggleFavoriteApi } from '@/utils/favorites'

const pools = ref([])
const count = ref(0)
const loading = ref(false)
const error = ref('')
const isAdmin = computed(() => {
  const user = getUser()
  return user && user.role === 'admin'
})
const isLoggedIn = computed(() => Boolean(getUser()))

const filters = reactive({
  search: '',
  type: '',
  city: ''
})
const showFavoritesOnly = ref(false)
const favoriteLoading = ref({})

// City suggestions state
const citySuggestions = ref([])
const showSuggestions = ref(false)
const cityDebounce = ref(null)

const buildParams = () => {
  const params = {}
  if (filters.search) params.search = filters.search
  if (filters.type) params.type = filters.type
  if (filters.city) params.city = filters.city
  return params
}

const fetchPools = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/pools', { params: buildParams() })
    pools.value = data.pools || []
    count.value = data.count || pools.value.length
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load pools'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.city = ''
  fetchPools()
}

const toggleFavoritePool = async (pool) => {
  if (!pool || favoriteLoading.value[pool.id]) return
  favoriteLoading.value = { ...favoriteLoading.value, [pool.id]: true }
  try {
    await toggleFavoriteApi(pool.id)
    pool.isFavorited = !pool.isFavorited
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not update favorite'
  } finally {
    favoriteLoading.value = { ...favoriteLoading.value, [pool.id]: false }
  }
}

onMounted(fetchPools)

// --- City suggestions logic ---
const fetchCitySuggestions = async () => {
  if (!filters.city || filters.city.length < 2) {
    citySuggestions.value = []
    return
  }
  try {
    const { data } = await api.get('/pools', { params: { city: filters.city } })
    const unique = Array.from(new Set((data.pools || []).map(p => p.city).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 10)
    citySuggestions.value = unique
    showSuggestions.value = true
  } catch (e) {
    citySuggestions.value = []
  }
}

const onCityInput = () => {
  showSuggestions.value = true
  if (cityDebounce.value) clearTimeout(cityDebounce.value)
  cityDebounce.value = setTimeout(fetchCitySuggestions, 250)
}

const onCityBlur = () => {
  // delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

const selectCity = (city) => {
  filters.city = city
  showSuggestions.value = false
  fetchPools()
}

const visiblePools = computed(() => {
  if (!showFavoritesOnly.value) return pools.value
  return pools.value.filter(pool => pool.isFavorited)
})

const visibleCount = computed(() => {
  if (showFavoritesOnly.value) return visiblePools.value.length
  return count.value || pools.value.length
})
</script>
