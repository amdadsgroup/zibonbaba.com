import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });

  // Clear session authentication cookies
  response.cookies.set('zibonbaba_token', '', { path: '/', httpOnly: true, expires: new Date(0) });
  response.cookies.set('zibonbaba_role', '', { path: '/', expires: new Date(0) });
  response.cookies.set('zibonbaba_user', '', { path: '/', expires: new Date(0) });

  return response;
}
