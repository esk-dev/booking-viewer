<template>
  <div class="table-container" ref="scrollContainer">
    <div class="table-grid" :style="tableStyle">
      <TimeSidebar
        class="sticky-sidebar time-sidebar-grid-area"
        :time-slots="timeSlots"
        :cell-height="zoomLevel.cellHeight"
        :style="timeSidebarParentStyle"
      />

      <TableHeader
        class="sticky-header table-header-grid-area"
        :tables="tables"
        :cell-width="zoomLevel.cellWidth"
        :style="tableHeaderParentStyle"
      />

      <div class="grid-body" ref="gridBody" :style="gridBodyStyle">
        <GridRows
          :tables="tables"
          :time-slots="timeSlots"
          :cell-width="zoomLevel.cellWidth"
          :cell-height="zoomLevel.cellHeight"
          :pixels-per-minute-vertical="pixelsPerMinuteVertical"
          :restaurant-time-zone="restaurant.timezone"
          :get-events-for-table="getEventsForTable"
          :current-time-position="currentTimePosition"
          :total-grid-content-width="totalGridContentWidth"
          :total-grid-content-height="totalGridContentHeight"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type CSSProperties } from 'vue'
import TimeSidebar from './TimeSidebar.vue'
import TableHeader from './TableHeader.vue'
import GridRows from './GridRows.vue'
import { generateTimeSlots, timeToMinutes, calculateEventTimings } from '@/helpers/timeUtils'
import { differenceInMinutes, startOfDay, addMinutes, format } from 'date-fns'
import type {
  Table,
  Restaurant,
  ZoomLevel,
  BookingEventData,
  Order,
  Reservation,
} from '@/types/booking'
import { TABLE_HEADER_HEIGHT, TIME_SIDEBAR_WIDTH } from '@/const/style.ts'

interface Props {
  tables: Table[]
  restaurant: Restaurant
  selectedDate: string
  currentTime: Date
  zoomLevel: ZoomLevel
  timeSlotInterval: number
}
const props = defineProps<Props>()

const scrollContainer = ref<HTMLDivElement | null>(null)
const gridBody = ref<HTMLDivElement | null>(null) // Ref to the scrollable container

