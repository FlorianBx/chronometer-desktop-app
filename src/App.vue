<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useChronometer } from './composables/useChronometer';
import './assets/main.css';

const { 
  isRunning, 
  formattedTime, 
  toggleStartPause, 
  reset, 
  cleanup 
} = useChronometer();

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ') {
    event.preventDefault();
    toggleStartPause();
  } else if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    reset();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  cleanup();
});
</script>

<template>
  <div class="h-screen w-full bg-black flex flex-col items-center justify-center">
    <div class="text-center">
      <h1 class="text-7xl md:text-8xl lg:text-9xl font-mono text-white tracking-wider mb-12">
        {{ formattedTime }}
      </h1>
      
      <div class="flex gap-4 justify-center">
        <button
          @click="toggleStartPause"
          class="px-8 py-3 min-w-48 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          :class="isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
        >
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>
        
        <button
          @click="reset"
          class="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Reset
        </button>
      </div>
      
      <div class="mt-8 text-gray-500 text-sm">
        <p>Espace : Start/Pause | R : Reset</p>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

h1 {
  font-family: 'Share Tech Mono', monospace;
}
</style>
