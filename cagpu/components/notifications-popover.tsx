"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatTimeAgo } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const router = useRouter();

  // Cargar notificaciones reales (y polling)
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          const notificationsList = data.notifications || [];
          setNotifications(notificationsList);
          setUnreadCount(notificationsList.filter((n: any) => !n.isRead).length);
        })
        .catch(error => {
          console.error('Error al cargar notificaciones:', error);
        });
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // cada 5 segundos para mejor responsividad

    // Escuchar evento personalizado para actualizar notificaciones inmediatamente
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('notificationsUpdate', handleNotificationUpdate);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('notificationsUpdate', handleNotificationUpdate);
      }
    }
  }, [])

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    await Promise.all(unread.map(n => fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: n.id })
    })))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const markAsRead = async (id: number) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(count => count - 1)
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(count => count - 1)
  }

  const handleOpen = (value: boolean) => {
    setOpen(value)
    if (value) {
      // Opcional: marcar todas como leídas al abrir después de un tiempo
      // setTimeout(() => { markAllAsRead() }, 3000)
    }
  }

  const NotificationsList = () => (
    <div className="max-h-[80vh] md:max-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
            <Check className="h-3.5 w-3.5 mr-1" />
            Marcar todo como leído
          </Button>
        )}
      </div>
      <ScrollArea className="h-[50vh] md:h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No hay notificaciones</div>
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative p-4 hover:bg-muted/50 transition-colors",
                  !notification.isRead && "bg-blue-50 dark:bg-blue-950/20",
                )}
              >
                <div className="flex items-start gap-3 pr-8">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      notification.isRead ? "bg-gray-300" : "bg-blue-500",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground break-words">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(new Date(notification.createdAt))}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  {!notification.isRead && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-3.5 w-3.5" />
                      <span className="sr-only">Marcar como leído</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="p-0 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full py-2 rounded-none bg-transparent hover:bg-muted text-center text-xs font-medium"
          onClick={() => router.push('/notificaciones')}
        >
          Ver todas las notificaciones
        </Button>
      </div>
    </div>
  )

  // Use Popover on desktop and Drawer on mobile
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-foreground/60" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {unreadCount}
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Notificaciones</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0" align="end">
          <NotificationsList />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-foreground/60" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notificaciones</DrawerTitle>
          <DrawerDescription>Gestionar notificaciones del sistema</DrawerDescription>
        </DrawerHeader>
        <NotificationsList />
      </DrawerContent>
    </Drawer>
  )
}
