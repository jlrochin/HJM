import { Database, ArrowLeft, Table, Key, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';

export default function BaseDatosPage() {
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
                    <Database className="w-10 h-10 text-accent-600 mr-3" />
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Base de Datos
                    </h1>
                </div>
                <p className="text-lg text-secondary-600">
                    Esquema de base de datos, migraciones y configuración Prisma
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Configuración Prisma
                </h2>
                <p className="text-secondary-600 mb-4">
                    El sistema utiliza Prisma ORM para gestionar la base de datos PostgreSQL.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                    <div>DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/cagpu"</div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Comandos Útiles
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <RefreshCw className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">Generar Cliente</h4>
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">npx prisma generate</code>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Table className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">Sincronizar Esquema</h4>
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">npx prisma db push</code>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Eye className="w-6 h-6 text-accent-600" />
                        <div>
                            <h4 className="font-semibold text-secondary-900">Abrir Prisma Studio</h4>
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">npx prisma studio</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
