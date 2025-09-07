'use client';

import { Wrench, Code, FileText, Database, Shield, Palette } from 'lucide-react';

export default function UtilidadesPage() {
    const utilities = [
        {
            title: 'Funciones de Utilidad',
            description: 'Funciones helper reutilizables para el desarrollo',
            icon: <Code className="w-6 h-6" />,
            items: [
                'Validación de formularios',
                'Formateo de fechas',
                'Manejo de errores',
                'Transformación de datos'
            ]
        },
        {
            title: 'Hooks Personalizados',
            description: 'Hooks de React reutilizables',
            icon: <Code className="w-6 h-6" />,
            items: [
                'useAuth - Autenticación',
                'useMediaQuery - Responsive design',
                'useMobile - Detección móvil',
                'useToast - Notificaciones'
            ]
        },
        {
            title: 'Configuración de Base de Datos',
            description: 'Utilidades para manejo de base de datos',
            icon: <Database className="w-6 h-6" />,
            items: [
                'Conexión Prisma',
                'Manejo de transacciones',
                'Validación de esquemas',
                'Manejo de errores DB'
            ]
        },
        {
            title: 'Componentes de UI',
            description: 'Componentes reutilizables de la interfaz',
            icon: <Palette className="w-6 h-6" />,
            items: [
                'Botones y formularios',
                'Modales y diálogos',
                'Tablas y listas',
                'Navegación y layout'
            ]
        },
        {
            title: 'Autenticación y Seguridad',
            description: 'Utilidades de seguridad y autenticación',
            icon: <Shield className="w-6 h-6" />,
            items: [
                'Middleware de autenticación',
                'Validación de roles',
                'Manejo de sesiones',
                'Protección de rutas'
            ]
        },
        {
            title: 'Documentación y Testing',
            description: 'Herramientas para desarrollo y testing',
            icon: <FileText className="w-6 h-6" />,
            items: [
                'Generación de documentación',
                'Testing de componentes',
                'Linting y formateo',
                'Scripts de desarrollo'
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Wrench className="w-8 h-8 text-accent-600" />
                    <h1 className="text-3xl font-bold text-secondary-900">Utilidades y Helpers</h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Colección de funciones, hooks y utilidades reutilizables para el desarrollo del sistema CAGPU.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {utilities.map((utility, index) => (
                    <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent-50 rounded-lg text-accent-600">
                                {utility.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-secondary-900">{utility.title}</h3>
                        </div>
                        <p className="text-secondary-600 mb-4">{utility.description}</p>
                        <ul className="space-y-2">
                            {utility.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center gap-2 text-sm text-secondary-700">
                                    <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">Convenciones de Uso</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h4 className="font-medium text-secondary-800 mb-2">Nomenclatura</h4>
                        <ul className="text-sm text-secondary-600 space-y-1">
                            <li>• Funciones: camelCase</li>
                            <li>• Hooks: use[Nombre]</li>
                            <li>• Constantes: UPPER_SNAKE_CASE</li>
                            <li>• Tipos: PascalCase</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-secondary-800 mb-2">Organización</h4>
                        <ul className="text-sm text-secondary-600 space-y-1">
                            <li>• Agrupar por funcionalidad</li>
                            <li>• Exportar desde índices</li>
                            <li>• Documentar con JSDoc</li>
                            <li>• Incluir ejemplos de uso</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
