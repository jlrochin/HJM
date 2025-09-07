"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service } from '@/lib/types'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { toast } from "sonner"

const instructivo = {
  area: "Indicar el nombre del Área o Servicio de acuerdo al Organigrama Funcional",
  responsible: "Indicar el nombre completo de la persona responsable del Área o Servicio y el cargo.",
  phoneExtension: "Proporcionar número de extensión.",
  location: "Indicar localización del Servicio (Edif., Piso, Consultorio)",
  direction: "Nombre completo de la Dirección a la que pertenece el Área o Servicio",
  division: "Nombre completo de la División o Subdirección a la que pertenece el Área o Servicio.",
  serviceType: "Indicar la función principal que proporciona.",
  particularInfo: "Indicar información específica del Área o Servicio, dicha información, el personal del Servicio de Informes y Hospitalidad la transmitirá a la población usuaria.",
  documentation: "Indicar qué tipo de documentación requiere la persona usuaria y especificar para qué trámite.",
  consultorioNumber: "Proporcionar número de consultorio del servicio.",
  externalControl: "Proporcionar número de módulo de Consulta Externa al que pertenece.",
  consultorioPhone: "Proporcionar número de extensión de consultorio.",
  controlPhone: "Proporcionar número de extensión de control.",
  schedule: "Indicar horarios de atención a la población usuaria.",
  appointmentPlace: "Indicar área donde se agenda cita.",
  academicEvents: "Especificar los eventos académicos programados, en los que habrá participación de la población usuaria.",
  additionalInfo: "Anotar la información que el Área o Servicio, desee puntualizar a la población usuaria, a través del personal del Servicio de Informes y Hospitalidad."
}

