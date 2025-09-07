'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Palette,
  Box,
  Layout,
  Eye,
  Zap,
  ExternalLink,
  CheckCircle,
  Code,
  Smartphone,
  Monitor,
  Layers
} from 'lucide-react';

export default function ComponentesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-secondary-900 mb-4">
          Componentes de la Interfaz
        </h2>
        <p className="text-xl text-secondary-600">
          Sistema de diseño, componentes principales y arquitectura de la UI
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
          <Palette className="w-6 h-6 text-accent-600 mr-3" />
          Visión General del Sistema de Diseño
        </h3>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-secondary-700 mb-6">
            El sistema CAGPU utiliza una arquitectura de componentes basada en React con TypeScript,
            implementando un sistema de diseño coherente con Tailwind CSS y componentes reutilizables.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-secondary-900 mb-2">Tecnologías</h4>
              <ul className="space-y-1 text-sm text-secondary-700">
                <li>• React 18 con TypeScript</li>
                <li>• Tailwind CSS para estilos</li>
                <li>• Radix UI para componentes base</li>
                <li>• Framer Motion para animaciones</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-secondary-900 mb-2">Principios</h4>
              <ul className="space-y-1 text-sm text-secondary-700">
                <li>• Componentes reutilizables</li>
                <li>• Props tipadas</li>
                <li>• Composición sobre herencia</li>
                <li>• Accesibilidad por defecto</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Component Architecture */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
          <Layers className="w-6 h-6 text-accent-600 mr-3" />
          Arquitectura de Componentes
        </h3>

        <div className="bg-slate-900 text-slate-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          <div className="text-slate-400 mb-2"># Estructura de directorios de componentes</div>
          <div>components/</div>
          <div className="ml-4">├── ui/                      # Componentes base reutilizables</div>
          <div className="ml-4">│   ├── button.tsx           # Botones con variantes</div>
          <div className="ml-4">│   ├── card.tsx             # Contenedores de tarjetas</div>
          <div className="ml-4">│   ├── dialog.tsx           # Modales y diálogos</div>
          <div className="ml-4">│   ├── form.tsx             # Componentes de formulario</div>
          <div className="ml-4">│   ├── table.tsx            # Tablas de datos</div>
          <div className="ml-4">│   └── ...                  # Otros componentes base</div>
          <div className="ml-4">├── header.tsx               # Header principal</div>
          <div className="ml-4">├── mobile-sidebar.tsx       # Sidebar móvil</div>
          <div className="ml-4">├── dashboard-overview.tsx   # Vista general del dashboard</div>
          <div className="ml-4">├── service-management.tsx   # Gestión de servicios</div>
          <div className="ml-4">├── notifications-popover.tsx # Popover de notificaciones</div>
          <div className="ml-4">└── ...                      # Otros componentes específicos</div>
        </div>
      </div>

      {/* Design System */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Sistema de Diseño</h3>

        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Paleta de Colores</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-600 rounded-lg mx-auto mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Accent-600</div>
                <div className="text-xs text-secondary-600">#dc2626</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-900 rounded-lg mx-auto mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Secondary-900</div>
                <div className="text-xs text-secondary-600">#1E293B</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success rounded-lg mx-auto mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Success</div>
                <div className="text-xs text-secondary-600">#10B981</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-warning rounded-lg mx-auto mb-2"></div>
                <div className="text-sm font-medium text-secondary-900">Warning</div>
                <div className="text-xs text-secondary-600">#F59E0B</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Tipografía</h4>
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">Título Principal (text-3xl)</h1>
                <p className="text-sm text-secondary-600">Para encabezados de página y títulos principales</p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-secondary-900">Título Secundario (text-2xl)</h2>
                <p className="text-sm text-secondary-600">Para secciones y subtítulos</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-secondary-900">Título Terciario (text-xl)</h3>
                <p className="text-sm text-secondary-600">Para encabezados de componentes</p>
              </div>
              <div>
                <p className="text-base text-secondary-700">Texto del cuerpo (text-base)</p>
                <p className="text-sm text-secondary-600">Para contenido principal y descripciones</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Espaciado y Layout</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-secondary-900 mb-2">Espaciado</h5>
                <div className="space-y-2 text-sm text-secondary-700">
                  <div>• p-2: 8px (padding pequeño)</div>
                  <div>• p-4: 16px (padding estándar)</div>
                  <div>• p-6: 24px (padding mediano)</div>
                  <div>• p-8: 32px (padding grande)</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-secondary-900 mb-2">Bordes y Sombras</h5>
                <div className="space-y-2 text-sm text-secondary-700">
                  <div>• rounded-lg: 8px (bordes redondeados)</div>
                  <div>• rounded-xl: 12px (bordes más redondeados)</div>
                  <div>• shadow-sm: Sombra sutil</div>
                  <div>• shadow-md: Sombra media</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base UI Components */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Componentes Base (UI)</h3>

        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Button Component</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Componente de botón con múltiples variantes y estados.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Props:</div>
              <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                <div>interface ButtonProps {`{`}</div>
                <div className="ml-4">variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"</div>
                <div className="ml-4">size?: "default" | "sm" | "lg" | "icon"</div>
                <div className="ml-4">disabled?: boolean</div>
                <div className="ml-4">children: React.ReactNode</div>
                <div className="ml-4">onClick?: () =&gt; void</div>
                <div>{`}`}</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 mt-3">
              <div className="text-sm font-medium text-secondary-900 mb-2">Uso:</div>
              <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                <div>&lt;Button variant="default" size="lg"&gt;</div>
                <div className="ml-4">Guardar Cambios</div>
                <div>&lt;/Button&gt;</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Card Component</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Contenedor de tarjeta con header, contenido y footer opcionales.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Props:</div>
              <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                <div>interface CardProps {`{`}</div>
                <div className="ml-4">className?: string</div>
                <div className="ml-4">children: React.ReactNode</div>
                <div>{`}`}</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 mt-3">
              <div className="text-sm font-medium text-secondary-900 mb-2">Uso:</div>
              <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                <div>&lt;Card&gt;</div>
                <div className="ml-4">&lt;CardHeader&gt;</div>
                <div className="ml-8">&lt;CardTitle&gt;Título&lt;/CardTitle&gt;</div>
                <div className="ml-4">&lt;/CardHeader&gt;</div>
                <div className="ml-4">&lt;CardContent&gt;Contenido&lt;/CardContent&gt;</div>
                <div>&lt;/Card&gt;</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Dialog Component</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Modal y diálogos para confirmaciones y formularios.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Props:</div>
              <div className="bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs">
                <div>interface DialogProps {`{`}</div>
                <div className="ml-4">open: boolean</div>
                <div className="ml-4">onOpenChange: (open: boolean) =&gt; void</div>
                <div className="ml-4">children: React.ReactNode</div>
                <div>{`}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Components */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Componentes de Aplicación</h3>

        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Header Component</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Header principal con navegación, notificaciones y perfil de usuario.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Características:</div>
              <ul className="space-y-1 text-sm text-secondary-700">
                <li>• Logo y nombre del sistema</li>
                <li>• Toggle de tema (claro/oscuro)</li>
                <li>• Popover de notificaciones</li>
                <li>• Menú de usuario con dropdown</li>
                <li>• Logout automático por inactividad</li>
              </ul>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Dashboard Overview</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Vista general del dashboard con métricas y estadísticas.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Características:</div>
              <ul className="space-y-1 text-sm text-secondary-700">
                <li>• Tarjetas de métricas principales</li>
                <li>• Gráficos de actividad reciente</li>
                <li>• Lista de tareas pendientes</li>
                <li>• Accesos rápidos a funciones</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Service Management</h4>
            <p className="text-secondary-700 text-sm mb-3">
              Gestión completa de servicios con CRUD operations.
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-secondary-900 mb-2">Características:</div>
              <ul className="space-y-1 text-sm text-secondary-700">
                <li>• Tabla de servicios con paginación</li>
                <li>• Formulario de creación/edición</li>
                <li>• Filtros por dirección</li>
                <li>• Búsqueda en tiempo real</li>
                <li>• Acciones de editar/eliminar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Design */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
          <Smartphone className="w-6 h-6 text-accent-600 mr-3" />
          Diseño Responsive
        </h3>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Monitor className="w-8 h-8 text-accent-600 mx-auto mb-2" />
              <h4 className="font-semibold text-secondary-900">Desktop</h4>
              <p className="text-sm text-secondary-600">≥1024px</p>
              <div className="text-xs text-secondary-500 mt-2">
                Sidebar fijo, layout completo
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Smartphone className="w-8 h-8 text-accent-600 mx-auto mb-2" />
              <h4 className="font-semibold text-secondary-900">Mobile</h4>
              <p className="text-sm text-secondary-600">&lt;768px</p>
              <div className="text-xs text-secondary-500 mt-2">
                Sidebar móvil, navegación táctil
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Layout className="w-8 h-8 text-accent-600 mx-auto mb-2" />
              <h4 className="font-semibold text-secondary-900">Tablet</h4>
              <p className="text-sm text-secondary-600">768px-1023px</p>
              <div className="text-xs text-secondary-500 mt-2">
                Layout adaptativo, sidebar colapsable
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-2">Breakpoints de Tailwind</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-secondary-900">sm:</div>
                <div className="text-secondary-600">≥640px (móvil grande)</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">md:</div>
                <div className="text-secondary-600">≥768px (tablet)</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">lg:</div>
                <div className="text-secondary-600">≥1024px (desktop)</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">xl:</div>
                <div className="text-secondary-600">≥1280px (desktop grande)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
          <Eye className="w-6 h-6 text-accent-600 mr-3" />
          Accesibilidad
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">ARIA Labels</h4>
              <p className="text-secondary-700 text-sm">
                Todos los componentes incluyen atributos ARIA apropiados para lectores de pantalla.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Navegación por Teclado</h4>
              <p className="text-secondary-700 text-sm">
                Soporte completo para navegación usando Tab, Enter, Escape y flechas.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Contraste de Colores</h4>
              <p className="text-secondary-700 text-sm">
                Paleta de colores diseñada para cumplir con estándares WCAG 2.1 AA.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Focus Management</h4>
              <p className="text-secondary-700 text-sm">
                Indicadores visuales claros para el elemento activo y manejo de focus en modales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Optimization */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center">
          <Zap className="w-6 h-6 text-accent-600 mr-3" />
          Optimización de Performance
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Lazy Loading</h4>
              <p className="text-secondary-700 text-sm">
                Componentes pesados se cargan solo cuando son necesarios.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Memoización</h4>
              <p className="text-secondary-700 text-sm">
                Uso de React.memo y useMemo para evitar re-renders innecesarios.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Code Splitting</h4>
              <p className="text-secondary-700 text-sm">
                División automática del código por rutas y componentes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Virtualización</h4>
              <p className="text-secondary-700 text-sm">
                Listas largas se renderizan solo los elementos visibles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Testing */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-secondary-900 mb-6">Testing de Componentes</h3>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-2">Testing Unitario</h4>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
              <div>// Component.test.tsx</div>
              <div className="mt-2">{`import { render, screen } from '@testing-library/react'`}</div>
              <div>{`import { Button } from './Button'`}</div>
              <div className="mt-2">test('renders button with correct text', () =&gt; {`{`}</div>
              <div className="ml-4">render(&lt;Button&gt;Click me&lt;/Button&gt;)</div>
              <div className="ml-4">expect(screen.getByText('Click me')).toBeInTheDocument()</div>
              <div>{`}`})</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-secondary-900 mb-2">Testing de Integración</h4>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
              <div>// Form.test.tsx</div>
              <div className="mt-2">{`test('submits form with user data', async () =&gt; {`}</div>
              <div className="ml-4">{`const mockSubmit = jest.fn()`}</div>
              <div className="ml-4">{`render(<UserForm onSubmit={mockSubmit} />)`}</div>
              <div className="ml-4">// Simular interacciones del usuario...</div>
              <div>{`})`}</div>
            </div>
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
              <h4 className="font-semibold text-secondary-900">Storybook</h4>
              <p className="text-secondary-700 text-sm">
                Documentación interactiva de componentes con ejemplos y variantes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Design Tokens</h4>
              <p className="text-secondary-700 text-sm">
                Sistema centralizado de tokens de diseño para mayor consistencia.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-semibold text-secondary-900">Component Library</h4>
              <p className="text-secondary-700 text-sm">
                Biblioteca de componentes publicable para reutilización en otros proyectos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200">
        <Link
          href="/documentacion/api"
          className="flex items-center text-accent-600 hover:text-accent-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior: API y Endpoints
        </Link>

        <Link
          href="/documentacion/paginas"
          className="flex items-center text-accent-600 hover:text-accent-700 font-medium"
        >
          Siguiente: Páginas y Rutas
          <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
