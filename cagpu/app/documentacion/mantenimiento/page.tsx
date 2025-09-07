'use client';

import { Settings, Database, Shield, Activity, AlertTriangle, Clock, BarChart3, Wrench } from 'lucide-react';

export default function MantenimientoPage() {
    const maintenanceTasks = [
        {
            title: 'Mantenimiento Preventivo',
            description: 'Tareas programadas para prevenir problemas',
            icon: <Settings className="w-6 h-6" />,
            frequency: 'Semanal',
            tasks: [
                'Verificación de logs del sistema',
                'Monitoreo de espacio en disco',
                'Revisión de rendimiento de base de datos',
                'Actualización de dependencias de seguridad'
            ]
        },
        {
            title: 'Monitoreo del Sistema',
            description: 'Seguimiento continuo del estado del sistema',
            icon: <Activity className="w-6 h-6" />,
            frequency: '24/7',
            tasks: [
                'Monitoreo de CPU y memoria',
                'Verificación de conectividad de base de datos',
                'Alertas de errores y excepciones',
                'Métricas de rendimiento de la aplicación'
            ]
        },
        {
            title: 'Backup y Recuperación',
            description: 'Procedimientos de respaldo y restauración',
            icon: <Database className="w-6 h-6" />,
            frequency: 'Diario',
            tasks: [
                'Backup automático de base de datos',
                'Verificación de integridad de backups',
                'Pruebas de restauración',
                'Almacenamiento seguro de respaldos'
            ]
        },
        {
            title: 'Seguridad y Auditoría',
            description: 'Mantenimiento de la seguridad del sistema',
            icon: <Shield className="w-6 h-6" />,
            frequency: 'Mensual',
            tasks: [
                'Revisión de logs de auditoría',
                'Actualización de certificados SSL',
                'Análisis de vulnerabilidades',
                'Revisión de permisos de usuario'
            ]
        }
    ];

    const troubleshooting = [
        {
            issue: 'Error de conexión a base de datos',
            symptoms: 'Aplicación no responde, errores 500',
            solution: 'Verificar estado de PostgreSQL, revisar logs de conexión',
            icon: <Database className="w-5 h-5" />
        },
        {
            issue: 'Alto uso de memoria',
            symptoms: 'Lentitud en la aplicación, timeouts',
            solution: 'Revisar procesos Node.js, reiniciar servicios',
            icon: <Activity className="w-5 h-5" />
        },
        {
            issue: 'Problemas de autenticación',
            symptoms: 'Usuarios no pueden iniciar sesión',
            solution: 'Verificar middleware de auth, revisar cookies',
            icon: <Shield className="w-5 h-5" />
        },
        {
            issue: 'Errores de build',
            symptoms: 'Fallo en despliegue, errores de compilación',
            solution: 'Limpiar cache, reinstalar dependencias',
            icon: <Wrench className="w-5 h-5" />
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-8 h-8 text-accent-600" />
                    <h1 className="text-3xl font-bold text-secondary-900">Mantenimiento y Operaciones</h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Guía completa para el mantenimiento, monitoreo y resolución de problemas del sistema CAGPU.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-12">
                {maintenanceTasks.map((task, index) => (
                    <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-50 rounded-lg text-accent-600">
                                    {task.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-secondary-900">{task.title}</h3>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                {task.frequency}
                            </span>
                        </div>
                        <p className="text-secondary-600 mb-4">{task.description}</p>
                        <ul className="space-y-2">
                            {task.tasks.map((taskItem, taskIndex) => (
                                <li key={taskIndex} className="flex items-center gap-2 text-sm text-secondary-700">
                                    <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                                    {taskItem}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Resolución de Problemas</h2>
                <div className="grid gap-4">
                    {troubleshooting.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-50 rounded-lg text-red-600 flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">{item.issue}</h3>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div>
                                            <h4 className="font-medium text-secondary-800 mb-1">Síntomas:</h4>
                                            <p className="text-sm text-secondary-600">{item.symptoms}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-secondary-800 mb-1">Solución:</h4>
                                            <p className="text-sm text-secondary-600">{item.solution}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-accent-600" />
                        <h3 className="text-xl font-semibold text-secondary-900">Horarios de Mantenimiento</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-secondary-700">Mantenimiento Preventivo</span>
                            <span className="text-sm font-medium text-accent-600">Domingos 2:00 AM</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-secondary-700">Backup de Base de Datos</span>
                            <span className="text-sm font-medium text-accent-600">Diario 1:00 AM</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-secondary-700">Actualizaciones de Seguridad</span>
                            <span className="text-sm font-medium text-accent-600">Segundos Martes</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-secondary-700">Revisión de Logs</span>
                            <span className="text-sm font-medium text-accent-600">Lunes 9:00 AM</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-accent-600" />
                        <h3 className="text-xl font-semibold text-secondary-900">Métricas de Monitoreo</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Uptime del Sistema</span>
                            <span className="text-sm font-medium text-green-600">99.9%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Tiempo de Respuesta</span>
                            <span className="text-sm font-medium text-blue-600">&lt; 200ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Uso de CPU</span>
                            <span className="text-sm font-medium text-orange-600">15-25%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Uso de Memoria</span>
                            <span className="text-sm font-medium text-purple-600">40-60%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
