import { NextRequest, NextResponse } from 'next/server';
import { ParsedBOL } from '@/types';
import { matchBOLToPO } from '@/lib/matchUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBOL: ParsedBOL = body.parsedBOL;

    if (!parsedBOL) {
      return NextResponse.json(
        { success: false, error: 'Missing parsedBOL in request body' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const matchResult = matchBOLToPO(parsedBOL);

    if (!matchResult) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: 'No matching PO found',
        suggestions: [
          'Verify vendor name is correct',
          'Check if PO number is included on BOL',
          'Manually select PO from list',
        ],
      });
    }

    return NextResponse.json({
      success: true,
      matched: true,
      matchResult: {
        po: matchResult.po,
        matchScore: matchResult.matchScore,
        matchedBy: matchResult.matchedBy,
        lineMatches: matchResult.lineMatches,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to match BOL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}


