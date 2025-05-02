<template>
  <div class="table-header">
    <div
      v-for="table in tables"
      :key="`table-header-${table.id}`"
      class="table-header-cell"
      :style="{ width: cellWidth + 'px' }"
      :title="`Table ${table.number} (${table.capacity}p) - ${table.zone}`"
    >
      <div class="table-header-cell-top">
        <h3>#{{ table.number }}</h3>
        {{ table.capacity }} чел
      </div>
      <span class="table-header-zone">{{ table.zone }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Table } from '@/types/booking'

interface Props {
  tables: Table[]
  cellWidth: number
}
defineProps<Props>()
</script>

<style scoped>
.table-header {
  display: flex;
  z-index: 6;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  opacity: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-header-cell {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-sizing: border-box;
  white-space: nowrap;
  text-align: center;
  padding: 0.25rem 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: normal;
}

.table-header-cell-top {
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  align-items: center;
  h3 {
    font-weight: bold;
  }
}

.table-header-zone {
  margin-top: 2px;
  font-size: 0.8em;
}
</style>
