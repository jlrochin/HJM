"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe, Moon, Save, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    language: "es",
    dateFormat: "dd/mm/yyyy",
    autoSave: true,
    compactMode: false,
    highContrast: false,
    notifications: {
      sound: true,
      desktop: true,
      updates: true,
    },
  })

  const handleSettingChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias han sido actualizadas correctamente.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza la aplicación según tus preferencias.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Configura las opciones generales de la aplicación.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-format">Formato de fecha</Label>
                    <RadioGroup
                      value={settings.dateFormat}
                      onValueChange={(value) => handleSettingChange("dateFormat", value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dd/mm/yyyy" id="date-format-1" />
                        <Label htmlFor="date-format-1">DD/MM/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mm/dd/yyyy" id="date-format-2" />
                        <Label htmlFor="date-format-2">MM/DD/YYYY</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yyyy-mm-dd" id="date-format-3" />
                        <Label htmlFor="date-format-3">YYYY-MM-DD</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save">Guardado automático</Label>
                      <p className="text-sm text-muted-foreground">Guardar automáticamente los cambios realizados.</p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {!isLoading && <Save className="h-4 w-4" />}
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>Personaliza la apariencia de la aplicación.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        className="justify-start gap-2"
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-4 w-4" />
                        Claro
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        className="justify-start gap-2"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-4 w-4" />
                        Oscuro
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        className="justify-start gap-2"
                        onClick={() => setTheme("system")}
                      >
                        <Globe className="h-4 w-4" />
                        Sistema
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Modo compacto</Label>
                      <p className="text-sm text-muted-foreground">Reduce el espaciado y tamaño de los elementos.</p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">Alto contraste</Label>
                      <p className="text-sm text-muted-foreground">Aumenta el contraste para mejorar la legibilidad.</p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleSettingChange("highContrast", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {!isLoading && <Save className="h-4 w-4" />}
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura las preferencias de notificaciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-notifications">Sonido de notificaciones</Label>
                      <p className="text-sm text-muted-foreground">Reproducir sonido al recibir notificaciones.</p>
                    </div>
                    <Switch
                      id="sound-notifications"
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) => handleNotificationChange("sound", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notifications">Notificaciones de escritorio</Label>
                      <p className="text-sm text-muted-foreground">Mostrar notificaciones en el escritorio.</p>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={settings.notifications.desktop}
                      onCheckedChange={(checked) => handleNotificationChange("desktop", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="update-notifications">Notificaciones de actualizaciones</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibir notificaciones sobre actualizaciones del sistema.
                      </p>
                    </div>
                    <Switch
                      id="update-notifications"
                      checked={settings.notifications.updates}
                      onCheckedChange={(checked) => handleNotificationChange("updates", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {!isLoading && <Save className="h-4 w-4" />}
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
