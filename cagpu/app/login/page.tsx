'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { AnimatedBackground } from "../../components/animated-background"
import React from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  React.useEffect(() => {
    setShow(true)
    // Ocultar scroll del body solo en login
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Error en el inicio de sesión')
        toast.error(data.error || 'Error en el inicio de sesión')
        setIsLoading(false)
        return
      }

      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('role', data.user.role)
      localStorage.setItem('username', data.user.username)
      // Notificar a otros componentes
      window.dispatchEvent(new Event('userChanged'))

      toast.success("¡Inicio de sesión exitoso!")
      router.push('/dashboard')
    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Toggle de tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {show && (
        <>
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md"
            >
              <Card className="backdrop-blur-md bg-white/30 dark:bg-zinc-900/30 border-white/20 dark:border-zinc-700/30 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <img
                      src="/cagpu_logo_new.png"
                      alt="CAGPU Logo"
                      className="h-32 w-auto max-w-72"
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    CAGPU
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Catálogo de Atención - Iniciar Sesión
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="username" className="text-gray-700 dark:text-gray-200">Usuario</Label>
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder="Ingresa tu usuario"
                          required
                          className="bg-white/40 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Contraseña</Label>
                        <Input 
                          id="password" 
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          required
                          className="bg-white/40 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    {loginError && (
                      <div className="mt-2 text-center text-red-600 dark:text-red-400 text-sm font-semibold">
                        {loginError}
                      </div>
                    )}
                    <div className="mt-6">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700"
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
      <Toaster />
    </div>
  )
} 