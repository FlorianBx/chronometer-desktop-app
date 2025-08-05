import { ref, computed, watch } from 'vue';
import { invoke } from '@tauri-apps/api/core';

export function useChronometer() {
  const startTime = ref<number>(0);
  const elapsedTime = ref<number>(0);
  const isRunning = ref<boolean>(false);
  let intervalId: number | null = null;

  const formattedTime = computed(() => {
    const totalSeconds = Math.floor(elapsedTime.value / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // Update tray title when formatted time changes
  watch(formattedTime, async (newTime) => {
    try {
      await invoke('update_tray_title', { title: newTime });
    } catch (error) {
      console.error('Failed to update tray title:', error);
    }
  });

  const updateTime = () => {
    if (startTime.value) {
      elapsedTime.value = Date.now() - startTime.value;
    }
  };

  const start = () => {
    if (!isRunning.value) {
      startTime.value = Date.now() - elapsedTime.value;
      isRunning.value = true;
      intervalId = window.setInterval(updateTime, 10);
    }
  };

  const pause = () => {
    if (isRunning.value) {
      isRunning.value = false;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };

  const toggleStartPause = () => {
    if (isRunning.value) {
      pause();
    } else {
      start();
    }
  };

  const reset = () => {
    pause();
    startTime.value = 0;
    elapsedTime.value = 0;
  };

  const cleanup = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return {
    startTime,
    elapsedTime,
    isRunning,
    formattedTime,
    start,
    pause,
    toggleStartPause,
    reset,
    cleanup,
  };
}