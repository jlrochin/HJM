import { Shield, ArrowLeft, Key, User, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AutenticacionPage() {
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
                    <Shield className="w-10 h-10 text-accent-600 mr-3" />
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Sistema de Autenticación
                    </h1>
                </div>
                <p className="text-lg text-secondary-600">
                    JWT, gestión de usuarios y seguridad del sistema
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Características de Seguridad
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                        <Key className="w-6 h-6 text-accent-600 mt-1" />
                        <div>
                            <h3 className="font-semibold text-secondary-900">JWT Tokens</h3>
                            <p className="text-sm text-secondary-600">
                                Autenticación basada en tokens JWT seguros
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <Lock className="w-6 h-6 text-accent-600 mt-1" />
                        <div>
                            <h3 className="font-semibold text-secondary-900">Hash de Contraseñas</h3>
                            <p className="text-sm text-secondary-600">
                                Contraseñas encriptadas con bcryptjs
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Roles de Usuario
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <User className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">Usuario Regular</h4>
                            <p className="text-sm text-secondary-600">
                                Acceso básico al catálogo de servicios
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Shield className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">Administrador</h4>
                            <p className="text-sm text-secondary-600">
                                Gestión completa del sistema y usuarios
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
