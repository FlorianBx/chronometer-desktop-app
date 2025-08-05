import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useChronometer } from './useChronometer';

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

  it('should start the chronometer', () => {
    const { start, isRunning, elapsedTime } = useChronometer();
    
    const mockNow = 1000;
    vi.setSystemTime(mockNow);
    
    start();
    
    expect(isRunning.value).toBe(true);
    
    vi.setSystemTime(mockNow + 5000);
    vi.advanceTimersByTime(10);
    
    expect(elapsedTime.value).toBeGreaterThanOrEqual(5000);
    expect(elapsedTime.value).toBeLessThan(5020);
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

  it('should reset the chronometer', () => {
    const { start, reset, isRunning, elapsedTime, formattedTime } = useChronometer();
    
    const mockNow = 1000;
    vi.setSystemTime(mockNow);
    
    start();
    
    vi.setSystemTime(mockNow + 5000);
    vi.advanceTimersByTime(5000);
    
    reset();
    
    expect(isRunning.value).toBe(false);
    expect(elapsedTime.value).toBe(0);
    expect(formattedTime.value).toBe('00:00:00');
  });

  it('should maintain elapsed time when resuming after pause', () => {
    const { start, pause, elapsedTime } = useChronometer();
    
    const mockNow = 1000;
    vi.setSystemTime(mockNow);
    
    start();
    
    vi.setSystemTime(mockNow + 3000);
    vi.advanceTimersByTime(10);
    
    pause();
    const pausedTime = elapsedTime.value;
    expect(pausedTime).toBeGreaterThanOrEqual(3000);
    expect(pausedTime).toBeLessThan(3020);
    
    vi.setSystemTime(mockNow + 5000);
    
    start();
    
    vi.setSystemTime(mockNow + 7000);
    vi.advanceTimersByTime(10);
    
    expect(elapsedTime.value).toBeGreaterThanOrEqual(pausedTime + 2000);
    expect(elapsedTime.value).toBeLessThan(pausedTime + 2020);
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