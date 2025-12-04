import { NextRequest, NextResponse } from 'next/server';
import { getDeliveryById, deleteDelivery } from '@/lib/mockStorage';
import { eventBus, DELIVERY_EVENTS } from '@/lib/eventBus';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/deliveries/[id] - Get a single delivery by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const delivery = getDeliveryById(id);

  if (!delivery) {
    return NextResponse.json(
      { success: false, error: 'Delivery not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: delivery,
  });
}

/**
 * DELETE /api/deliveries/[id] - Delete a delivery by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const delivery = getDeliveryById(id);

  if (!delivery) {
    return NextResponse.json(
      { success: false, error: 'Delivery not found' },
      { status: 404 }
    );
  }

  const deleted = deleteDelivery(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete delivery' },
      { status: 500 }
    );
  }

  // Emit SSE event for real-time update
  eventBus.emit(DELIVERY_EVENTS.DELETED, {
    type: 'deleted',
    delivery,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: 'Delivery deleted successfully',
  });
}

