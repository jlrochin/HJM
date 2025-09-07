"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Removed hardcoded data import - now uses database data
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ServiceForm } from "@/components/service-form"

export function Directions() {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [directionsData, setDirectionsData] = useState<any[]>([])
  const [servicesData, setServicesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, directionsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/directions')
        ])

        const services = await servicesRes.json()
        const directions = await directionsRes.json()

        setServicesData(services)
        setDirectionsData(directions)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDirectionClick = (directionId: string) => {
    setSelectedDirection(directionId === selectedDirection ? null : directionId)
    setSelectedService(null)
  }

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId === selectedService ? null : serviceId)
  }

  const filteredServices = selectedDirection
    ? servicesData.filter((service) => service.directionId === selectedDirection)
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-muted-foreground">Cargando direcciones...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {directionsData.map((direction) => (
        <motion.div
          key={direction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              selectedDirection === direction.id ? "border-primary shadow-md" : "hover:border-primary/20",
            )}
            onClick={() => handleDirectionClick(direction.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{direction.name}</CardTitle>
              <CardDescription>{direction.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{servicesData.filter(service => service.directionId === direction.id).length} servicios</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-primary transition-transform",
                    selectedDirection === direction.id && "transform rotate-180",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {selectedDirection && (
        <motion.div
          className="col-span-1 md:col-span-2 lg:col-span-3 mt-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{directionsData.find((d) => d.id === selectedDirection)?.name} - Servicios</CardTitle>
              <CardDescription>Seleccione un servicio para ver o editar su información FAICI</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredServices.length > 0 ? (
                  filteredServices
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((service) => (
                      <AccordionItem key={service.id} value={service.id}>
                        <AccordionTrigger
                          onClick={() => handleServiceClick(service.id)}
                          className={cn(selectedService === service.id && "text-primary font-medium")}
                        >
                          {service.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          {selectedService === service.id && <ServiceForm service={service} />}
                        </AccordionContent>
                      </AccordionItem>
                    ))
                ) : (
                  <div className="py-4 text-center text-gray-500">No hay servicios disponibles para esta dirección</div>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
