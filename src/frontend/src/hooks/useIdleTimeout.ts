import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

const IDLE_TIMEOUT = 60 * 60 * 1000;
const CHECK_INTERVAL = 1 * 60 * 1000;

export const useIdleTimeout = () => {
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  const checkIdleTime = useCallback(() => {
    if (!isAuthenticated) return;
	// console.log('Checking idle time...');

    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0') || lastActivityRef.current;
    const idleTime = Date.now() - lastActivity;

    if (idleTime > IDLE_TIMEOUT) {
      // console.log('User idle timeout - logging out');
      logout();
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    updateActivity();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    timerRef.current = window.setInterval(checkIdleTime, CHECK_INTERVAL);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkIdleTime]);
};