const openingTimeMinutes = computed<number>(() => timeToMinutes(props.restaurant.opening_time))
const closingTimeMinutes = computed<number>(() => timeToMinutes(props.restaurant.closing_time))
const timeSlots = computed<string[]>(() =>
  generateTimeSlots(
    props.restaurant.opening_time,
    props.restaurant.closing_time,
    props.timeSlotInterval,
  ),
)
const totalGridContentWidth = computed<number>(
  () => props.tables.length * props.zoomLevel.cellWidth,
)
const totalGridContentHeight = computed<number>(
  () => timeSlots.value.length * props.zoomLevel.cellHeight,
)
const pixelsPerMinuteVertical = computed<number>(() =>
  props.timeSlotInterval > 0 ? props.zoomLevel.cellHeight / props.timeSlotInterval : 0,
)
const getEventsForTable = (table: Table): BookingEventData[] => {
  const timeZone = props.restaurant.timezone
  const events: BookingEventData[] = [];
  (table.orders || []).forEach((order: Order) => {
    const timings = calculateEventTimings(
      order.start_time,
      order.end_time,
      timeZone,
      openingTimeMinutes.value,
    )
    if (timings.durationMinutes > 0) {
      events.push({
        uniqueId: `order-${order.id}`,
        originalId: order.id,
        type: 'order',
        status: order.status || 'Unknown',
        startMinute: timings.startMinute,
        durationMinutes: timings.durationMinutes,
        displayName: `Order ${order.id.substring(0, 4)}..`,
        start_time: order.start_time,
        end_time: order.end_time,
      })
    }
  });
  (table.reservations || []).forEach((res: Reservation) => {
    const startTime = res.seating_time
    const endTime = res.end_time
    const timings = calculateEventTimings(startTime, endTime, timeZone, openingTimeMinutes.value)
    if (timings.durationMinutes > 0 && startTime && endTime) {
      events.push({
        uniqueId: `res-${res.id}`,
        originalId: res.id,
        type: 'reservation',
        status: res.status || 'Unknown',
        startMinute: timings.startMinute,
        durationMinutes: timings.durationMinutes,
        displayName: `${res.name_for_reservation || 'Res'} (${res.num_people}p)`,
        seating_time: startTime,
        end_time: endTime,
        num_people: res.num_people,
        phone_number: res.phone_number,
        name_for_reservation: res.name_for_reservation,
      })
    }
  })
  return events
}
const currentTimePosition = computed<number | null>(() => {
  if (!props.currentTime || !props.restaurant.timezone || pixelsPerMinuteVertical.value <= 0)
    return null
  const currentDayInZone = format(props.currentTime, 'yyyy-MM-dd')
  if (currentDayInZone !== props.selectedDate) return null
  try {
    const startOfDayDate = startOfDay(props.currentTime)
    const openingTimeDate = addMinutes(startOfDayDate, openingTimeMinutes.value)
    const minutesPastOpening = differenceInMinutes(props.currentTime, openingTimeDate)
    let totalDayDurationMinutes = closingTimeMinutes.value - openingTimeMinutes.value
    if (totalDayDurationMinutes < 0) totalDayDurationMinutes += 24 * 60
    if (minutesPastOpening >= 0 && minutesPastOpening <= totalDayDurationMinutes) {
      return minutesPastOpening * pixelsPerMinuteVertical.value
    }
  } catch (e) {
    console.error('Error calculating current time position:', e)
    return null
  }
  return null
})
const tableStyle = computed<CSSProperties>(() => ({
  '--time-sidebar-width': `${TIME_SIDEBAR_WIDTH}px`,
  '--table-header-height': `${TABLE_HEADER_HEIGHT}px`,
  '--cell-width': `${props.zoomLevel.cellWidth}px`,
  '--cell-height': `${props.zoomLevel.cellHeight}px`,
}))
const timeSidebarParentStyle = computed<CSSProperties>(() => ({
  gridRow: '2 / -1',
  gridColumn: '1 / 2',
}))
const tableHeaderParentStyle = computed<CSSProperties>(() => ({
  gridRow: '1 / 2',
  gridColumn: '2 / -1',
}))
const gridBodyStyle = computed<CSSProperties>(() => ({
  gridRow: '2 / -1',
  gridColumn: '2 / -1',
  position: 'relative',
}))

const scrollToCurrentTime = () => {
  if (currentTimePosition.value !== null && gridBody.value) {
    const containerHeight = gridBody.value.offsetHeight
    const targetScrollTop = Math.max(0, currentTimePosition.value - containerHeight / 3)
    if (totalGridContentHeight.value > 0) {
      gridBody.value.scrollTop = Math.min(
        targetScrollTop,
        totalGridContentHeight.value - containerHeight,
      )
    } else {
      setTimeout(scrollToCurrentTime, 250)
    }
    gridBody.value.scrollLeft = 0
  } else if (gridBody.value) {
    gridBody.value.scrollTop = 0
    gridBody.value.scrollLeft = 0
  }
}

watch(
  () => props.selectedDate,
  () => {
    setTimeout(scrollToCurrentTime, 150)
  },
  { immediate: false },
)
onMounted(() => {
  if (gridBody.value) {
    gridBody.value.scrollTop = 0
    gridBody.value.scrollLeft = 0
  }
  setTimeout(scrollToCurrentTime, 100)
})
</script>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  color: var(--color-text);
  display: flex;
  scrollbar-width: thin;
  scrollbar-color: #a0a0a0 #f0f0f0;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #a8a8a8;
    border-radius: 4px;
    border: 1px solid #f1f1f1;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #888;
  }
  &::-webkit-scrollbar-corner {
    background: #f0f0f0;
  }
}

.table-grid {
  --time-sidebar-width: 80;
  --table-header-height: 60;
  display: grid;
  grid-template-columns: var(--time-sidebar-width) 1fr;
  grid-template-rows: var(--table-header-height) 1fr;
  height: max-content;
  min-height: 100%;
  position: relative;
}

.time-sidebar-grid-area {
  position: sticky;
  left: 0;
}

.table-header-grid-area {
  position: sticky;
  top: 0;
}
</style>
