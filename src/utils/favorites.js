import api from '@/utils/api'
import { getToken } from './auth'

export async function toggleFavorite(poolId) {
  // Ensure token present; api interceptor uses getToken
  if (!getToken()) throw new Error('Not authenticated')

  const favorites = await api.get('/favorites')
  const isFavorited = favorites.data.some(p => p.id === poolId)
  
  if (isFavorited) {
    await api.delete(`/favorites/${poolId}`)
  } else {
    await api.post(`/favorites/${poolId}`)
  }
}

export async function getFavorites() {
  const response = await api.get('/favorites')
  return response.data
}
 
export default api
