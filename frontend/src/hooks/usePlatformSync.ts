'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { PlatformEventType } from '@/lib/constants/events';

export interface RealtimeSyncEvent {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  version?: number;
  timestamp: string;
  data: any;
}

export function usePlatformSync() {
  const { isLoggedIn, token, logout, userEmail } = useStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeSyncEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const currentToken = token || localStorage.getItem('zibonbaba_token');
    const url = currentToken
      ? `/api/realtime/events?token=${encodeURIComponent(currentToken)}`
      : '/api/realtime/events';

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;

        // Auto-reconnect after 4 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 4000);
      };

      // 1. Handshake
      es.addEventListener('CONNECTED', (e: MessageEvent) => {
        setIsConnected(true);
      });

      // 2. Universal Order Status Sync
      es.addEventListener(PlatformEventType.ORDER_STATUS_UPDATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);

          // Dispatch window event for listening React pages
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:order-sync', { detail: payload }));

          // Refresh store orders
          try {
            useStore.getState().fetchOrders();
            useStore.getState().fetchNotifications();
          } catch (_) {}
        } catch (_) {}
      });

      // 3. Product & Inventory Sync
      es.addEventListener(PlatformEventType.PRODUCT_UPDATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:product-sync', { detail: payload }));
          try {
            useStore.getState().fetchProducts();
          } catch (_) {}
        } catch (_) {}
      });

      es.addEventListener(PlatformEventType.PRODUCT_STATUS_UPDATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:product-sync', { detail: payload }));
          try {
            useStore.getState().fetchProducts();
          } catch (_) {}
        } catch (_) {}
      });

      // 4. Account Status & Session Invalidation Sync
      es.addEventListener(PlatformEventType.USER_STATUS_UPDATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);

          const storedUserStr = localStorage.getItem('zibonbaba_user');
          let currentUserId = '';
          if (storedUserStr) {
            try {
              currentUserId = JSON.parse(storedUserStr).id;
            } catch (_) {}
          }

          if (payload.data?.userId === currentUserId && payload.data?.isSuspended) {
            // Immediate Session Invalidation
            alert('Your account status has been updated by administrators. You will be signed out.');
            logout();
            window.location.href = '/login';
          }
        } catch (_) {}
      });

      es.addEventListener(PlatformEventType.SESSION_REVOKED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          const storedUserStr = localStorage.getItem('zibonbaba_user');
          let currentUserId = '';
          if (storedUserStr) {
            try {
              currentUserId = JSON.parse(storedUserStr).id;
            } catch (_) {}
          }

          if (payload.data?.userId === currentUserId) {
            logout();
            window.location.href = '/login';
          }
        } catch (_) {}
      });

      // 5. Delivery Ecosystem Sync (Availability, Profile, Assignments)
      es.addEventListener(PlatformEventType.DELIVERY_AVAILABILITY_CHANGED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:delivery-sync', { detail: payload }));
        } catch (_) {}
      });

      es.addEventListener(PlatformEventType.DELIVERY_PROFILE_UPDATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:delivery-sync', { detail: payload }));
        } catch (_) {}
      });

      es.addEventListener(PlatformEventType.DELIVERY_STATUS_CHANGED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:sync', { detail: payload }));
          window.dispatchEvent(new CustomEvent('zibonbaba:delivery-sync', { detail: payload }));
        } catch (_) {}
      });

      // 6. Notifications
      es.addEventListener(PlatformEventType.NOTIFICATION_CREATED, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as RealtimeSyncEvent;
          setLastEvent(payload);
          window.dispatchEvent(new CustomEvent('zibonbaba:notification-sync', { detail: payload }));
          try {
            useStore.getState().fetchNotifications();
          } catch (_) {}
        } catch (_) {}
      });

    } catch (err) {
      console.error('SSE Connection initiation error:', err);
    }
  }, [token, logout]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastEvent
  };
}
