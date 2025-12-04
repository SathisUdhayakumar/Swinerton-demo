import { NextRequest, NextResponse } from 'next/server';
import { DeliveryActionPayload, DeliveryStatus } from '@/types';
import { 
  getDeliveryById, 
  updateDelivery, 
  getCurrentUser,
  generateCMiCDeliveryId,
  addAuditLog
} from '@/lib/mockStorage';
import { eventBus, DELIVERY_EVENTS } from '@/lib/eventBus';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: DeliveryActionPayload = await request.json();
    const { action, notes, lineIds } = body;

    const delivery = getDeliveryById(id);
    if (!delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      );
    }

    const user = getCurrentUser();
    let newStatus: DeliveryStatus = delivery.status;
    let updatedNotes = delivery.notes;
    let approvedBy = delivery.approvedBy;
    let cmicDeliveryId = delivery.cmicDeliveryId;

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        approvedBy = user.name;
        // Simulate CMiC push on approval
        if (!cmicDeliveryId) {
          cmicDeliveryId = generateCMiCDeliveryId();
        }
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'reconcile':
        newStatus = 'verified';
        approvedBy = user.name;
        if (!cmicDeliveryId) {
          cmicDeliveryId = generateCMiCDeliveryId();
        }
        break;
      case 'flag_damage':
        newStatus = 'needs_review';
        updatedNotes = notes || 'Damage flagged - requires inspection';
        break;
      case 'require_pm_approval':
        newStatus = 'pending_approval';
        updatedNotes = notes || 'Escalated to PM for approval';
        break;
      case 'request_return':
        newStatus = 'rejected';
        updatedNotes = notes || 'Return requested';
        break;
    }

    // Update line flags if provided
    let updatedLines = delivery.lines;
    if (lineIds && lineIds.length > 0 && action === 'flag_damage') {
      updatedLines = delivery.lines.map((line) => {
        if (lineIds.includes(line.id)) {
          return {
            ...line,
            flagged: true,
            flagReason: notes || 'Damage reported',
          };
        }
        return line;
      });
    }

    const updatedDelivery = updateDelivery(id, {
      status: newStatus,
      notes: updatedNotes,
      approvedBy,
      lines: updatedLines,
      cmicDeliveryId,
    });

    if (!updatedDelivery) {
      return NextResponse.json(
        { success: false, error: 'Failed to update delivery' },
        { status: 500 }
      );
    }

    // Add audit log
    addAuditLog({
      entityType: 'delivery',
      entityId: id,
      action,
      performedBy: user.name,
      details: { previousStatus: delivery.status, newStatus, notes, cmicDeliveryId },
    });

    // Emit SSE event
    eventBus.emit(DELIVERY_EVENTS.UPDATED, {
      type: 'updated',
      delivery: updatedDelivery,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedDelivery,
      action,
      message: `Delivery ${action} successfully`,
      cmicDeliveryId: updatedDelivery.cmicDeliveryId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
