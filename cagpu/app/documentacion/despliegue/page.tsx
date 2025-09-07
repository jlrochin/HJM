'use client';

// ============================================================================
// PÁGINA DE DOCUMENTACIÓN DE DESPLIEGUE
// ============================================================================
// Esta página proporciona una guía completa para el despliegue del sistema CAGPU
// en diferentes entornos (desarrollo, staging, producción).
// 
// Estructura:
// - Pasos de despliegue organizados por categorías
// - Configuración de entornos con variables específicas
// - Comandos de despliegue esenciales
// ============================================================================

import {
    Server,
    Database,
    Shield,
    Code,
    Settings,
    Globe,
    Terminal,
    GitBranch
} from 'lucide-react';
import { ReactNode } from 'react';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================
interface DeploymentStep {
    title: string;
    description: string;
    icon: ReactNode;
    steps: string[];
}

interface Environment {
    name: string;
    description: string;
    icon: ReactNode;
    config: Record<string, string>;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function DesplieguePage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Encabezado de la página */}
            <PageHeader />

            {/* Pasos de despliegue organizados por categorías */}
            <DeploymentSteps />

            {/* Configuración específica para cada entorno */}
            <EnvironmentConfigs />

            {/* Comandos esenciales para el despliegue */}
            <DeploymentCommands />
        </div>
    );
}

// ============================================================================
// COMPONENTE: ENCABEZADO DE PÁGINA
// ============================================================================
function PageHeader() {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <Server className="w-8 h-8 text-accent-600" />
                <h1 className="text-3xl font-bold text-secondary-900">
                    Despliegue y Configuración
                </h1>
            </div>
            <p className="text-lg text-secondary-600">
                Guía completa para el despliegue del sistema CAGPU en diferentes entornos.
            </p>
        </div>
    );
}

// ============================================================================
// COMPONENTE: PASOS DE DESPLIEGUE
// ============================================================================
function DeploymentSteps() {
    // Datos de los pasos de despliegue organizados por categorías
    const deploymentSteps: DeploymentStep[] = [
        {
            title: 'Preparación del Entorno',
            description: 'Configuración inicial del servidor y dependencias del sistema',
            icon: <Settings className="w-6 h-6" />,
            steps: [
                'Instalación de Node.js 18+',
                'Configuración de PostgreSQL',
                'Variables de entorno',
                'Dependencias del sistema'
            ]
        },
        {
            title: 'Configuración de Base de Datos',
            description: 'Preparación y migración de la base de datos',
            icon: <Database className="w-6 h-6" />,
            steps: [
                'Crear base de datos PostgreSQL',
                'Configurar conexiones',
                'Ejecutar migraciones Prisma',
                'Verificar esquemas'
            ]
        },
        {
            title: 'Configuración de Seguridad',
            description: 'Implementación de medidas de seguridad esenciales',
            icon: <Shield className="w-6 h-6" />,
            steps: [
                'Configurar HTTPS/SSL',
                'Firewall y puertos',
                'Variables de entorno seguras',
                'Rate limiting'
            ]
        },
        {
            title: 'Build y Despliegue',
            description: 'Proceso de construcción y despliegue en producción',
            icon: <Code className="w-6 h-6" />,
            steps: [
                'Build de producción',
                'Optimización de assets',
                'Configuración de PM2',
                'Reinicio de servicios'
            ]
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 mb-12">
            {deploymentSteps.map((step, index) => (
                <DeploymentStepCard
                    key={index}
                    step={step}
                />
            ))}
        </div>
    );
}

// ============================================================================
// COMPONENTE: TARJETA DE PASO DE DESPLIEGUE
// ============================================================================
function DeploymentStepCard({ step }: { step: DeploymentStep }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {/* Encabezado de la tarjeta */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-50 rounded-lg text-accent-600">
                    {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900">
                    {step.title}
                </h3>
            </div>

            {/* Descripción del paso */}
            <p className="text-secondary-600 mb-4">
                {step.description}
            </p>

            {/* Lista numerada de pasos */}
            <ol className="space-y-2">
                {step.steps.map((stepItem: string, stepIndex: number) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-secondary-700">
                        <span className="flex-shrink-0 w-5 h-5 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                        </span>
                        {stepItem}
                    </li>
                ))}
            </ol>
        </div>
    );
}

// ============================================================================
// COMPONENTE: CONFIGURACIÓN DE ENTORNOS
// ============================================================================
function EnvironmentConfigs() {
    // Configuración específica para cada entorno de despliegue
    const environments: Environment[] = [
        {
            name: 'Desarrollo Local',
            description: 'Entorno para desarrollo y testing local',
            icon: <Terminal className="w-5 h-5" />,
            config: {
                'NODE_ENV': 'development',
                'PORT': '3000',
                'DATABASE_URL': 'postgresql://localhost:5432/cagpu_dev'
            }
        },
        {
            name: 'Staging',
            description: 'Entorno de pruebas previas a producción',
            icon: <GitBranch className="w-5 h-5" />,
            config: {
                'NODE_ENV': 'staging',
                'PORT': '3001',
                'DATABASE_URL': 'postgresql://staging:5432/cagpu_staging'
            }
        },
        {
            name: 'Producción',
            description: 'Entorno de producción para usuarios finales',
            icon: <Globe className="w-5 h-5" />,
            config: {
                'NODE_ENV': 'production',
                'PORT': '3000',
                'DATABASE_URL': 'postgresql://prod:5432/cagpu_prod'
            }
        }
    ];

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Configuración de Entornos
            </h2>
            <div className="grid gap-6">
                {environments.map((env, index) => (
                    <EnvironmentCard
                        key={index}
                        environment={env}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENTE: TARJETA DE ENTORNO
// ============================================================================
function EnvironmentCard({ environment }: { environment: Environment }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {/* Encabezado del entorno */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-secondary-600">
                    {environment.icon}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-secondary-900">
                        {environment.name}
                    </h3>
                    <p className="text-secondary-600">
                        {environment.description}
                    </p>
                </div>
            </div>

            {/* Variables de entorno específicas */}
            <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-secondary-800 mb-3">
                    Variables de Entorno:
                </h4>
                <div className="space-y-2">
                    {Object.entries(environment.config).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                            <code className="bg-white px-2 py-1 rounded border font-mono text-accent-600">
                                {key}
                            </code>
                            <span className="text-secondary-500">=</span>
                            <code className="bg-white px-2 py-1 rounded border font-mono text-secondary-600">
                                {value}
                            </code>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENTE: COMANDOS DE DESPLIEGUE
// ============================================================================
function DeploymentCommands() {
    return (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Comandos de Despliegue
            </h3>

            <div className="space-y-4">
                {/* Instalación de dependencias */}
                <CommandSection
                    title="Instalación de Dependencias"
                    command="npm install"
                />

                {/* Build de producción */}
                <CommandSection
                    title="Build de Producción"
                    command="npm run build"
                />

                {/* Inicio del servidor */}
                <CommandSection
                    title="Iniciar Servidor"
                    command="npm start"
                />
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENTE: SECCIÓN DE COMANDO
// ============================================================================
function CommandSection({ title, command }: { title: string; command: string }) {
    return (
        <div>
            <h4 className="font-medium text-secondary-800 mb-2">
                {title}
            </h4>
            <code className="block bg-white p-3 rounded-lg border font-mono text-sm">
                {command}
            </code>
        </div>
    );
}
