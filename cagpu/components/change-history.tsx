"use client"

import { motion } from "framer-motion"
import type { ChangeRecord } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Activity, User, UserCheck, UserX, Edit, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ChangeHistory({ changes }: { changes: ChangeRecord[] }) {
  if (changes.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-medium text-foreground">Historial de Cambios</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campo</TableHead>
              <TableHead>Valor Anterior</TableHead>
              <TableHead>Nuevo Valor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.id}>
                <TableCell className="font-medium capitalize">{translateFieldName(change.field)}</TableCell>
                <TableCell>{change.previousValue}</TableCell>
                <TableCell>{change.newValue}</TableCell>
                <TableCell>{formatDate(change.timestamp)}</TableCell>
                <TableCell>{change.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}

export function ChangeHistorySummary({ changes }: { changes: any[] }) {
  if (changes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hay cambios recientes.</p>
          <p className="text-sm text-muted-foreground/70">Los cambios en usuarios y servicios aparecerán aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-foreground">Cambios Recientes de Usuarios y Servicios</h3>
        <Badge variant="secondary" className="ml-auto">
          {changes.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {changes.map((change) => (
          <motion.div
            key={change.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(change.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActionBadgeVariant(change.action)} className="text-xs">
                    {formatAction(change.action)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatDate(change.createdAt)}
                  </span>
                </div>
                                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {change.action?.includes('service') ? (
                      <>
                        <span className="text-muted-foreground">El servicio</span>
                        <span className="font-medium text-primary">
                          {change.details?.split('"')[1] || 'Servicio'}
                        </span>
                        <span className="text-muted-foreground">fue {change.action === 'service_create' ? 'creado' : 'actualizado'} por</span>
                        <span className="font-medium text-orange-600">
                          {change.performedByUser?.username || 'un usuario'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-primary">
                          {change.targetUser?.username || 'Desconocido'}
                        </span>
                        <span className="text-muted-foreground">fue modificado por</span>
                        <span className="font-medium text-orange-600">
                          {change.performedByUser?.username || 'Desconocido'}
                        </span>
                      </>
                    )}
                  </div>
                {change.details && !change.details.startsWith('Usuario actualizado: {') && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground font-medium">
                      Cambios: {change.details}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function translateFieldName(field: string): string {
  const translations: Record<string, string> = {
    name: "nombre",
    responsiblePerson: "responsable",
    phoneExtension: "extensión",
    serviceType: "tipo de servicio",
    location: "ubicación",
    description: "descripción",
  }

  return translations[field] || field
}

function formatAction(action: string): string {
  if (action === 'activate') return 'Usuario activado';
  if (action === 'deactivate') return 'Usuario desactivado';
  if (action === 'update') return 'Usuario modificado';
  if (action === 'create') return 'Usuario creado';
  if (action === 'service_update') return 'Servicio actualizado';
  if (action === 'service_create') return 'Servicio creado';
  return action;
}

function getActionIcon(action: string) {
  const iconClass = "h-4 w-4";
  
  switch (action) {
    case 'activate':
      return <UserCheck className={`${iconClass} text-green-600`} />;
    case 'deactivate':
      return <UserX className={`${iconClass} text-red-600`} />;
    case 'update':
      return <Edit className={`${iconClass} text-blue-600`} />;
    case 'create':
      return <User className={`${iconClass} text-purple-600`} />;
    case 'service_update':
      return <Edit className={`${iconClass} text-indigo-600`} />;
    case 'service_create':
      return <Activity className={`${iconClass} text-emerald-600`} />;
    default:
      return <Activity className={`${iconClass} text-gray-600`} />;
  }
}

function getActionBadgeVariant(action: string): "default" | "destructive" | "outline" | "secondary" {
  switch (action) {
    case 'activate':
    case 'create':
    case 'service_create':
      return 'default';
    case 'deactivate':
      return 'destructive';
    case 'update':
    case 'service_update':
      return 'secondary';
    default:
      return 'outline';
  }
}
