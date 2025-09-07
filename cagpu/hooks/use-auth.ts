'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

interface User {
  id: number
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  department?: string
  serviceId?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        
        if (userData.success && userData.user) {
          setUser(userData.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role])
  const isServiceUser = useMemo(() => user?.role === 'service_user', [user?.role])
  const isDeveloper = useMemo(() => user?.role === 'developer', [user?.role])

  return { 
    user, 
    loading, 
    isAdmin, 
    isServiceUser,
    isDeveloper,
    refreshAuth: checkAuth 
  }
}
