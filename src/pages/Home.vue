<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl font-bold text-gray-900 mb-6">
        Welcome to Swimming Pool Booking
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Find and book swimming pools across Flanders
      </p>
      
      <div class="flex gap-4 justify-center">
        <router-link 
          to="/pools" 
          class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Browse Pools
        </router-link>
        <router-link 
          v-if="!authed"
          to="/register" 
          class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Get Started
        </router-link>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-4xl mb-4">🏊‍♂️</div>
          <h3 class="text-xl font-semibold mb-2">315+ Pools</h3>
          <p class="text-gray-600">Indoor and outdoor pools across Flanders</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-4xl mb-4">📅</div>
          <h3 class="text-xl font-semibold mb-2">Easy Booking</h3>
          <p class="text-gray-600">Book your slot in just a few clicks</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-4xl mb-4">✅</div>
          <h3 class="text-xl font-semibold mb-2">Instant Confirmation</h3>
          <p class="text-gray-600">Get email confirmation immediately</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { isAuthenticated } from '@/utils/auth'

const authed = computed(() => isAuthenticated())
</script>
