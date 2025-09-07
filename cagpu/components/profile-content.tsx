"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Save, User, Shield, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  department?: string
  phone?: string
  fullName: string
  position: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function ProfileContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Cargar perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
          setFormData({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            department: data.user.department || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar el perfil del usuario.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        toast({
          title: "Error",
          description: "Error al cargar el perfil del usuario.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!userData) return

    // Validar que al menos un campo tenga cambios
    const hasChanges = formData.firstName !== userData.firstName ||
      formData.lastName !== userData.lastName ||
      formData.email !== userData.email ||
      formData.phone !== userData.phone ||
      formData.department !== userData.department ||
      formData.newPassword

    if (!hasChanges) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios para guardar.",
        variant: "destructive",
      })
      return
    }

    // Validar contraseñas si se está cambiando
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Error",
          description: "La contraseña actual es requerida para cambiar la contraseña.",
          variant: "destructive",
        })
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden.",
          variant: "destructive",
        })
        return
      }

      if (formData.newPassword.length < 12) {
        toast({
          title: "Error",
          description: "La nueva contraseña debe tener al menos 12 caracteres.",
          variant: "destructive",
        })
        return
      }

      // Validar que la nueva contraseña sea diferente a la actual
      if (formData.newPassword === formData.currentPassword) {
        toast({
          title: "Error",
          description: "La nueva contraseña debe ser diferente a la actual.",
          variant: "destructive",
        })
        return
      }

      // Validar complejidad de la contraseña
      const hasUpperCase = /[A-Z]/.test(formData.newPassword)
      const hasLowerCase = /[a-z]/.test(formData.newPassword)
      const hasNumbers = /\d/.test(formData.newPassword)
      const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.newPassword)

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols) {
        toast({
          title: "Error",
          description: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo.",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)

        // Mostrar mensaje específico si se cambió la contraseña
        if (formData.newPassword) {
          toast({
            title: "Contraseña actualizada",
            description: "Tu contraseña ha sido actualizada correctamente. Por favor, cierra sesión y vuelve a iniciar sesión.",
          })
        } else {
          toast({
            title: "Perfil actualizado",
            description: "Tu información de perfil ha sido actualizada correctamente.",
          })
        }

        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "No se pudo actualizar el perfil.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast({
        title: "Error",
        description: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Perfil</h1>
          <p className="text-gray-600 mt-2">Cargando información del usuario...</p>
        </div>
        <div className="animate-pulse space-y-8">
          <Card className="h-64 bg-gray-100" />
          <Card className="h-32 bg-gray-100" />
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Perfil</h1>
          <p className="text-gray-600 mt-2">No se pudo cargar la información del usuario.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración de seguridad.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Información Personal */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-gray-700" />
              <div>
                <CardTitle className="text-xl text-gray-900">Información Personal</CardTitle>
                <CardDescription className="text-gray-600">Actualiza tu información personal y de contacto.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                      placeholder="Nombre"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                    placeholder="Apellido"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 font-medium">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                  placeholder="Departamento"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Cargo actual</Label>
                <Input
                  value={userData.position}
                  className="border-gray-200 bg-gray-50 text-gray-600"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Nombre de usuario</Label>
                <Input
                  value={userData.username}
                  className="border-gray-200 bg-gray-50 text-gray-600"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-gray-700" />
              <div>
                <CardTitle className="text-xl text-gray-900">Seguridad</CardTitle>
                <CardDescription className="text-gray-600">Gestiona tu contraseña y la seguridad de tu cuenta.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-700 font-medium">Contraseña actual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="current-password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                    placeholder="Contraseña actual"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-700 font-medium">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="new-password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                    placeholder="Mínimo 12 caracteres"
                  />
                </div>
                {formData.newPassword && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-gray-600">La contraseña debe cumplir:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-2 ${formData.newPassword.length >= 12 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 12 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Mínimo 12 caracteres
                      </div>
                      <div className={`flex items-center gap-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Una mayúscula
                      </div>
                      <div className={`flex items-center gap-2 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Una minúscula
                      </div>
                      <div className={`flex items-center gap-2 ${/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Un número
                      </div>
                      <div className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Un símbolo
                      </div>
                      <div className={`flex items-center gap-2 ${formData.newPassword !== formData.currentPassword ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${formData.newPassword !== formData.currentPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Diferente a la actual
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700 font-medium">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de guardar unificado */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2 bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 text-base"
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {!isLoading && <Save className="h-5 w-5" />}
            Guardar todos los cambios
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
