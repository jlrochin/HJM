'use client'

import { Users, BarChart3, ArrowRight, Building2 } from 'lucide-react'

export default function HomePage() {
  const handleModuleClick = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Portal de Acceso HJM
                </h1>
                <p className="text-xs text-gray-500">Versión 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Seleccione un Módulo
          </h2>
          <p className="text-gray-600">
            Acceda a los sistemas especializados del hospital
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Módulo de Atención al Usuario */}
          <div
            className="bg-white border-2 border-gray-300 rounded-lg p-8 hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleModuleClick('/mau')}
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Atención al Usuario
                </h3>
                <p className="text-sm text-gray-500">MAU</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Gestión de pacientes, recetas médicas y atención hospitalaria
            </p>

            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium">Acceder</span>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Módulo de Informes */}
          <div
            className="bg-white border-2 border-gray-300 rounded-lg p-8 hover:border-green-600 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleModuleClick('/cagpu')}
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Módulo de Informes
                </h3>
                <p className="text-sm text-gray-500">CAGPU</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Reportes, análisis estadísticos y métricas del sistema
            </p>

            <div className="flex items-center justify-between">
              <span className="text-green-600 font-medium">Acceder</span>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Portal de Acceso
          </p>
        </div>
      </footer>
    </div>
  )
}