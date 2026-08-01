import type { NotificationPayload } from '../types';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

export class ToastAdapter {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxVisibleToasts = 4;

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  notify(payload: NotificationPayload, type: ToastType = 'info', duration = 5000): void {
    const newToast: ToastMessage = {
      id: payload.id || crypto.randomUUID(),
      type,
      title: payload.title,
      message: payload.body,
      duration,
    };

    this.toasts = [newToast, ...this.toasts].slice(0, this.maxVisibleToasts);
    this.emit();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(newToast.id);
      }, duration);
    }
  }

  dismiss(toastId: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== toastId);
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }
}

export const toastAdapter = new ToastAdapter();
