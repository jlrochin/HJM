'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    Menu,
    X,
    ChevronRight,
    Search
} from 'lucide-react';

const navigation = [
    { title: 'Inicio', href: '/documentacion', icon: <BookOpen className="w-4 h-4" /> },
    { title: 'Arquitectura', href: '/documentacion/arquitectura', icon: <Layers className="w-4 h-4" /> },
    { title: 'Base de Datos', href: '/documentacion/base-datos', icon: <Database className="w-4 h-4" /> },
    { title: 'Autenticación', href: '/documentacion/autenticacion', icon: <Shield className="w-4 h-4" /> },
    { title: 'API y Endpoints', href: '/documentacion/api', icon: <Code className="w-4 h-4" /> },
    { title: 'Componentes', href: '/documentacion/componentes', icon: <Palette className="w-4 h-4" /> },
    { title: 'Páginas y Rutas', href: '/documentacion/paginas', icon: <FileText className="w-4 h-4" /> },
    { title: 'Estado y Datos', href: '/documentacion/estado', icon: <Layers className="w-4 h-4" /> },
    { title: 'Utilidades', href: '/documentacion/utilidades', icon: <Wrench className="w-4 h-4" /> },
    { title: 'Despliegue', href: '/documentacion/despliegue', icon: <Server className="w-4 h-4" /> },
    { title: 'Mantenimiento', href: '/documentacion/mantenimiento', icon: <Settings className="w-4 h-4" /> },
];

export default function DocumentacionLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Establecer atributo para CSS reset
        document.body.setAttribute('data-documentation', 'true');

        return () => {
            // Limpiar al desmontar
            document.body.removeAttribute('data-documentation');
        };
    }, []);

    return (
        <div className="h-screen bg-slate-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Sidebar header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="w-8 h-8 text-accent-600" />
                        <span className="text-xl font-bold text-secondary-900">CAGPU Docs</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search bar */}
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Buscar en la documentación..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-accent-50 text-accent-700 border-r-2 border-accent-600'
                                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-slate-100'
                                    }
                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="text-secondary-500">{item.icon}</span>
                                <span>{item.title}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-slate-200">
                    <div className="text-xs text-secondary-500 text-center">
                        <p>Documentación CAGPU</p>
                        <p>v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 bg-white pt-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
