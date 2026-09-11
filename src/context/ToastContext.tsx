import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toastOrTitle: Omit<ToastItem, 'id'> | string, type?: ToastType) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastOrTitle: Omit<ToastItem, 'id'> | string, type?: ToastType) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const toastItem: ToastItem = typeof toastOrTitle === 'string'
        ? { id, type: type || 'info', title: toastOrTitle, duration: 3500 }
        : { id, ...toastOrTitle, duration: toastOrTitle.duration ?? 3500 };

      setToasts((prev) => [...prev, toastItem]);

      if (toastItem.duration && toastItem.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toastItem.duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]),
    error: useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]),
    info: useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]),
    warning: useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const noopId = 'fallback-toast';
    return {
      toasts: [],
      addToast: () => noopId,
      removeToast: () => {},
      toast: {
        success: () => noopId,
        error: () => noopId,
        info: () => noopId,
        warning: () => noopId,
      },
    };
  }
  return context;
}
