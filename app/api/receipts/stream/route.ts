import { eventBus, RECEIPT_EVENTS } from '@/lib/eventBus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for receipt events
 * Emits receipt:created and receipt:updated events
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMsg = `event: connected\ndata: ${JSON.stringify({ 
        message: 'Connected to receipt stream',
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Handler for receipt events
      const handleReceiptEvent = (data: unknown) => {
        try {
          const sseMessage = `event: receipt\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Subscribe to receipt events
      eventBus.on(RECEIPT_EVENTS.CREATED, handleReceiptEvent);
      eventBus.on(RECEIPT_EVENTS.UPDATED, handleReceiptEvent);
      eventBus.on(RECEIPT_EVENTS.DELETED, handleReceiptEvent);

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `:heartbeat ${Date.now()}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        eventBus.off(RECEIPT_EVENTS.CREATED, handleReceiptEvent);
        eventBus.off(RECEIPT_EVENTS.UPDATED, handleReceiptEvent);
        eventBus.off(RECEIPT_EVENTS.DELETED, handleReceiptEvent);
      };

      (controller as unknown as { cleanup?: () => void }).cleanup = cleanup;
    },
    cancel(controller) {
      const ctrl = controller as unknown as { cleanup?: () => void };
      if (ctrl.cleanup) {
        ctrl.cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

