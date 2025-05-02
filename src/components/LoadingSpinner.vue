<template>
  <div class="loading-spinner" aria-label="Loading data..."></div>
</template>

<script setup lang="ts"></script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner::before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin-top: -20px;
  margin-left: -20px;
  border-radius: 50%;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-border);
  animation: spin 1s linear infinite;
}

.loading-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-mute);
  z-index: 200;
}
</style>
