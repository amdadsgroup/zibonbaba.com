import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { realtimeEngine } from '@/lib/services/realtimeEngine';

const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // 1. Extract Token from Authorization header, Query param, or Cookie
  const authHeader = req.headers.get('authorization');
  const url = new URL(req.url);
  const queryToken = url.searchParams.get('token');
  const cookieToken = req.cookies.get('zibonbaba_token')?.value;

  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryToken) {
    token = queryToken;
  } else if (cookieToken) {
    token = cookieToken;
  }

  let user: { id: string; role: string; email?: string; fullName?: string } = {
    id: `guest_${Math.random().toString(36).substring(2, 9)}`,
    role: 'GUEST'
  };

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && (decoded.id || decoded.userId)) {
        user = {
          id: decoded.id || decoded.userId,
          role: (decoded.role || 'CUSTOMER').toUpperCase(),
          email: decoded.email,
          fullName: decoded.fullName
        };
      }
    } catch (_) {
      // Invalid/expired token - keep as guest
    }
  }

  const clientId = `sse_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 2. Setup Server-Sent Events (SSE) Stream
  let keepAliveInterval: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (eventType: string, data: any) => {
        try {
          const payloadString = typeof data === 'string' ? data : JSON.stringify(data);
          const message = `event: ${eventType}\ndata: ${payloadString}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (_) {}
      };

      const close = () => {
        try {
          controller.close();
        } catch (_) {}
      };

      // Register with Realtime Engine
      unsubscribe = realtimeEngine.subscribe({
        id: clientId,
        userId: user.id,
        role: user.role,
        send,
        close
      });

      // Send initial handshake
      send('CONNECTED', {
        status: 'CONNECTED',
        clientId,
        userId: user.id,
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // Keepalive heartbeat every 15 seconds
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch (_) {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 15000);
    },
    cancel() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (unsubscribe) unsubscribe();
    }
  });

  // 3. Return SSE Response Headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
