/**
 * Centralized Real-Time Event Engine for Zibonbaba.com
 * Manages authorized pub-sub channels, SSE streams, and Outbox persistence.
 */

import { PlatformEventType, PlatformRealtimePayload } from '@/lib/constants/events';
import { prisma } from '@/lib/prisma';

export interface SSEClient {
  id: string;
  userId: string;
  role: string;
  send: (event: string, data: any) => void;
  close: () => void;
}

class RealtimeEngine {
  private clients: Map<string, SSEClient> = new Map();

  /**
   * Register an authenticated SSE subscriber
   */
  public subscribe(client: SSEClient): () => void {
    this.clients.set(client.id, client);

    // Return cleanup function
    return () => {
      this.clients.delete(client.id);
    };
  }

  /**
   * Unregister an SSE subscriber
   */
  public unsubscribe(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Get active subscriber count
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Determine if a client is authorized to receive an event targeted at specific channels
   */
  private isClientAuthorized(client: SSEClient, channels: string[]): boolean {
    const roleUpper = client.role.toUpperCase();
    const isPlatformAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(roleUpper);

    for (const ch of channels) {
      if (ch === 'all' || ch === 'public') return true;

      // Direct user channel (e.g. "user:usr_123")
      if (ch === `user:${client.userId}`) return true;

      // Direct role channel (e.g. "role:ADMIN", "role:DELIVERY_MAN")
      if (ch === `role:${roleUpper}`) return true;

      // Platform admins receive admin and order lifecycle channels
      if (isPlatformAdmin && (ch.startsWith('order:') || ch.startsWith('store:') || ch.startsWith('delivery:') || ch.startsWith('reseller:') || ch.startsWith('hub:'))) {
        return true;
      }

      // Exact channel match (if client explicitly subscribed or matched)
      if (ch.endsWith(`:${client.userId}`)) return true;
    }

    return false;
  }

  /**
   * Publish a real-time event to authorized subscribers and write to the Outbox table
   */
  public async broadcast(payload: PlatformRealtimePayload): Promise<void> {
    const { channels, eventType, aggregateType, aggregateId, data, version } = payload;

    // 1. Deliver to all in-memory active authorized SSE clients
    let deliveredCount = 0;
    this.clients.forEach((client) => {
      try {
        if (this.isClientAuthorized(client, channels)) {
          client.send(eventType, {
            eventId: payload.eventId,
            eventType,
            aggregateType,
            aggregateId,
            version,
            timestamp: payload.timestamp || new Date().toISOString(),
            data
          });
          deliveredCount++;
        }
      } catch (err) {
        // Stale connection - clean up
        this.clients.delete(client.id);
      }
    });

    // 2. Persist to DB Outbox table asynchronously for durability & audit
    try {
      await prisma.outboxEvent.create({
        data: {
          id: payload.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          eventType: String(eventType),
          aggregateType: aggregateType || 'ORDER',
          aggregateId: aggregateId || 'system',
          payload: JSON.stringify(payload),
          processed: true,
          processedAt: new Date()
        }
      });
    } catch (dbErr) {
      // Outbox failure should not block real-time delivery
      console.error('Outbox event persistence note:', (dbErr as any)?.message);
    }
  }
}

// Global Singleton pattern across hot reloads in Next.js
const globalForRealtime = globalThis as unknown as {
  realtimeEngine: RealtimeEngine | undefined;
};

export const realtimeEngine = globalForRealtime.realtimeEngine ?? new RealtimeEngine();
if (process.env.NODE_ENV !== 'production') globalForRealtime.realtimeEngine = realtimeEngine;

export default realtimeEngine;
