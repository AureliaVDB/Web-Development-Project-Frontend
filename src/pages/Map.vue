<template>
  <div class="h-screen flex flex-col">
    <div class="bg-white shadow p-4">
      <div class="container mx-auto flex items-center justify-between">
        <h1 class="text-2xl font-bold">Pool Map</h1>
        <div class="flex gap-3 items-center">
          <button
            @click="getUserLocation"
            :disabled="locating"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <span v-if="!locating">📍 Use My Location</span>
            <span v-else>Locating...</span>
          </button>
          <p v-if="poolCount" class="text-sm text-gray-600">{{ poolCount }} pools</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 text-red-700 p-3 text-center">{{ error }}</div>

    <div ref="mapContainer" class="flex-1"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '@/utils/api'
import { getUser } from '@/utils/auth'

const mapContainer = ref(null)
const error = ref('')
const poolCount = ref(0)
const locating = ref(false)
const isAdmin = computed(() => {
  const user = getUser()
  return user && user.role === 'admin'
})

let map = null
let userMarker = null
const poolMarkers = []

onMounted(async () => {
  initMap()
  await loadPools()
})

onUnmounted(() => {
  if (map) map.remove()
})

const initMap = () => {
  // Default center: Belgium
  map = L.map(mapContainer.value).setView([50.8503, 4.3517], 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
}

const loadPools = async () => {
  try {
    const { data } = await api.get('/pools')
    const pools = data.pools || []
    poolCount.value = pools.length

    pools.forEach(pool => {
      if (pool.latitude && pool.longitude) {
        const bookButton = isAdmin.value 
          ? '<span class="inline-block bg-gray-400 text-white text-xs px-3 py-1 rounded cursor-not-allowed">Admin View Only</span>'
          : `<a href="/pools/${pool.id}/book" class="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">Book</a>`
        
        const marker = L.marker([pool.latitude, pool.longitude])
          .addTo(map)
          .bindPopup(`
            <div class="text-sm">
              <h3 class="font-semibold mb-1">${pool.name}</h3>
              <p class="text-gray-600 text-xs mb-1">${pool.address}, ${pool.city}</p>
              <p class="text-xs text-gray-500 mb-2">${pool.isIndoor ? 'Indoor' : 'Outdoor'} • ${pool.capacity} capacity</p>
              ${bookButton}
            </div>
          `)
        poolMarkers.push(marker)
      }
    })

    // Fit bounds to show all pools
    if (poolMarkers.length > 0) {
      const group = L.featureGroup(poolMarkers)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  } catch (err) {
    error.value = 'Failed to load pools'
    console.error(err)
  }
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation not supported by your browser'
    return
  }

  locating.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      // Remove old user marker if exists
      if (userMarker) map.removeLayer(userMarker)

      // Add blue marker for user
      userMarker = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .addTo(map)
        .bindPopup('<b>You are here</b>')
        .openPopup()

      map.setView([latitude, longitude], 12)
      locating.value = false
    },
    (err) => {
      error.value = 'Unable to retrieve your location'
      locating.value = false
      console.error(err)
    }
  )
}
</script>

<style scoped>
/* Ensure map container has height */
</style>
