import { NextRequest, NextResponse } from 'next/server';
import { ReceiptActionPayload, ReceiptStatus } from '@/types';
import { 
  getReceiptById, 
  updateReceipt, 
  getCurrentUser,
  generateCMiCReceiptId,
  addAuditLog
} from '@/lib/mockStorage';
import { eventBus, RECEIPT_EVENTS } from '@/lib/eventBus';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ReceiptActionPayload = await request.json();
    const { action, notes } = body;

    const receipt = getReceiptById(id);
    if (!receipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    const user = getCurrentUser();
    let newStatus: ReceiptStatus = receipt.status;
    let approvedBy = receipt.approvedBy;
    let cmicLineId = receipt.cmicLineId;
    let updatedNotes = receipt.notes;

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        approvedBy = user.name;
        // Simulate CMiC push on approval
        if (!cmicLineId) {
          cmicLineId = generateCMiCReceiptId();
        }
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'reconcile':
        newStatus = 'logged';
        approvedBy = user.name;
        if (!cmicLineId) {
          cmicLineId = generateCMiCReceiptId();
        }
        break;
      case 'needs_review':
        newStatus = 'needs_review';
        updatedNotes = notes || 'Flagged for manual review';
        break;
      case 'request_return':
        newStatus = 'rejected';
        updatedNotes = notes || 'Return requested';
        break;
    }

    const updatedReceipt = updateReceipt(id, {
      status: newStatus,
      notes: updatedNotes,
      approvedBy,
      cmicLineId,
    });

    if (!updatedReceipt) {
      return NextResponse.json(
        { success: false, error: 'Failed to update receipt' },
        { status: 500 }
      );
    }

    // Add audit log
    addAuditLog({
      entityType: 'receipt',
      entityId: id,
      action,
      performedBy: user.name,
      details: { previousStatus: receipt.status, newStatus, notes },
    });

    // Emit SSE event
    eventBus.emit(RECEIPT_EVENTS.UPDATED, {
      type: 'updated',
      receipt: updatedReceipt,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedReceipt,
      action,
      message: `Receipt ${action} successfully`,
      cmicLineId: updatedReceipt.cmicLineId,
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

