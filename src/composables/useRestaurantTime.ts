import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { getCurrentTimeInZone, formatTime } from '@/helpers/timeUtils'

export function useRestaurantTime(timeZone: Ref<string | undefined>) {
  const restaurantCurrentTimeFormatted = ref<string>('')
  const restaurantNow = ref<Date>(new Date())
  let intervalId: number | null = null

  const updateTime = () => {
    if (!timeZone.value) {
      const localNow = new Date()
      restaurantNow.value = localNow
      restaurantCurrentTimeFormatted.value = formatTime(localNow) + ' (Local)' // Indicate local
      return
    }
    const zonedNow = getCurrentTimeInZone(timeZone.value)
    restaurantNow.value = zonedNow
    restaurantCurrentTimeFormatted.value = formatTime(zonedNow)
  }

  watch(
    timeZone,
    (newTimeZone, oldTimeZone) => {
      if (newTimeZone !== oldTimeZone) {
        updateTime()
      }
    },
    { immediate: false },
  )

  onMounted(() => {
    updateTime()
    intervalId = window.setInterval(updateTime, 60000)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return { restaurantCurrentTimeFormatted, restaurantNow }
}
