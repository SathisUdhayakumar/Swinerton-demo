// Event bus for SSE broadcast - handles both receipt and delivery events
type EventCallback = (data: unknown) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event types for deliveries
export const DELIVERY_EVENTS = {
  CREATED: 'delivery:created',
  UPDATED: 'delivery:updated',
  DELETED: 'delivery:deleted',
} as const;

// Event types for receipts
export const RECEIPT_EVENTS = {
  CREATED: 'receipt:created',
  UPDATED: 'receipt:updated',
  DELETED: 'receipt:deleted',
} as const;
