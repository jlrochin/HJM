'use client'

import { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, Edit, Loader2, Eye } from 'lucide-react'
import { ServiceForm } from './service-form'
import { useAuth } from '@/hooks/use-auth'

interface Service {
  id: string
  name: string
  directionId: string
  responsiblePerson?: string
  phoneExtension?: string
  serviceType?: string
  location?: string
  description?: string
  isActive: boolean
  direction: {
    id: string
    name: string
  }
}

export function ServiceManagement() {
  const { user, loading: authLoading, isAdmin, isDeveloper } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [modalService, setModalService] = useState<Service | null>(null)
  const [viewService, setViewService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDirection, setSelectedDirection] = useState<string>('all')
  const [directions, setDirections] = useState<Array<{ id: string, name: string }>>([])

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadData()
      } else {
        setError('Debes iniciar sesión para ver los servicios')
        setIsLoading(false)
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    }
  }, [user, authLoading])

  // Filtrar servicios con useMemo para mejor rendimiento
  const filteredServices = useMemo(() => {
    let filtered = services

    // Para usuarios no-admin y no-developer, mostrar solo su servicio asignado
    if (!isAdmin && !isDeveloper && user?.serviceId) {
      filtered = filtered.filter(service => service.id === user.serviceId)
      return filtered
    }

    // Para admins y developers, aplicar filtros normales
    if (isAdmin || isDeveloper) {
      // Filtrar por dirección seleccionada
      if (selectedDirection !== 'all') {
        filtered = filtered.filter(service => service.directionId === selectedDirection)
      }

      // Filtrar por término de búsqueda
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(service =>
          service.name.toLowerCase().includes(searchLower) ||
          (service.responsiblePerson && service.responsiblePerson.toLowerCase().includes(searchLower)) ||
          (service.location && service.location.toLowerCase().includes(searchLower))
        )
      }
    }

    return filtered
  }, [searchTerm, services, selectedDirection, isAdmin, isDeveloper, user?.serviceId])

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Cargar servicios y direcciones en paralelo
      const [servicesRes, directionsRes] = await Promise.all([
        fetch('/api/services', { credentials: 'include' }),
        fetch('/api/directions', { credentials: 'include' })
      ])

      if (servicesRes.ok && directionsRes.ok) {
        const [servicesData, directionsData] = await Promise.all([
          servicesRes.json(),
          directionsRes.json()
        ])
        setServices(servicesData)
        setDirections(directionsData)
      } else {
        const errorText = await servicesRes.text()
        console.error('Error en respuesta de servicios:', servicesRes.status, errorText)
        setError(`Error ${servicesRes.status}: ${errorText}`)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleEditService = useCallback((service: Service) => {
    setModalService(service)
  }, [])

  const handleViewService = useCallback((service: Service) => {
    setViewService(service)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalService(null)
    loadData() // Recargar datos después de editar
  }, [loadData])

  const handleCloseViewModal = useCallback(() => {
    setViewService(null)
  }, [])

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Nombre', 'Dirección', 'Responsable', 'Extensión', 'Ubicación', 'Tipo', 'Descripción'],
      ...filteredServices.map(service => [
        service.name,
        service.direction.name,
        service.responsiblePerson || 'No especificado',
        service.phoneExtension || 'No especificado',
        service.location || 'No especificado',
        getServiceTypeLabel(service.serviceType),
        service.description || 'Sin descripción'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `servicios_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredServices])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedDirection('all')
  }, [])

  const getServiceTypeLabel = useCallback((type?: string) => {
    if (!type) return 'Sin especificar'

    const typeMap: Record<string, string> = {
      'clinical': 'Clínico',
      'administrative': 'Administrativo',
      'support': 'Apoyo',
      'specialized': 'Especializado',
      'Unidad': 'Unidad',
      'División': 'División',
      'Servicio': 'Servicio',
      'Departamento': 'Departamento',
      'Subdirección': 'Subdirección',
      'Coordinación': 'Coordinación',
      'Área': 'Área',
      'Laboratorio': 'Laboratorio'
    }

    return typeMap[type] || type
  }, [])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando servicios...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar servicios</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {(isAdmin || isDeveloper) ? 'Gestión de Servicios' : 'Mi Servicio'}
          </h1>
          <p className="text-muted-foreground">
            {(isAdmin || isDeveloper)
              ? 'Acceda y modifique la información de los servicios'
              : 'Información de su servicio asignado'
            }
          </p>
        </div>
        {(isAdmin || isDeveloper) && (
          <div className="flex gap-3">
            <Button variant="outline" className="btn-optimized" onClick={handleExport}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </Button>
            <Button
              onClick={() => setModalService({} as Service)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-optimized"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Servicio
            </Button>
          </div>
        )}
      </div>

      {/* Search and Controls - Solo para Admin y Developer */}
      {(isAdmin || isDeveloper) && (
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, responsable o ubicación..."
              className="pl-10 search-input"
              value={searchTerm}
              onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            />
            {isPending && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            )}
          </div>

          <Button variant="outline" className="btn-optimized">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filtros
          </Button>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-none border-r-0 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-none ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Direction Tabs - Solo para Admin y Developer */}
      {(isAdmin || isDeveloper) && directions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDirection('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedDirection === 'all'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Todos
          </button>
          {directions.map((direction) => (
            <button
              key={direction.id}
              onClick={() => setSelectedDirection(direction.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedDirection === direction.id
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {direction.name}
            </button>
          ))}
        </div>
      )}

      {/* Services Count */}
      <div className="text-sm text-muted-foreground">
        {(isAdmin || isDeveloper) ? (
          <>
            {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} encontrado{filteredServices.length !== 1 ? 's' : ''}
            {(searchTerm || selectedDirection !== 'all') && filteredServices.length !== services.length && (
              <span className="ml-2 text-blue-600">
                (de {services.length} total)
              </span>
            )}
            {selectedDirection !== 'all' && (
              <span className="ml-2 text-blue-600">
                (filtrado por dirección)
              </span>
            )}
          </>
        ) : (
          <>
            Su servicio asignado
            {filteredServices.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({filteredServices[0].name})
              </span>
            )}
          </>
        )}
      </div>

      {/* Services Display */}
      {filteredServices.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 services-grid">
            {filteredServices.map((service, index) => (
              <Card key={service.id} className="relative service-card animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {getServiceTypeLabel(service.serviceType)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {service.direction.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Responsable:</span>
                      <p>{service.responsiblePerson || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Extensión:</span>
                      <p>{service.phoneExtension || 'No especificado'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-muted-foreground">Ubicación:</span>
                      <p>{service.location || 'No especificado'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-muted-foreground">Servicio de:</span>
                      <p className="text-sm text-muted-foreground">
                        {service.description || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 btn-optimized"
                      onClick={() => handleViewService(service)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 btn-optimized"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 services-grid">
            {filteredServices.map((service, index) => (
              <Card key={service.id} className="service-card animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{service.direction.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Responsable:</span> {service.responsiblePerson || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Extensión:</span> {service.phoneExtension || 'No especificado'}
                        </div>
                        <div>
                          <span className="font-medium">Ubicación:</span> {service.location || 'No especificado'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-optimized"
                        onClick={() => handleViewService(service)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-optimized"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          {searchTerm ? (
            <div>
              <p className="text-lg text-muted-foreground">
                No se encontraron servicios que coincidan con "{searchTerm}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {(isAdmin || isDeveloper)
                  ? 'No hay servicios disponibles en este momento.'
                  : 'No se encontró su servicio asignado. Contacte al administrador.'
                }
              </p>
              {(isAdmin || isDeveloper) && (searchTerm || selectedDirection !== 'all') && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="btn-optimized"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Service Modal */}
      <Dialog open={!!modalService} onOpenChange={open => { if (!open) handleCloseModal() }}>
        <DialogContent
          className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto modal-content scroll-container service-form-modal"
          aria-describedby="service-form-description"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            margin: 'auto',
            maxWidth: '95vw',
            maxHeight: '95vh',
            width: '95vw',
            height: '95vh'
          }}
        >
          {/* Header fijo del modal */}
          <div className="sticky-header">
            <div className="flex justify-between items-start w-full">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {modalService?.id ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </DialogTitle>
                <DialogDescription id="service-form-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {modalService?.id
                    ? `Editando información del servicio: ${modalService.name}`
                    : 'Complete la información para crear un nuevo servicio'
                  }
                </DialogDescription>
              </div>
              <button
                onClick={handleCloseModal}
                className="close-button ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                aria-label="Cerrar modal"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 6l12 12M6 18L18 6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="px-1">
            {modalService && <ServiceForm service={{ ...modalService, responsiblePerson: modalService.responsiblePerson || '', phoneExtension: modalService.phoneExtension || '', serviceType: modalService.serviceType || '', location: modalService.location || '', description: modalService.description || '' }} onSaved={handleCloseModal} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Service Modal */}
      <Dialog open={!!viewService} onOpenChange={open => { if (!open) handleCloseViewModal() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Información del Servicio
            </DialogTitle>
            <DialogDescription>
              Detalles completos del servicio seleccionado
            </DialogDescription>
          </DialogHeader>
          {viewService && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{viewService.name}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {getServiceTypeLabel(viewService.serviceType)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{viewService.direction.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Responsable:</label>
                  <p className="text-sm">{viewService.responsiblePerson || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Extensión:</label>
                  <p className="text-sm">{viewService.phoneExtension || 'No especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Ubicación:</label>
                  <p className="text-sm">{viewService.location || 'No especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Descripción del servicio:</label>
                  <p className="text-sm text-muted-foreground">
                    {viewService.description || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseViewModal}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    handleCloseViewModal()
                    handleEditService(viewService)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
