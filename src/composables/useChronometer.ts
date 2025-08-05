import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export function useChronometer() {
  const startTime = ref<number>(0);
  const elapsedTime = ref<number>(0);
  const isRunning = ref<boolean>(false);
  const error = ref<string | null>(null);
  let intervalId: number | null = null;
  let unlistenTimer: (() => void) | null = null;
  let unlistenPause: (() => void) | null = null;
  let unlistenReset: (() => void) | null = null;

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
      error.value = null;
    } catch (err) {
      error.value = 'Erreur mise à jour tray';
      console.error('Failed to update tray title:', err);
    }
  });

  // Setup event listeners for tray menu actions
  const setupEventListeners = async () => {
    try {
      unlistenTimer = await listen('timer-started', () => {
        if (!isRunning.value) {
          start();
        }
      });

      unlistenPause = await listen('timer-paused', () => {
        if (isRunning.value) {
          pause();
        }
      });

      unlistenReset = await listen('timer-reset', () => {
        pause();
        startTime.value = 0;
        elapsedTime.value = 0;
      });
    } catch (error) {
      console.error('Failed to setup event listeners:', error);
    }
  };

  // Initialize state from backend
  const initializeFromBackend = async () => {
    try {
      const [backendIsRunning, backendElapsed] = await invoke('get_timer_state') as [boolean, number];
      
      elapsedTime.value = backendElapsed;
      
      if (backendIsRunning && !isRunning.value) {
        startTime.value = Date.now() - backendElapsed;
        isRunning.value = true;
        intervalId = window.setInterval(updateTime, 100);
      }
    } catch (error) {
      console.error('Failed to initialize from backend:', error);
    }
  };

  const updateTime = () => {
    if (startTime.value) {
      elapsedTime.value = Date.now() - startTime.value;
    }
  };

  const start = async () => {
    if (!isRunning.value) {
      startTime.value = Date.now() - elapsedTime.value;
      isRunning.value = true;
      intervalId = window.setInterval(updateTime, 100);
      
      // Sync state with backend
      try {
        await invoke('sync_timer_state', { 
          isRunning: true, 
          elapsedTime: elapsedTime.value 
        });
      } catch (error) {
        console.error('Failed to sync timer state:', error);
      }
    }
  };

  const pause = async () => {
    if (isRunning.value) {
      isRunning.value = false;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      // Sync state with backend
      try {
        await invoke('sync_timer_state', { 
          isRunning: false, 
          elapsedTime: elapsedTime.value 
        });
      } catch (error) {
        console.error('Failed to sync timer state:', error);
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

  const reset = async () => {
    await pause();
    startTime.value = 0;
    elapsedTime.value = 0;
    
    // Sync state with backend
    try {
      await invoke('sync_timer_state', { 
        isRunning: false, 
        elapsedTime: 0 
      });
    } catch (error) {
      console.error('Failed to sync timer state:', error);
    }
  };

  const cleanup = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    // Clean up event listeners
    if (unlistenTimer) {
      unlistenTimer();
      unlistenTimer = null;
    }
    if (unlistenPause) {
      unlistenPause();
      unlistenPause = null;
    }
    if (unlistenReset) {
      unlistenReset();
      unlistenReset = null;
    }
  };

  // Initialize on mount
  onMounted(() => {
    setupEventListeners();
    initializeFromBackend();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    startTime,
    elapsedTime,
    isRunning,
    formattedTime,
    error,
    start,
    pause,
    toggleStartPause,
    reset,
    cleanup,
  };
}