import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { WELCOME_POPUP_KEY } from "@/components/layout/WelcomePopup";

export const IDLE_TIMEOUT = 8 * 60 * 60 * 1000;
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

    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    
    const validLastActivity = lastActivity > 0 ? lastActivity : lastActivityRef.current;
    
    const now = Date.now();
    const idleTime = now - validLastActivity;

    if (idleTime > IDLE_TIMEOUT) {
      console.log('Session expired upon check - logging out');
      
      localStorage.removeItem(WELCOME_POPUP_KEY); 
      logout();
      
      // if (!window.location.pathname.startsWith("/auth")) {
      //     window.location.href = "/auth";
      // }
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    checkIdleTime();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            checkIdleTime();
        }
    };

    const handleFocus = () => {
        checkIdleTime();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    timerRef.current = window.setInterval(checkIdleTime, CHECK_INTERVAL);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkIdleTime]);
};