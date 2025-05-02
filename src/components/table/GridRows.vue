<template>
  <div class="grid-content-wrapper" :style="gridContentWrapperStyle">
    <div
      v-for="(slot, timeIndex) in timeSlots"
      :key="`row-${timeIndex}`"
      class="grid-row"
      :style="{ height: cellHeight + 'px' }"
    >
      <div
        v-for="(table, tableIndex) in tables"
        :key="`cell-${timeIndex}-${tableIndex}`"
        class="grid-cell"
        :style="{ width: cellWidth + 'px' }"
      ></div>
    </div>

    <template v-for="(table, tableIndex) in tables" :key="`events-for-${table.id}`">
      <BookingEvent
        v-for="event in layoutedEvents[table.id] || []"
        :key="event.uniqueId"
        :event="event"
        :is-intersect="event.isIntersect"
        :intersection-columns="event.intersectionColumns"
        :pixels-per-minute-vertical="pixelsPerMinuteVertical"
        :pixels-per-table-horizontal="cellWidth"
        :table-index="tableIndex"
        :restaurant-time-zone="restaurantTimeZone"
        :layout-column="event.layoutColumn"
        :layout-total-columns="event.layoutTotalColumns"
      />
    </template>

    <div
      v-if="currentTimePosition !== null"
      class="current-time-line"
      :style="{ top: currentTimePosition + 'px' }"
      title="Current Time"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { BookingEventData, LayoutBookingEventData, Table } from '@/types/booking.ts'
import { computed, type CSSProperties } from 'vue'
import BookingEvent from './BookingEvent.vue'

interface Props {
  tables: Table[]
  timeSlots: string[]
  cellWidth: number
  cellHeight: number
  pixelsPerMinuteVertical: number
  restaurantTimeZone: string
  getEventsForTable: (table: Table) => BookingEventData[]
  currentTimePosition: number | null
  totalGridContentWidth: number
  totalGridContentHeight: number
}

const props = defineProps<Props>()

const START_TIME_PROXIMITY_THRESHOLD = 30

const doEventsIntersect = (eventA: BookingEventData, eventB: BookingEventData): boolean => {
  if (eventA.uniqueId === eventB.uniqueId) {
    return false
  }

  const A_start = eventA.startMinute
  const A_end = A_start + eventA.durationMinutes
  const B_start = eventB.startMinute
  const B_end = B_start + eventB.durationMinutes

  const timeOverlap = A_start < B_end && A_end > B_start
  const proximityOverlap = Math.abs(A_start - B_start) <= START_TIME_PROXIMITY_THRESHOLD

  return timeOverlap || proximityOverlap
}

const layoutedEvents = computed(() => {
  const result: { [tableId: string]: LayoutBookingEventData[] } = {}

  props.tables.forEach((table) => {
    const events = props.getEventsForTable(table).sort((a, b) => a.startMinute - b.startMinute)
    if (!events.length) {
      result[table.id] = []
      return
    }

    // --- Assign layoutColumn (visual lane) based on time overlap AND proximity ---
    const eventsWithLayoutColumn: Array<
      Omit<LayoutBookingEventData, 'isIntersect' | 'intersectionColumns'>
    > = []
    const columns: { endMinute: number; startMinute: number }[] = []

    events.forEach((event) => {
      let assignedColumn = -1

      for (let i = 0; i < columns.length; i++) {
        const lastEventInColumn = columns[i]
        const startsAfterLastEnds = event.startMinute >= lastEventInColumn.endMinute
        const isStartTimeCloseToLastInColumn =
          Math.abs(event.startMinute - lastEventInColumn.startMinute) <=
          START_TIME_PROXIMITY_THRESHOLD

        if (startsAfterLastEnds && !isStartTimeCloseToLastInColumn) {
          assignedColumn = i
          columns[i] = {
            endMinute: event.startMinute + event.durationMinutes,
            startMinute: event.startMinute,
          }
          break
        }
      }

      if (assignedColumn === -1) {
        assignedColumn = columns.length
        columns.push({
          endMinute: event.startMinute + event.durationMinutes,
          startMinute: event.startMinute,
        })
      }

      eventsWithLayoutColumn.push({
        ...event,
        layoutColumn: assignedColumn,
        layoutTotalColumns: 1,
      })
    })

    // --- Calculate intersection status and required columns for intersection groups ---
    const finalProcessedEvents: LayoutBookingEventData[] = eventsWithLayoutColumn.map(
      (currentEvent, _index, allEventsInTable) => {
        const intersectingOthers = allEventsInTable.filter(
          (otherEvent) =>
            otherEvent.uniqueId !== currentEvent.uniqueId &&
            doEventsIntersect(currentEvent, otherEvent),
        )

        const isIntersect = intersectingOthers.length > 0

        let intersectionColumnCount = 1
        if (isIntersect) {
          const intersectingGroup = [currentEvent, ...intersectingOthers]
          const maxColumnIndexInGroup = intersectingGroup.reduce(
            (maxCol, ev) => Math.max(maxCol, ev.layoutColumn),
            -1,
          )
          intersectionColumnCount = maxColumnIndexInGroup + 1
        }
        return {
          ...currentEvent,
          isIntersect: isIntersect,
          intersectionColumns: Math.max(1, intersectionColumnCount),
        }
      },
    )
    finalProcessedEvents.forEach((currentEvent) => {
      currentEvent.layoutTotalColumns = columns.length
    })
    result[table.id] = finalProcessedEvents
  })

  return result
})

const gridContentWrapperStyle = computed<CSSProperties>(() => ({
  width: `${props.totalGridContentWidth}px`,
  height: `${props.totalGridContentHeight}px`,
  position: 'relative',
}))
</script>

<style scoped>
.grid-content-wrapper {
  position: relative;
  background: inherit;
}

.grid-row {
  display: flex;
  position: relative;
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
}
.grid-row:last-child {
  border-bottom: none;
}

.grid-cell {
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  box-sizing: border-box;
  height: 100%;
}
.grid-cell:last-child {
  border-right: none;
}
.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgba(255, 0, 0, 0.7);
  z-index: 5;
  pointer-events: none;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}
</style>
