<template>
  <div class="app-container">
    <div class="app-filters">
      <h1>{{ restaurantInfo?.restaurant_name || 'Restaurant Bookings' }}</h1>
      <div class="controls">
        <DateSelector
          v-model="selectedDate"
          :available-days="availableDays"
          :is-loading="isLoading"
          @refresh="loadDataForSelectedDate"
        />
        <ZoneFilter v-model="selectedZones" :all-zones="allZones" />

        <div class="current-time" v-if="restaurantInfo?.timezone">
          Restaurant Time ({{ restaurantInfo.timezone }}):
          <strong>{{ restaurantCurrentTimeFormatted }}</strong>
        </div>
      </div>
    </div>

    <main class="main-content">
      <LoadingSpinner v-if="isLoading" />
      <div v-else-if="error" class="error-message">
        Error loading data: {{ error.message }}
        <button @click="loadDataForSelectedDate">Retry</button>
      </div>
      <BookingTable
        v-else-if="restaurantData && filteredTables.length > 0 && restaurantInfo"
        :tables="filteredTables"
        :restaurant="restaurantInfo"
        :selected-date="selectedDate"
        :current-time="restaurantNow"
        :zoom-level="zoomLevel"
        :time-slot-interval="timeSlotIntervalMinutes"
      />
    </main>
    <ZoomControl @zoom-in="zoomIn" @zoom-out="zoomOut" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchBookingData } from '@/api'
import { formatDate as formatDateForApi } from '@/helpers/timeUtils'
import { useZoom } from '@/composables/useZoom'

import BookingTable from '@/components/table/BookingTable.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DateSelector from '@/components/controls/DateSelector.vue'
import ZoneFilter from '@/components/controls/ZoneFilter.vue'

import type { BookingData, Table, Restaurant } from '@/types/booking'
import ZoomControl from '@/components/controls/ZoomControl.vue'
import { useRestaurantTime } from '@/composables/useRestaurantTime.ts'

const { zoomLevel, zoomIn, zoomOut } = useZoom()
const restaurantTimeZone = computed<string | undefined>(() => restaurantInfo.value?.timezone)
const { restaurantCurrentTimeFormatted, restaurantNow } = useRestaurantTime(restaurantTimeZone)

const isLoading = ref<boolean>(true)
const error = ref<Error | null>(null)
const bookingData = ref<BookingData | null>(null)
const selectedDate = ref<string>('')
const availableDays = ref<string[]>([])
const allZones = ref<string[]>([])
const selectedZones = ref<string[]>([])

const timeSlotIntervalMinutes = ref<number>(30)

const restaurantData = computed<BookingData | null>(() => bookingData.value)
const restaurantInfo = computed<Restaurant | null>(() => bookingData.value?.restaurant ?? null)
const tablesData = computed<Table[]>(() => bookingData.value?.tables || [])

const filteredTables = computed<Table[]>(() => {
  if (!tablesData.value) return []
  const zonesToDisplay = new Set(selectedZones.value)
  if (zonesToDisplay.size === 0 || zonesToDisplay.size === allZones.value.length) {
    return tablesData.value
  }
  return tablesData.value.filter((table) => zonesToDisplay.has(table.zone))
})


const loadData = async (dateToLoad: string): Promise<void> => {
  if (!dateToLoad) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  error.value = null

  try {
    const data = await fetchBookingData(dateToLoad)
    bookingData.value = data

    if (data.available_days && data.available_days.length > 0) {
      availableDays.value = data.available_days
      if (!availableDays.value.includes(selectedDate.value)) {
        selectedDate.value =
          data.current_day && availableDays.value.includes(data.current_day)
            ? data.current_day
            : availableDays.value[0]
        console.warn(
          `Selected date ${dateToLoad} no longer available, switching to ${selectedDate.value}`,
        )
      }
    }

    const currentTables = data.tables || []
    const zones = new Set(currentTables.map((table) => table.zone))
    allZones.value = Array.from(zones)

    const currentSelectedValidZones = selectedZones.value.filter((zone) => zones.has(zone))
    if (
      selectedZones.value.length === 0 ||
      (currentSelectedValidZones.length === 0 && allZones.value.length > 0)
    ) {
      selectedZones.value = [...allZones.value]
    } else {
      selectedZones.value = currentSelectedValidZones
    }
  } catch (err: unknown) {
    console.error('Failed to load booking data:', err)
    if (err instanceof Error) {
      error.value = err
    } else {
      error.value = new Error('An unknown error occurred during data fetch.')
    }
    bookingData.value = null
    allZones.value = []
    selectedZones.value = []
  } finally {
    isLoading.value = false
  }
}

const loadDataForSelectedDate = () => {
  loadData(selectedDate.value)
}

onMounted(async () => {
  const today = formatDateForApi(new Date())
  let initialDateToLoad = today

  try {
    const initialCheckData = await fetchBookingData(today)
    if (initialCheckData.available_days && initialCheckData.available_days.length > 0) {
      availableDays.value = initialCheckData.available_days
      initialDateToLoad =
        initialCheckData.current_day && availableDays.value.includes(initialCheckData.current_day)
          ? initialCheckData.current_day
          : availableDays.value[0]
    } else if (initialCheckData.current_day) {
      availableDays.value = [initialCheckData.current_day]
      initialDateToLoad = initialCheckData.current_day
    } else {
      availableDays.value = [today]
    }

    selectedDate.value = initialDateToLoad
    await loadData(selectedDate.value)
  } catch (err: unknown) {
    console.error('Failed to fetch initial data:', err)
    if (err instanceof Error) {
      error.value = err
    } else {
      error.value = new Error('An unknown error occurred during initial data load.')
    }
    if (availableDays.value.length === 0) availableDays.value = [today]
    if (!selectedDate.value) selectedDate.value = today
    isLoading.value = false
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
}

.app-filters {
  padding: 1rem;
  background: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  flex-shrink: 0;
}

.app-filters h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.current-time {
  font-size: 0.9em;
  margin-left: auto;
  align-self: center;
  padding-left: 1rem;
}

.main-content {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

.error-message {
  color: red;
  padding: 2rem;
  text-align: center;
}
.error-message button {
  margin-left: 1rem;
  padding: 0.3rem 0.8rem;
}
</style>
