import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/api/generate',
};

export async function proxy(req: NextRequest) {
  return NextResponse.next();
}
