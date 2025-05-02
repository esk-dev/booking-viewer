<template>
  <div class="zoom-control-float">
    <div class="zoom-label">Масштаб</div>
    <div class="zoom-buttons">
      <button @click="$emit('zoom-out')" title="Zoom Out" class="zoom-button">-</button>
      <button @click="$emit('zoom-in')" title="Zoom In" class="zoom-button">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
}
defineEmits<Emits>()
</script>

<style scoped>
.zoom-control-float {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(45, 45, 45, 0.9);
  border-radius: 8px;
  padding: 8px 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #e0e0e0;
  backdrop-filter: blur(2px);
}

.zoom-label {
  font-size: 0.75em;
  font-weight: 500;
  color: #cccccc;
}

.zoom-buttons {
  display: flex;
  gap: 6px;
}

.zoom-button {
  background-color: #4a4a4a;
  color: #e0e0e0;
  border: none;
  border-radius: 5px;
  width: 28px;
  height: 28px;
  font-size: 1.1em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  line-height: 1;
}

.zoom-button:hover {
  background-color: #5a5a5a;
}

.zoom-button:active {
  background-color: #6a6a6a;
}
</style>