export function ServiceForm({ service, onSaved }: { service?: Service, onSaved?: () => void }) {
  const [formData, setFormData] = useState({
    id: service?.id || "",
    area: service?.name || "",
    responsible: service?.responsiblePerson || "",
    phoneExtension: service?.phoneExtension || "",
    location: service?.location || "",
    direction: service?.directionId || "",
    division: "",
    serviceType: service?.serviceType || "Servicio",
    particularInfo: service?.description || "",
    documentation: "",
    consultorioNumber: "",
    externalControl: "",
    consultorioPhone: "",
    controlPhone: "",
    schedule: "",
    appointmentPlace: "",
    academicEvents: "",
    additionalInfo: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [directionsData, setDirectionsData] = useState<any[]>([])

  // Cargar direcciones para el select
  useEffect(() => {
    fetch('/api/directions')
      .then(res => res.json())
      .then(data => setDirectionsData(data))
      .catch(error => console.error('Error al cargar direcciones:', error))
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const isNewService = !service?.id || service.id === ""

      // Generar ID automático para nuevos servicios si no existe
      let serviceId = formData.id
      if (isNewService && !serviceId) {
        serviceId = formData.area.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)

        // Agregar timestamp para evitar duplicados
        serviceId = `${serviceId}-${Date.now()}`
      }

      const serviceData = {
        id: serviceId,
        name: formData.area,
        directionId: formData.direction,
        responsiblePerson: formData.responsible,
        phoneExtension: formData.phoneExtension,
        serviceType: formData.serviceType,
        location: formData.location,
        description: formData.particularInfo,
        isActive: true // Agregar campo isActive que espera la validación
      }

      // Validar campos requeridos
      if (!serviceData.name || !serviceData.directionId) {
        toast.error("El nombre del servicio y la dirección son obligatorios.")
        setIsSaving(false)
        return
      }

      // Validación adicional
      if (serviceData.name.trim().length === 0) {
        toast.error("El nombre del servicio no puede estar vacío.")
        setIsSaving(false)
        return
      }

      if (serviceData.directionId.trim().length === 0) {
        toast.error("Debe seleccionar una dirección.")
        setIsSaving(false)
        return
      }

      // Debug: mostrar datos que se envían
      console.log('Datos del servicio a enviar:', serviceData)

      const url = '/api/services'
      const method = isNewService ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          const errorMessage = result.details.join(', ')
          throw new Error(`Error de validación: ${errorMessage}`)
        }
        throw new Error(result.error || 'Error al guardar el servicio')
      }

      toast.success(isNewService
        ? "El nuevo servicio se creó correctamente."
        : "La información del servicio se actualizó correctamente.")

      // Disparar evento para actualizar notificaciones
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notificationsUpdate'))
      }

      if (onSaved) onSaved()
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el servicio")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <TooltipProvider>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 max-w-5xl mx-auto"
        onSubmit={handleSubmit}
      >
        {/* Sección 1 */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
            {/* Campo ID del servicio oculto - se genera automáticamente */}
            {/* <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">ID DEL SERVICIO</Label>
              </div>
              <Input
                value={formData.id}
                onChange={e => handleChange("id", e.target.value)}
                placeholder="Se generará automáticamente si se deja vacío"
                disabled={!!service?.id} // Solo editable para nuevos servicios
              />
            </div> */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">ÁREA O SERVICIO *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.area}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.area} onChange={e => handleChange("area", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">NOMBRE Y CARGO DE LA PERSONA TITULAR RESPONSABLE DEL ÁREA O SERVICIO</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.responsible}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.responsible} onChange={e => handleChange("responsible", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EXTENSIÓN TELEFÓNICA</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.phoneExtension}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="text"
                value={formData.phoneExtension}
                onChange={e => handleChange("phoneExtension", e.target.value)}
                placeholder="Solo números"
                pattern="[0-9]*"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">UBICACIÓN</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.location}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.location} onChange={e => handleChange("location", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">DIRECCIÓN A LA QUE PERTENECE *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.direction}</TooltipContent>
                </Tooltip>
              </div>
              <Select value={formData.direction} onValueChange={value => handleChange("direction", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una dirección" />
                </SelectTrigger>
                <SelectContent>
                  {directionsData.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id}>
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">DIVISIÓN O SUBDIRECCIÓN A LA QUE PERTENECE</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.division}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.division} onChange={e => handleChange("division", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">TIPO DE SERVICIO QUE BRINDA</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.serviceType}</TooltipContent>
                </Tooltip>
              </div>
              <Select value={formData.serviceType} onValueChange={value => handleChange("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unidad">Unidad</SelectItem>
                  <SelectItem value="División">División</SelectItem>
                  <SelectItem value="Servicio">Servicio</SelectItem>
                  <SelectItem value="Departamento">Departamento</SelectItem>
                  <SelectItem value="Subdirección">Subdirección</SelectItem>
                  <SelectItem value="Coordinación">Coordinación</SelectItem>
                  <SelectItem value="Área">Área</SelectItem>
                  <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="clinical">Clínico</SelectItem>
                  <SelectItem value="administrative">Administrativo</SelectItem>
                  <SelectItem value="support">Apoyo</SelectItem>
                  <SelectItem value="specialized">Especializado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">INFORMACIÓN PARTICULAR QUE EL SERVICIO DE INFORMES Y HOSPITALIDAD DEBE PROPORCIONAR A LA POBLACIÓN USUARIA</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.particularInfo}</TooltipContent>
                </Tooltip>
              </div>
              <Textarea rows={2} value={formData.particularInfo} onChange={e => handleChange("particularInfo", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EL ÁREA O SERVICIO REQUIERE DOCUMENTACIÓN ESPECÍFICA DE LA PERSONA USUARIA, PARA REALIZAR ALGÚN TIPO DE TRÁMITE</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.documentation}</TooltipContent>
                </Tooltip>
              </div>
              <Textarea rows={2} value={formData.documentation} onChange={e => handleChange("documentation", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sección 2 */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4 text-center border-b pb-2">INFORMACIÓN ESPECÍFICA DE ÁREAS O SERVICIOS MÉDICOS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EN QUÉ NÚMERO DE CONSULTORIO PROPORCIONA ATENCIÓN A PACIENTES</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.consultorioNumber}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="text"
                value={formData.consultorioNumber}
                onChange={e => handleChange("consultorioNumber", e.target.value)}
                placeholder="Ej: Consultorio 5, Sala 3, etc."
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EN QUÉ CONTROL DE CONSULTA EXTERNA SE AGENDAN CITAS PARA ESPECIALIDAD</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.externalControl}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="text"
                value={formData.externalControl}
                onChange={e => handleChange("externalControl", e.target.value)}
                placeholder="Ej: Módulo A, Control 2, etc."
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EXTENSIÓN TELEFÓNICA DEL CONSULTORIO</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.consultorioPhone}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={formData.consultorioPhone}
                onChange={e => handleChange("consultorioPhone", e.target.value)}
                placeholder="Solo números"
                min="0"
                max="9999"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EXTENSIÓN TELEFÓNICA DEL CONTROL</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.controlPhone}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={formData.controlPhone}
                onChange={e => handleChange("controlPhone", e.target.value)}
                placeholder="Solo números"
                min="0"
                max="9999"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">HORARIOS DE ATENCIÓN</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.schedule}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.schedule} onChange={e => handleChange("schedule", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">LUGAR PARA AGENDAR CITAS</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.appointmentPlace}</TooltipContent>
                </Tooltip>
              </div>
              <Input value={formData.appointmentPlace} onChange={e => handleChange("appointmentPlace", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">EVENTOS ACADÉMICOS PROGRAMADOS E INDICACIONES PARA LA POBLACIÓN USUARIA</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.academicEvents}</TooltipContent>
                </Tooltip>
              </div>
              <Textarea rows={2} value={formData.academicEvents} onChange={e => handleChange("academicEvents", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center gap-1 min-h-[24px]">
                <Label className="whitespace-normal">INFORMACIÓN ADICIONAL</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-muted-foreground"><HelpCircle className="w-4 h-4" /></span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={12} className="max-w-4xl break-words text-xs">{instructivo.additionalInfo}</TooltipContent>
                </Tooltip>
              </div>
              <Textarea rows={2} value={formData.additionalInfo} onChange={e => handleChange("additionalInfo", e.target.value)} />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
          {isSaving ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Guardando..." : (!service?.id ? "Crear Servicio" : "Guardar Cambios")}
        </Button>
      </motion.form>
    </TooltipProvider>
  )
}
