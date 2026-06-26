import { NextResponse } from 'next/server';
import { SESSION_COOKIE, cookieOptionsFor } from '@/lib/session';

export async function POST(request: Request) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, '', cookieOptionsFor(request, 0));
    return res;
}
