import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useChronometer } from './useChronometer';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {})
}));

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: vi.fn(),
    onUnmounted: vi.fn()
  };
});

describe('useChronometer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { isRunning, elapsedTime, formattedTime } = useChronometer();
    
    expect(isRunning.value).toBe(false);
    expect(elapsedTime.value).toBe(0);
    expect(formattedTime.value).toBe('00:00:00');
  });

  it('should format time correctly', () => {
    const { elapsedTime, formattedTime } = useChronometer();
    
    elapsedTime.value = 0;
    expect(formattedTime.value).toBe('00:00:00');
    
    elapsedTime.value = 1000;
    expect(formattedTime.value).toBe('00:00:01');
    
    elapsedTime.value = 61000;
    expect(formattedTime.value).toBe('00:01:01');
    
    elapsedTime.value = 3661000;
    expect(formattedTime.value).toBe('01:01:01');
  });


  it('should pause the chronometer', () => {
    const { start, pause, isRunning, elapsedTime } = useChronometer();
    
    const mockNow = 1000;
    vi.setSystemTime(mockNow);
    
    start();
    
    vi.setSystemTime(mockNow + 3000);
    vi.advanceTimersByTime(3000);
    
    pause();
    
    expect(isRunning.value).toBe(false);
    const pausedTime = elapsedTime.value;
    
    vi.setSystemTime(mockNow + 5000);
    vi.advanceTimersByTime(2000);
    
    expect(elapsedTime.value).toBe(pausedTime);
  });

  it('should toggle between start and pause', () => {
    const { toggleStartPause, isRunning } = useChronometer();
    
    expect(isRunning.value).toBe(false);
    
    toggleStartPause();
    expect(isRunning.value).toBe(true);
    
    toggleStartPause();
    expect(isRunning.value).toBe(false);
  });



  it('should not start multiple intervals when start is called multiple times', () => {
    const { start, isRunning } = useChronometer();
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    
    start();
    start();
    start();
    
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(isRunning.value).toBe(true);
  });

  it('should cleanup interval on cleanup', () => {
    const { start, cleanup } = useChronometer();
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    
    start();
    cleanup();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});