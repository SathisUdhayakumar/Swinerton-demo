import { NextResponse } from 'next/server';
import { getPOs } from '@/lib/mockStorage';

export async function GET() {
  const pos = getPOs();
  return NextResponse.json({
    success: true,
    data: pos,
    count: pos.length,
  });
}


