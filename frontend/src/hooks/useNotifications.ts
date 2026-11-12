'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface NotificationItem {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  createdAt: string
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // 1. Fetch initial unread notifications via API route or Supabase client
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .eq('isRead', false)
        .order('createdAt', { ascending: false })

      if (data) {
        setNotifications(data as NotificationItem[])
        setUnreadCount(data.length)
      }
    }

    fetchNotifications()

    // 2. Subscribe to real-time Postgres INSERTs for this user's notifications
    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { notifications, unreadCount }
}
