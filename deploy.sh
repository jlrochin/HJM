#!/bin/bash

# ============================================================================
# SCRIPT DE DESPLIEGUE PARA HJM
# ============================================================================
# Este script automatiza el despliegue de todos los servicios:
# - home: Frontend Next.js en la raíz
# - cagpu: Frontend y Backend Next.js bajo /cagpu
# - mau: Frontend Vite y Backend Django bajo /mau
# - Traefik: Proxy inverso para enrutamiento
# ============================================================================

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando despliegue de HJM..."

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose"
    exit 1
fi

# Verificar que los archivos de entorno existan
if [ ! -f "cagpu.env" ]; then
    echo "❌ Error: Archivo cagpu.env no encontrado"
    exit 1
fi

if [ ! -f "cagpu-db.env" ]; then
    echo "❌ Error: Archivo cagpu-db.env no encontrado"
    exit 1
fi

if [ ! -f "mau.env" ]; then
    echo "❌ Error: Archivo mau.env no encontrado"
    exit 1
fi

if [ ! -f "mau-db.env" ]; then
    echo "❌ Error: Archivo mau-db.env no encontrado"
    exit 1
fi

echo "✅ Archivos de entorno verificados"

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down --remove-orphans

# Limpiar imágenes huérfanas (opcional)
echo "🧹 Limpiando imágenes huérfanas..."
docker system prune -f

# Construir y levantar todos los servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

# Verificar que Traefik esté funcionando
echo "🔍 Verificando Traefik..."
if curl -s http://localhost > /dev/null; then
    echo "✅ Traefik está funcionando correctamente"
else
    echo "❌ Error: Traefik no responde"
    exit 1
fi

# Mostrar información de acceso
echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📋 Servicios disponibles:"
echo "   🏠 Home:           http://localhost/"
echo "   🏥 CAGPU Frontend: http://localhost/cagpu"
echo "   🔧 CAGPU API:      http://localhost/cagpu/api"
echo "   🏥 MAU Frontend:   http://localhost/mau"
echo "   🔧 MAU API:        http://localhost/mau/api"
echo ""
echo "📊 Para ver logs: docker-compose logs -f [servicio]"
echo "🛑 Para detener:   docker-compose down"
echo "🔄 Para reiniciar: docker-compose restart [servicio]"
echo ""
