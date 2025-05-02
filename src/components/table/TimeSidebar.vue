<template>
  <div class="time-sidebar">
    <div
      v-for="(slot, index) in timeSlots"
      :key="`time-${index}`"
      class="time-slot-sidebar"
      :style="{ height: cellHeight + 'px' }"
    >
      {{ slot }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  timeSlots: string[]
  cellHeight: number
}
defineProps<Props>()
</script>

<style scoped>
.time-sidebar {
  z-index: 5;
  background: inherit;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.time-slot-sidebar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  box-sizing: border-box;
  white-space: nowrap;
}

.time-slot-sidebar:last-child {
  border-bottom: none;
}
</style>
