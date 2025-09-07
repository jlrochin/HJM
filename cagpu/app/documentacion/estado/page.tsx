import { Layers, ArrowLeft, Database, RefreshCw, Activity } from 'lucide-react';
import Link from 'next/link';

export default function EstadoPage() {
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
                    <Layers className="w-10 h-10 text-accent-600 mr-3" />
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Estado y Datos
                    </h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Gestión de estado global y flujo de datos en la aplicación
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Gestión de Estado
                </h2>
                <p className="text-secondary-600 mb-4">
                    El sistema utiliza un enfoque híbrido para la gestión del estado, combinando
                    estado local de componentes con estado global cuando es necesario.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-secondary-900 mb-2">Estado Local</h3>
                        <p className="text-sm text-secondary-600">
                            useState y useEffect para estado de componentes individuales
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-secondary-900 mb-2">Estado Global</h3>
                        <p className="text-sm text-secondary-600">
                            Context API y hooks personalizados para estado compartido
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Flujo de Datos
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-accent-100 text-accent-800 rounded-full flex items-center justify-center text-sm font-bold">
                            1
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Componente UI</h4>
                            <p className="text-sm text-secondary-600">
                                Usuario interactúa con la interfaz
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                            2
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Hook Personalizado</h4>
                            <p className="text-sm text-secondary-600">
                                Lógica de negocio y llamadas a API
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                            3
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">API Route</h4>
                            <p className="text-sm text-secondary-600">
                                Procesamiento en el servidor
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold">
                            4
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Base de Datos</h4>
                            <p className="text-sm text-secondary-600">
                                Almacenamiento y recuperación de datos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Hooks Personalizados
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <RefreshCw className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">useAuth</h4>
                            <p className="text-sm text-secondary-600">
                                Gestión de autenticación y sesión del usuario
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Database className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">useData</h4>
                            <p className="text-sm text-secondary-600">
                                Operaciones CRUD y gestión de datos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Activity className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">useNotifications</h4>
                            <p className="text-sm text-secondary-600">
                                Sistema de notificaciones en tiempo real
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
