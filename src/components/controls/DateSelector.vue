<template>
  <div class="widget-container date-selector">
    <div class="selector-label">Дата</div>
    <div class="button-group-wrapper">
      <button
        v-for="day in availableDays"
        :key="day"
        :value="day"
        @click="selectDay(day)"
        :disabled="isLoading"
        :class="{ 'is-active': day === modelValue }"
        class="capsule-button"
      >
        <span v-html="formatDateForButton(day)"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateForButton } from '@/helpers/displayUtils'

interface Props {
  modelValue: string // selectedDate
  availableDays: string[]
  isLoading: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'refresh'): void
}
const emit = defineEmits<Emits>()
const selectDay = (day: string) => {
  if (props.modelValue !== day) {
    emit('update:modelValue', day)
  }
}
</script>

<style scoped>
.widget-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.button-group-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capsule-button {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  background-color: #3a3a3a;
  color: #e0e0e0;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  line-height: 1.3;
  text-align: center;
}

.capsule-button:hover:not(:disabled) {
  background-color: #4a4a4a;
}

.capsule-button.is-active {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}

.capsule-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capsule-button :deep(.secondary-line) {
  display: block;
  font-size: 0.7rem;
  opacity: 0.85;
  margin-top: 1px;
}
</style>
