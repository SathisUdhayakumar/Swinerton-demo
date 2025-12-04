import { eventBus, DELIVERY_EVENTS } from '@/lib/eventBus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for delivery events
 * Emits delivery:created and delivery:updated events
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMsg = `event: connected\ndata: ${JSON.stringify({ 
        message: 'Connected to delivery stream',
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Handler for delivery events
      const handleDeliveryEvent = (data: unknown) => {
        try {
          const sseMessage = `event: delivery\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // Subscribe to delivery events
      eventBus.on(DELIVERY_EVENTS.CREATED, handleDeliveryEvent);
      eventBus.on(DELIVERY_EVENTS.UPDATED, handleDeliveryEvent);
      eventBus.on(DELIVERY_EVENTS.DELETED, handleDeliveryEvent);

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
        eventBus.off(DELIVERY_EVENTS.CREATED, handleDeliveryEvent);
        eventBus.off(DELIVERY_EVENTS.UPDATED, handleDeliveryEvent);
        eventBus.off(DELIVERY_EVENTS.DELETED, handleDeliveryEvent);
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
