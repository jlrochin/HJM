import Link from 'next/link';
import {
    BookOpen,
    Database,
    Shield,
    Code,
    Palette,
    FileText,
    Layers,
    Wrench,
    Settings,
    Server,
    ArrowRight,
    Search,
    Info,
    Zap
} from 'lucide-react';

const sections = [
    {
        title: 'Arquitectura',
        description: 'Descripción general de la arquitectura del sistema CAGPU',
        href: '/documentacion/arquitectura',
        icon: <Layers className="w-8 h-8 text-accent-600" />,
        color: 'bg-blue-50 border-blue-200'
    },
    {
        title: 'Base de Datos',
        description: 'Esquema de base de datos, migraciones y configuración Prisma',
        href: '/documentacion/base-datos',
        icon: <Database className="w-8 h-8 text-accent-600" />,
        color: 'bg-green-50 border-green-200'
    },
    {
        title: 'Autenticación',
        description: 'Sistema de autenticación, JWT y gestión de usuarios',
        href: '/documentacion/autenticacion',
        icon: <Shield className="w-8 h-8 text-accent-600" />,
        color: 'bg-purple-50 border-purple-200'
    },
    {
        title: 'API y Endpoints',
        description: 'Documentación completa de la API REST',
        href: '/documentacion/api',
        icon: <Code className="w-8 h-8 text-accent-600" />,
        color: 'bg-orange-50 border-orange-200'
    },
    {
        title: 'Componentes',
        description: 'Biblioteca de componentes UI reutilizables',
        href: '/documentacion/componentes',
        icon: <Palette className="w-8 h-8 text-accent-600" />,
        color: 'bg-pink-50 border-pink-200'
    },
    {
        title: 'Páginas y Rutas',
        description: 'Estructura de páginas y sistema de navegación',
        href: '/documentacion/paginas',
        icon: <FileText className="w-8 h-8 text-accent-600" />,
        color: 'bg-indigo-50 border-indigo-200'
    },
    {
        title: 'Estado y Datos',
        description: 'Gestión de estado global y flujo de datos',
        href: '/documentacion/estado',
        icon: <Layers className="w-8 h-8 text-accent-600" />,
        color: 'bg-teal-50 border-teal-200'
    },
    {
        title: 'Utilidades',
        description: 'Funciones auxiliares y herramientas de desarrollo',
        href: '/documentacion/utilidades',
        icon: <Wrench className="w-8 h-8 text-accent-600" />,
        color: 'bg-yellow-50 border-yellow-200'
    },
    {
        title: 'Despliegue',
        description: 'Guías de despliegue en desarrollo y producción',
        href: '/documentacion/despliegue',
        icon: <Server className="w-8 h-8 text-accent-600" />,
        color: 'bg-red-50 border-red-200'
    },
    {
        title: 'Mantenimiento',
        description: 'Procedimientos de mantenimiento y monitoreo',
        href: '/documentacion/mantenimiento',
        icon: <Settings className="w-8 h-8 text-accent-600" />,
        color: 'bg-gray-50 border-gray-200'
    }
];

export default function DocumentacionPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                    <BookOpen className="w-12 h-12 text-accent-600 mr-3" />
                    <h1 className="text-4xl font-bold text-secondary-900">
                        Documentación CAGPU
                    </h1>
                </div>
                <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                    Guía completa para desarrolladores y administradores del sistema de Catálogo de Atención
                </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-accent-50 to-blue-50 border border-accent-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            Acciones Rápidas
                        </h2>
                        <p className="text-secondary-600">
                            Enlaces directos a las secciones más utilizadas
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/documentacion/api"
                            className="inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                        >
                            <Code className="w-4 h-4 mr-2" />
                            Ver API
                        </Link>
                        <Link
                            href="/documentacion/despliegue"
                            className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                        >
                            <Server className="w-4 h-4 mr-2" />
                            Despliegue
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                        type="text"
                        placeholder="Buscar en toda la documentación..."
                        className="w-full pl-12 pr-4 py-3 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent shadow-sm"
                    />
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className={`group block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${section.color}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            {section.icon}
                            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-accent-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            {section.title}
                        </h3>
                        <p className="text-secondary-600 text-sm leading-relaxed">
                            {section.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Getting Started */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8">
                <div className="flex items-center mb-6">
                    <Zap className="w-8 h-8 text-accent-600 mr-3" />
                    <h2 className="text-2xl font-bold text-secondary-900">
                        Comenzar Rápidamente
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-accent-600 font-bold text-lg">1</span>
                        </div>
                        <h3 className="font-semibold text-secondary-900 mb-2">Configuración</h3>
                        <p className="text-sm text-secondary-600">
                            Configura tu entorno de desarrollo
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-accent-600 font-bold text-lg">2</span>
                        </div>
                        <h3 className="font-semibold text-secondary-900 mb-2">Base de Datos</h3>
                        <p className="text-sm text-secondary-600">
                            Configura y migra la base de datos
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-accent-600 font-bold text-lg">3</span>
                        </div>
                        <h3 className="font-semibold text-secondary-900 mb-2">Desarrollo</h3>
                        <p className="text-sm text-secondary-600">
                            Comienza a desarrollar nuevas funcionalidades
                        </p>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                    <Info className="w-6 h-6 text-secondary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-secondary-900">
                        Información del Sistema
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-secondary-500">Framework:</span>
                        <span className="ml-2 font-medium text-secondary-900">Next.js 14.2.16</span>
                    </div>
                    <div>
                        <span className="text-secondary-500">Base de Datos:</span>
                        <span className="ml-2 font-medium text-secondary-900">PostgreSQL + Prisma</span>
                    </div>
                    <div>
                        <span className="text-secondary-500">UI:</span>
                        <span className="ml-2 font-medium text-secondary-900">Tailwind CSS + Radix UI</span>
                    </div>
                    <div>
                        <span className="text-secondary-500">Versión:</span>
                        <span className="ml-2 font-medium text-secondary-900">1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
