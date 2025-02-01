import * as React from 'react'
import {
  Toast,
  ToastProvider,
  ToastViewport
} from '@/components/ui/toast'
import { useNotificationStore } from '@/store/notification'

export function NotificationProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <ToastProvider>
      {children}
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={notification.type === 'error' ? 'destructive' : 'default'}
          title={notification.title}
        //   description={notification.message}
          onOpenChange={(open) => {
            if (!open) removeNotification(notification.id)
          }}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
