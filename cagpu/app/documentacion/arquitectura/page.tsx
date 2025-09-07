import { Layers, Database, Shield, Code, Palette, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArquitecturaPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/documentacion"
                    className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Documentación
                </Link>
                <div className="flex items-center mb-4">
                    <Layers className="w-10 h-10 text-accent-600 mr-3" />
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Arquitectura del Sistema
                    </h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Descripción general de la arquitectura y estructura del sistema CAGPU
                </p>
            </div>

            {/* Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Visión General
                </h2>
                <p className="text-secondary-600 mb-4">
                    CAGPU es una aplicación web moderna construida con Next.js 14, diseñada para gestionar
                    catálogos de servicios y atención al usuario. El sistema utiliza una arquitectura
                    de capas bien definida que separa las responsabilidades y facilita el mantenimiento.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-secondary-900 mb-2">Frontend</h3>
                        <p className="text-sm text-secondary-600">
                            Interfaz de usuario construida con React, Next.js y Tailwind CSS
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-secondary-900 mb-2">Backend</h3>
                        <p className="text-sm text-secondary-600">
                            API REST con Next.js API Routes y Prisma ORM
                        </p>
                    </div>
                </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Diagrama de Arquitectura
                </h2>
                <div className="bg-slate-50 p-6 rounded-lg">
                    <div className="text-center text-secondary-500 mb-4">
                        [Diagrama de arquitectura del sistema]
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center">
                            <div className="bg-accent-100 text-accent-800 px-4 py-2 rounded-lg font-medium">
                                Capa de Presentación (UI)
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-secondary-400">↓</div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                Capa de Lógica de Negocio (API Routes)
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-secondary-400">↓</div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                                Capa de Datos (Prisma + PostgreSQL)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Stack Tecnológico
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                            <Code className="w-5 h-5 text-accent-600 mr-2" />
                            Frontend
                        </h3>
                        <ul className="space-y-2 text-sm text-secondary-600">
                            <li>• Next.js 14.2.16</li>
                            <li>• React 18</li>
                            <li>• TypeScript</li>
                            <li>• Tailwind CSS</li>
                            <li>• Radix UI Components</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                            <Database className="w-5 h-5 text-accent-600 mr-2" />
                            Backend
                        </h3>
                        <ul className="space-y-2 text-sm text-secondary-600">
                            <li>• Next.js API Routes</li>
                            <li>• Prisma ORM</li>
                            <li>• PostgreSQL</li>
                            <li>• JWT Authentication</li>
                            <li>• bcryptjs</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                            <Shield className="w-5 h-5 text-accent-600 mr-2" />
                            Herramientas
                        </h3>
                        <ul className="space-y-2 text-sm text-secondary-600">
                            <li>• ESLint</li>
                            <li>• Prettier</li>
                            <li>• Prisma Studio</li>
                            <li>• PM2 (producción)</li>
                            <li>• Git</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Project Structure */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Estructura del Proyecto
                </h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                    <div className="text-secondary-600 mb-2">cagpu/</div>
                    <div className="ml-4 space-y-1">
                        <div>├── app/                    # App Router de Next.js</div>
                        <div>│   ├── api/               # API Routes</div>
                        <div>│   ├── components/        # Componentes reutilizables</div>
                        <div>│   ├── dashboard/         # Página principal</div>
                        <div>│   ├── documentacion/     # Documentación</div>
                        <div>│   └── ...</div>
                        <div>├── components/            # Componentes globales</div>
                        <div>├── lib/                   # Utilidades y configuraciones</div>
                        <div>├── prisma/                # Esquema y migraciones</div>
                        <div>├── hooks/                 # Custom hooks</div>
                        <div>└── public/                # Archivos estáticos</div>
                    </div>
                </div>
            </div>

            {/* Data Flow */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Flujo de Datos
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-accent-100 text-accent-800 rounded-full flex items-center justify-center text-sm font-bold">
                            1
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Usuario interactúa con la UI</h4>
                            <p className="text-sm text-secondary-600">Formularios, botones, navegación</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                            2
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">API Routes procesan la solicitud</h4>
                            <p className="text-sm text-secondary-600">Validación, autenticación, lógica de negocio</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                            3
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Prisma ORM interactúa con la BD</h4>
                            <p className="text-sm text-secondary-600">Consultas, transacciones, migraciones</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold">
                            4
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Respuesta se envía de vuelta</h4>
                            <p className="text-sm text-secondary-600">Datos procesados, errores, confirmaciones</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
