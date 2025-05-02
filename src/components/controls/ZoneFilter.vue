<template>
  <div class="widget-container zone-filter" v-if="allZones.length > 0">
    <div class="selector-label">Отображаемые зоны</div>
    <div class="button-group-wrapper">
      <button
        v-for="zone in allZones"
        :key="zone"
        :value="zone"
        @click="toggleZone(zone)"
        :class="{ 'is-active': modelValue.includes(zone) }"
        class="capsule-button"
      >
        {{ zone }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string[]
  allZones: string[]
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}
const emit = defineEmits<Emits>()

const toggleZone = (zone: string) => {
  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(zone)

  if (index > -1) {
    currentSelection.splice(index, 1)
  } else {
    currentSelection.push(zone)
  }
  emit('update:modelValue', currentSelection)
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
</style>
