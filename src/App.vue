<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useChronometer } from './composables/useChronometer';
import './assets/main.css';

const { 
  isRunning, 
  formattedTime, 
  error,
  toggleStartPause, 
  reset, 
  cleanup 
} = useChronometer();

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div 
    class="h-screen w-full bg-black flex flex-col items-center justify-center outline-none"
    tabindex="0"
    @keydown.space.prevent="toggleStartPause"
    @keydown.r.prevent="reset"
  >
    <div class="text-center">
      <h1 class="text-7xl md:text-8xl lg:text-9xl font-mono text-white tracking-wider mb-12">
        {{ formattedTime }}
      </h1>
      
      <div v-if="error" class="mb-4 px-4 py-2 bg-red-900 text-red-300 rounded text-sm">
        {{ error }}
      </div>
      
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
        <p>Space: Start/Pause | R: Reset</p>
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
