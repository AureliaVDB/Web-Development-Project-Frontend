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
import { toggleFavorite } from '@/utils/favorites'

const mapContainer = ref(null)
const error = ref('')
const poolCount = ref(0)
const locating = ref(false)
const pools = ref([])
const isAdmin = computed(() => {
  const user = getUser()
  return user && user.role === 'admin'
})

let map = null
let userMarker = null
const poolMarkers = new Map()

const markerShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
const defaultPoolIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const favoritePoolIcon = L.icon({
  // Custom pink marker via inline SVG data URI
  iconUrl:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"%3E%3Cpath d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.8 12.5 41 12.5 41S25 21.8 25 12.5C25 5.6 19.4 0 12.5 0zm0 19.1a6.6 6.6 0 1 1 0-13.2 6.6 6.6 0 0 1 0 13.2z" fill="%23ff4d94" stroke="%23c41f64" stroke-width="1"/%3E%3C/svg%3E',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

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
    pools.value = data.pools || []
    poolCount.value = pools.value.length

    clearPoolMarkers()

    pools.value.forEach(pool => {
      if (pool.latitude && pool.longitude) {
        const marker = createPoolMarker(pool)
        poolMarkers.set(pool.id, marker)
      }
    })

    if (poolMarkers.size > 0) {
      const group = L.featureGroup(Array.from(poolMarkers.values()))
      map.fitBounds(group.getBounds().pad(0.1))
    }
  } catch (err) {
    error.value = 'Failed to load pools'
    console.error(err)
  }
}

const clearPoolMarkers = () => {
  poolMarkers.forEach(marker => {
    if (map && marker) map.removeLayer(marker)
  })
  poolMarkers.clear()
}

const createPoolMarker = (pool) => {
  const marker = L.marker([pool.latitude, pool.longitude], {
    icon: pool.isFavorited ? favoritePoolIcon : defaultPoolIcon
  })
    .addTo(map)
    .bindPopup(generatePopup(pool))

  marker.on('popupopen', () => attachPopupHandler(pool.id))
  return marker
}

const generatePopup = (pool) => {
  const bookButton = isAdmin.value
    ? '<span class="inline-block bg-gray-400 text-white text-xs px-3 py-1 rounded cursor-not-allowed">Admin View Only</span>'
    : `<a href="/pools/${pool.id}/book" class="inline-block bg-blue-600 text-xs px-3 py-1 rounded hover:bg-blue-700" style="color: white; text-decoration: none;">Book</a>`

  const favoriteButton = isAdmin.value
    ? ''
    : `<button data-fav-id="${pool.id}" class="mt-2 inline-block border border-pink-200 text-pink-600 text-xs px-3 py-1 rounded hover:bg-pink-50">${pool.isFavorited ? '❤️ Unfavorite' : '🤍 Favorite'}</button>`

  return `
    <div class="text-sm">
      <h3 class="font-semibold mb-1">${pool.name}</h3>
      <p class="text-gray-600 text-xs mb-1">${pool.address}, ${pool.city}</p>
      <p class="text-xs text-gray-500 mb-2">${pool.isIndoor ? 'Indoor' : 'Outdoor'} • ${pool.capacity} capacity</p>
      ${bookButton}
      ${favoriteButton}
    </div>
  `
}

const attachPopupHandler = (poolId) => {
  const marker = poolMarkers.get(poolId)
  const popupEl = marker?.getPopup()?.getElement()
  if (!popupEl) return

  const btn = popupEl.querySelector(`[data-fav-id="${poolId}"]`)
  if (btn) {
    btn.onclick = async (event) => {
      event.preventDefault()
      await handleToggleFavorite(poolId)
      const poolData = pools.value.find(p => p.id === poolId)
      if (poolData) marker.setPopupContent(generatePopup(poolData))
    }
  }
}

const updateMarkerState = (pool) => {
  const marker = poolMarkers.get(pool.id)
  if (!marker) return
  marker.setIcon(pool.isFavorited ? favoritePoolIcon : defaultPoolIcon)
  marker.setPopupContent(generatePopup(pool))
  attachPopupHandler(pool.id)
}

const handleToggleFavorite = async (poolId) => {
  const pool = pools.value.find(p => p.id === poolId)
  if (!pool) return
  try {
    await toggleFavorite(poolId)
    pool.isFavorited = !pool.isFavorited
    updateMarkerState(pool)
  } catch (err) {
    error.value = 'Could not update favorite'
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
