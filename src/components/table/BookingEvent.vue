<template>
  <div
    class="booking-event"
    :class="eventClasses"
    :style="eventStyle"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="event-content">
      <div class="event-line event-primary-info">
        <template v-if="event.type === 'order'">Заказ</template>
        <template v-else-if="event.type === 'reservation'">
          {{ event.name_for_reservation || `Бронь ${event.originalId.substring(0, 4)}..` }}
          <span v-if="event.num_people" class="people-count">({{ event.num_people }} чел)</span>
        </template>
        <template v-else>{{ event.displayName }}</template>
      </div>
      <div v-if="event.status" class="event-line event-status">{{ event.status }}</div>
      <div v-if="event.phone_number" class="event-line event-phone">{{ event.phone_number }}</div>
      <div class="event-line event-time">
        {{ formatEventDisplayTime(event.start_time) }} -
        {{ formatEventDisplayTime(event.end_time) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties, ref } from 'vue'
import { formatTime, parseZonedISO } from '@/helpers/timeUtils'
import type { LayoutBookingEventData } from '@/types/booking'

interface Props {
  event: LayoutBookingEventData
  pixelsPerMinuteVertical: number
  pixelsPerTableHorizontal: number
  tableIndex: number
  restaurantTimeZone: string
}
const props = defineProps<Props>()

const HORIZONTAL_CELL_PADDING = 2
const INTER_EVENT_PADDING = 2
const HOVER_Z_INDEX = 100
const MIN_EVENT_WIDTH = 20
const MIN_EVENT_HEIGHT = 10

const isHovering = ref<boolean>(false)

const eventStyle = computed<CSSProperties>(() => {
  const top = props.event.startMinute * props.pixelsPerMinuteVertical
  const height = props.event.durationMinutes * props.pixelsPerMinuteVertical
  const calculatedHeight = Math.max(MIN_EVENT_HEIGHT, height)

  const { layoutColumn, intersectionColumns } = props.event
  const totalAvailableWidthInCell = props.pixelsPerTableHorizontal - HORIZONTAL_CELL_PADDING * 2

  const widthPerLane =
    totalAvailableWidthInCell > 0 && intersectionColumns > 0
      ? totalAvailableWidthInCell / intersectionColumns
      : totalAvailableWidthInCell

  const originalEventWidth =
    intersectionColumns > 1 ? widthPerLane - INTER_EVENT_PADDING : widthPerLane
  const originalCalculatedWidth = Math.max(MIN_EVENT_WIDTH, originalEventWidth)

  const baseLeft = props.tableIndex * props.pixelsPerTableHorizontal
  const originalCalculatedLeft = baseLeft + HORIZONTAL_CELL_PADDING + layoutColumn * widthPerLane
  const originalZIndex = 1 + layoutColumn

  let finalWidth = originalCalculatedWidth
  let finalLeft = originalCalculatedLeft
  let finalZIndex = originalZIndex

  if (isHovering.value) {
    finalWidth = Math.max(MIN_EVENT_WIDTH, totalAvailableWidthInCell)
    finalLeft = baseLeft + HORIZONTAL_CELL_PADDING
    finalZIndex = HOVER_Z_INDEX
  }

  return {
    position: 'absolute',
    top: `${top}px`,
    left: `${finalLeft}px`,
    width: `${finalWidth}px`,
    height: `${calculatedHeight}px`,
    zIndex: finalZIndex,
  }
})
const eventClasses = computed<(string | { [key: string]: boolean })[]>(() => {
  const status: string = props.event.status?.toLowerCase() || 'unknown'
  const type: string = props.event.type || 'unknown'
  let statusClass = ''
  switch (status) {
    case 'banquet':
      statusClass = 'status-banquet'
      break
    case 'живая очередь':
      statusClass = 'status-live-queue'
      break
    default:
      break
  }
  return [type.toLowerCase(), statusClass, { 'is-hovering': isHovering.value }]
})
const formatEventDisplayTime = (isoString: string | undefined | null): string => {
  if (!isoString) return 'N/A'
  const dateInZone = parseZonedISO(isoString, props.restaurantTimeZone)
  return formatTime(dateInZone)
}
</script>

<style scoped>
.booking-event {
  position: absolute;
  border-radius: 4px;
  overflow: hidden;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    filter 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    width 0.2s ease-in-out,
    left 0.2s ease-in-out,
    z-index 0s ease 0.2s;

  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border-left: 5px solid transparent;
  background-color: rgba(100, 100, 100, 0.6);
  padding: 4px 6px 4px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 5px solid #7fd7cc;
}

.event-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  font-size: 11px;
  line-height: 1.3;
  pointer-events: none;
  overflow: hidden;
}

.event-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-primary-info {
  font-weight: 600;
}

.people-count {
  font-weight: normal;
  opacity: 0.9;
  margin-left: 4px;
}

.event-status {
  border-radius: 4px;
  padding: 2px 4px;
  width: max-content;
  background-color: rgba(255, 255, 255, 0.49);
  backdrop-filter: blur(5px);
}
.event-phone {
  opacity: 0.8;
  font-size: 10px;
}
.event-time {
  opacity: 0.9;
}
.booking-event.is-hovering {
  filter: brightness(1.15);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  opacity: 1;
  z-index: 100 !important;
}

/* --- Status Colors --- */
.order {
  background-color: rgb(76, 175, 80, 0.5);
  backdrop-filter: opacity(0.5);
}
.reservation {
  background-color: rgb(255, 112, 67, 0.5);
  backdrop-filter: opacity(0.5);
}
.status-banquet {
  background-color: rgba(156, 39, 176, 0.5);
}
.status-live-queue {
  background-color: rgba(0, 151, 253, 0.5);
}
</style>
