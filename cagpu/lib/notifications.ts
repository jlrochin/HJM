import { formatTimeAgo } from "./utils"

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  serviceId?: string
}

// Las notificaciones reales se obtienen de la base de datos a través de la API
// Este archivo solo mantiene las interfaces de tipos
