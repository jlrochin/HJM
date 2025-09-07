import { FileText, ArrowLeft, Map, Home, Users, Settings } from 'lucide-react';
import Link from 'next/link';

export default function PaginasPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="mb-8">
                <Link
                    href="/documentacion"
                    className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Documentación
                </Link>
                <div className="flex items-center mb-4">
                    <FileText className="w-10 h-10 text-accent-600 mr-3" />
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Páginas y Rutas
                    </h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Estructura de páginas y sistema de navegación
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Estructura de Rutas
                </h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                    <div className="text-secondary-600 mb-2">app/</div>
                    <div className="ml-4 space-y-1">
                        <div>├── page.tsx              # Página principal</div>
                        <div>├── dashboard/            # Dashboard principal</div>
                        <div>├── documentacion/        # Sistema de documentación</div>
                        <div>├── admin/                # Panel de administración</div>
                        <div>├── perfil/               # Gestión de perfil</div>
                        <div>├── notificaciones/       # Centro de notificaciones</div>
                        <div>└── configuracion/        # Configuración del sistema</div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Páginas Principales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <Home className="w-5 h-5 text-accent-600 mr-2" />
                            <h3 className="font-semibold text-secondary-900">Dashboard</h3>
                        </div>
                        <p className="text-sm text-secondary-600 mb-3">
                            Vista principal con métricas y acceso rápido a funciones
                        </p>
                        <Link
                            href="/dashboard"
                            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                        >
                            Ver Dashboard →
                        </Link>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <Users className="w-5 h-5 text-accent-600 mr-2" />
                            <h3 className="font-semibold text-secondary-900">Administración</h3>
                        </div>
                        <p className="text-sm text-secondary-600 mb-3">
                            Gestión de usuarios, servicios y configuraciones del sistema
                        </p>
                        <Link
                            href="/admin"
                            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                        >
                            Ver Admin →
                        </Link>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <Settings className="w-5 h-5 text-accent-600 mr-2" />
                            <h3 className="font-semibold text-secondary-900">Configuración</h3>
                        </div>
                        <p className="text-sm text-secondary-600 mb-3">
                            Ajustes del sistema y preferencias del usuario
                        </p>
                        <Link
                            href="/configuracion"
                            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                        >
                            Ver Configuración →
                        </Link>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <Map className="w-5 h-5 text-accent-600 mr-2" />
                            <h3 className="font-semibold text-secondary-900">Documentación</h3>
                        </div>
                        <p className="text-sm text-secondary-600 mb-3">
                            Guías completas para desarrolladores y usuarios
                        </p>
                        <Link
                            href="/documentacion"
                            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                        >
                            Ver Documentación →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
