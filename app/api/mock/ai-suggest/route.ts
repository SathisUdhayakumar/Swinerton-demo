import { NextRequest, NextResponse } from 'next/server';
import { suggestProjectAndCostCode } from '@/lib/matchUtils';

/**
 * Mock AI Suggestion endpoint
 * Returns project and cost code suggestions based on merchant name
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant, userId } = body as { merchant: string; userId?: string };

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Missing merchant in request body' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const suggestion = suggestProjectAndCostCode(merchant, userId);

    if (!suggestion) {
      return NextResponse.json({
        success: false,
        error: 'Could not determine suggestion',
      });
    }

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate suggestion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

