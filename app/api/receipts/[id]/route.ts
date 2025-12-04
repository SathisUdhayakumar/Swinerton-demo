import { NextRequest, NextResponse } from 'next/server';
import { deleteReceipt, getReceiptById } from '@/lib/mockStorage';
import { eventBus, RECEIPT_EVENTS } from '@/lib/eventBus';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const receipt = getReceiptById(id);
    if (!receipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    const deleted = deleteReceipt(id);
    
    if (deleted) {
      // Emit SSE event for real-time update
      eventBus.emit(RECEIPT_EVENTS.DELETED, {
        type: 'deleted',
        receipt,
      });

      return NextResponse.json({
        success: true,
        message: 'Receipt deleted successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete receipt' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

