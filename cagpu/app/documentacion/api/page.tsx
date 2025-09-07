'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    Code,
    Globe,
    Shield,
    Database,
    Zap,
    ExternalLink,
    CheckCircle,
    AlertTriangle,
    FileText,
    Activity,
    Server
} from 'lucide-react';

export default function ApiPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-secondary-900 mb-4">
                    API y Endpoints
                </h2>
                <p className="text-xl text-secondary-600">
                    Estructura de la API, endpoints disponibles, validaciones y manejo de errores
                </p>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Globe className="w-6 h-6 text-accent-600 mr-3" />
                    Visión General de la API
                </h3>

                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-secondary-700 mb-6">
                        El sistema CAGPU utiliza Next.js API Routes para proporcionar una API RESTful completa.
                        La API está diseñada con autenticación JWT, validación de datos con Zod, y manejo robusto de errores.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="font-semibold text-secondary-900 mb-2">Características</h4>
                            <ul className="space-y-1 text-sm text-secondary-700">
                                <li>• API Routes de Next.js 14</li>
                                <li>• Autenticación JWT</li>
                                <li>• Validación con Zod</li>
                                <li>• Manejo de errores HTTP</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="font-semibold text-secondary-900 mb-2">Estructura</h4>
                            <ul className="space-y-1 text-sm text-secondary-700">
                                <li>• RESTful design</li>
                                <li>• Respuestas JSON estandarizadas</li>
                                <li>• Códigos de estado HTTP</li>
                                <li>• Documentación OpenAPI</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Structure */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Estructura de la API</h3>

                <div className="bg-slate-900 text-slate-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                    <div className="text-slate-400 mb-2"># Estructura de directorios de la API</div>
                    <div>app/api/</div>
                    <div className="ml-4">├── auth/                    # Autenticación</div>
                    <div className="ml-4">│   ├── login/route.ts       # POST /api/auth/login</div>
                    <div className="ml-4">│   ├── logout/route.ts      # POST /api/auth/logout</div>
                    <div className="ml-4">│   └── crearusuario/route.ts # POST /api/auth/crearusuario</div>
                    <div className="ml-4">├── users/                   # Gestión de usuarios</div>
                    <div className="ml-4">│   ├── route.ts             # GET, POST /api/users</div>
                    <div className="ml-4">│   └── [id]/route.ts        # GET, PUT, DELETE /api/users/[id]</div>
                    <div className="ml-4">├── directions/              # Direcciones</div>
                    <div className="ml-4">│   └── route.ts             # GET, POST /api/directions</div>
                    <div className="ml-4">├── services/                # Servicios</div>
                    <div className="ml-4">│   └── route.ts             # GET, POST /api/services</div>
                    <div className="ml-4">├── notifications/            # Notificaciones</div>
                    <div className="ml-4">│   └── route.ts             # GET, POST /api/notifications</div>
                    <div className="ml-4">├── profile/                 # Perfil de usuario</div>
                    <div className="ml-4">│   └── route.ts             # GET, PUT /api/profile</div>
                    <div className="ml-4">├── audit-log/               # Log de auditoría</div>
                    <div className="ml-4">│   └── route.ts             # GET /api/audit-log</div>
                    <div className="ml-4">└── ping/                    # Health check</div>
                    <div className="ml-4">    └── route.ts             # GET /api/ping</div>
                </div>
            </div>

            {/* Authentication Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Shield className="w-6 h-6 text-accent-600 mr-3" />
                    Endpoints de Autenticación
                </h3>

                <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">POST /api/auth/login</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Autentica un usuario con email y contraseña, retorna un JWT.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Request Body:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"email": "user@example.com",</span><br />
                                <span className="ml-4">"password": "password123"</span><br />
                                {`}`}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 mt-3">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Response:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"success": true,</span><br />
                                <span className="ml-4">"user": {`{`} "id", "email", "role" {`}`},</span><br />
                                <span className="ml-4">"message": "Login exitoso"</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">POST /api/auth/logout</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Cierra la sesión del usuario y invalida el JWT.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Headers:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                Authorization: Bearer {`<jwt_token>`}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">POST /api/auth/crearusuario</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Crea un nuevo usuario (solo administradores).
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Request Body:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"name": "Nuevo Usuario",</span><br />
                                <span className="ml-4">"email": "nuevo@example.com",</span><br />
                                <span className="ml-4">"password": "password123",</span><br />
                                <span className="ml-4">"role": "user"</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Management Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Gestión de Usuarios</h3>

                <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">GET /api/users</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Obtiene la lista de usuarios con paginación y filtros.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Query Parameters:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                ?page=1&limit=10&role=admin&search=nombre
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">GET /api/users/[id]</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Obtiene información detallada de un usuario específico.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Response:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"id": "user_id",</span><br />
                                <span className="ml-4">"name": "Nombre Usuario",</span><br />
                                <span className="ml-4">"email": "user@example.com",</span><br />
                                <span className="ml-4">"role": "admin",</span><br />
                                <span className="ml-4">"createdAt": "2024-01-01T00:00:00Z"</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">PUT /api/users/[id]</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Actualiza la información de un usuario existente.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Request Body:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"name": "Nombre Actualizado",</span><br />
                                <span className="ml-4">"role": "user",</span><br />
                                <span className="ml-4">"isInvisible": false</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Endpoints de Datos</h3>

                <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">GET /api/directions</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Obtiene la lista de direcciones organizadas por orden de visualización.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Response:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"directions": [</span><br />
                                <span className="ml-8">{`{`} "id", "name", "description", "displayOrder" {`}`}</span><br />
                                <span className="ml-4">]</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">GET /api/services</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Obtiene la lista de servicios con información de sus direcciones asociadas.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Query Parameters:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                ?directionId=direction_id&search=servicio
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h4 className="font-semibold text-secondary-900 mb-3">GET /api/notifications</h4>
                        <p className="text-secondary-700 text-sm mb-3">
                            Obtiene las notificaciones del usuario autenticado.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-secondary-900 mb-2">Response:</div>
                            <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                                {`{`}<br />
                                <span className="ml-4">"notifications": [</span><br />
                                <span className="ml-8">{`{`} "id", "title", "message", "read", "createdAt" {`}`}</span><br />
                                <span className="ml-4">]</span><br />
                                {`}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation and Error Handling */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Validación y Manejo de Errores</h3>

                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-secondary-900 mb-2">Validación con Zod</h4>
                        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
                            <div>{`import { z } from 'zod';`}</div>
                            <div className="mt-2">const UserSchema = z.object({`{`}</div>
                            <div className="ml-4">name: z.string().min(1, "Nombre requerido"),</div>
                            <div className="ml-4">email: z.string().email("Email inválido"),</div>
                            <div className="ml-4">role: z.enum(["admin", "user"])</div>
                            <div>{`}`});</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-secondary-900 mb-2">Manejo de Errores HTTP</h4>
                        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
                            <div>// Códigos de estado estándar</div>
                            <div>200: OK - Operación exitosa</div>
                            <div>201: Created - Recurso creado</div>
                            <div>400: Bad Request - Datos inválidos</div>
                            <div>401: Unauthorized - No autenticado</div>
                            <div>403: Forbidden - No autorizado</div>
                            <div>404: Not Found - Recurso no encontrado</div>
                            <div>500: Internal Server Error - Error del servidor</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Security */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Shield className="w-6 h-6 text-accent-600 mr-3" />
                    Seguridad de la API
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-secondary-900 mb-3">Autenticación</h4>
                        <ul className="space-y-2 text-sm text-secondary-700">
                            <li>• JWT en cookies httpOnly</li>
                            <li>• Verificación en middleware</li>
                            <li>• Expiración automática</li>
                            <li>• Regeneración de tokens</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-secondary-900 mb-3">Autorización</h4>
                        <ul className="space-y-2 text-sm text-secondary-700">
                            <li>• Verificación de roles por ruta</li>
                            <li>• Permisos granulares</li>
                            <li>• Auditoría de accesos</li>
                            <li>• Rate limiting</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Testing and Monitoring */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 text-accent-600 mr-3" />
                    Testing y Monitoreo
                </h3>

                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Testing Unitario</h4>
                            <p className="text-secondary-700 text-sm">
                                Tests individuales para cada endpoint con Jest y Testing Library.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Testing de Integración</h4>
                            <p className="text-secondary-700 text-sm">
                                Tests de flujos completos de la API con base de datos de prueba.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Monitoreo en Tiempo Real</h4>
                            <p className="text-secondary-700 text-sm">
                                Logs de performance, errores y métricas de uso de la API.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* OpenAPI Documentation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <FileText className="w-6 h-6 text-accent-600 mr-3" />
                    Documentación OpenAPI
                </h3>

                <div className="space-y-4">
                    <p className="text-secondary-700">
                        La API está documentada usando OpenAPI 3.0 con Swagger UI para facilitar el desarrollo
                        y testing de endpoints.
                    </p>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-secondary-900 mb-2">Características de la Documentación</h4>
                        <ul className="space-y-2 text-sm text-secondary-700">
                            <li>• Esquemas de request/response</li>
                            <li>• Ejemplos de uso</li>
                            <li>• Códigos de error</li>
                            <li>• Autenticación y autorización</li>
                            <li>• Testing interactivo</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Future Improvements */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 text-accent-600 mr-3" />
                    Mejoras Futuras
                </h3>

                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">GraphQL</h4>
                            <p className="text-secondary-700 text-sm">
                                Implementación de GraphQL para consultas más eficientes y flexibles.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">WebSockets</h4>
                            <p className="text-secondary-700 text-sm">
                                Comunicación en tiempo real para notificaciones y actualizaciones.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Versionado de API</h4>
                            <p className="text-secondary-700 text-sm">
                                Sistema de versionado para mantener compatibilidad hacia atrás.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
                        <div>
                            <h4 className="font-semibold text-secondary-900">Cache y Performance</h4>
                            <p className="text-secondary-700 text-sm">
                                Implementación de Redis para cache y optimización de consultas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                <Link
                    href="/documentacion/autenticacion"
                    className="flex items-center text-accent-600 hover:text-accent-700 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior: Autenticación
                </Link>

                <Link
                    href="/documentacion/componentes"
                    className="flex items-center text-accent-600 hover:text-accent-700 font-medium"
                >
                    Siguiente: Componentes de la Interfaz
                    <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
    );
}
