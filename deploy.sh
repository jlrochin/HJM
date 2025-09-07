#!/bin/bash

# Script de despliegue manual para HJM
# Uso: ./deploy.sh
# Autor: Sistema HJM
# Descripción: Actualiza todos los servicios del stack HJM

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -f, --force    Forzar actualización sin confirmación"
    echo "  -s, --service  Actualizar solo un servicio específico"
    echo "  --logs         Mostrar logs después del despliegue"
    echo ""
    echo "Ejemplos:"
    echo "  $0                    # Despliegue completo con confirmación"
    echo "  $0 --force           # Despliegue completo sin confirmación"
    echo "  $0 --service cagpu-frontend  # Actualizar solo CAGPU frontend"
    echo "  $0 --logs            # Despliegue completo y mostrar logs"
}

# Variables por defecto
FORCE=false
SERVICE=""
SHOW_LOGS=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        *)
            print_message $RED "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Banner de inicio
print_message $BLUE "╔══════════════════════════════════════════════════════════════╗"
print_message $BLUE "║                    🚀 HJM DEPLOYMENT SCRIPT                ║"
print_message $BLUE "║                                                              ║"
print_message $BLUE "║  Sistema de despliegue automatizado para HJM                 ║"
print_message $BLUE "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_message $RED "❌ Error: docker-compose.yml no encontrado"
    print_message $YELLOW "   Asegúrate de ejecutar este script desde el directorio del proyecto"
    print_message $YELLOW "   Directorio actual: $(pwd)"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    print_message $RED "❌ Error: Docker no está corriendo"
    print_message $YELLOW "   Inicia Docker antes de ejecutar este script"
    exit 1
fi

# Mostrar información del sistema
print_message $BLUE "📋 Información del sistema:"
echo "   Directorio: $(pwd)"
echo "   Usuario: $(whoami)"
echo "   Fecha: $(date)"
echo "   Docker version: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
echo "   Docker Compose version: $(docker compose version --short)"
echo ""

# Mostrar estado actual
print_message $BLUE "📊 Estado actual de los contenedores:"
docker compose ps
echo ""

# Confirmación (si no es forzado)
if [ "$FORCE" = false ]; then
    print_message $YELLOW "⚠️  ¿Continuar con el despliegue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_message $YELLOW "❌ Despliegue cancelado por el usuario"
        exit 0
    fi
fi

# Función para actualizar un servicio específico
update_service() {
    local service_name=$1
    print_message $BLUE "🔄 Actualizando servicio: $service_name"
    
    # Verificar que el servicio existe en docker-compose.yml
    if ! docker compose config --services | grep -q "^$service_name$"; then
        print_message $RED "❌ Error: Servicio '$service_name' no encontrado"
        print_message $YELLOW "   Servicios disponibles:"
        docker compose config --services | sed 's/^/     - /'
        exit 1
    fi
    
    # Descargar imagen del servicio específico
    docker compose pull "$service_name"
    
    # Reiniciar el servicio específico
    docker compose up -d "$service_name"
    
    print_message $GREEN "✅ Servicio $service_name actualizado correctamente"
}

# Función para actualizar todos los servicios
update_all_services() {
    print_message $BLUE "🔄 Descargando últimas imágenes de todos los servicios..."
    docker compose pull
    
    print_message $BLUE "🔄 Reiniciando todos los servicios..."
    docker compose up -d
    
    print_message $GREEN "✅ Todos los servicios actualizados correctamente"
}

# Ejecutar actualización
if [ -n "$SERVICE" ]; then
    update_service "$SERVICE"
else
    update_all_services
fi

echo ""

# Mostrar estado final
print_message $BLUE "📊 Estado final de los contenedores:"
docker compose ps
echo ""

# Mostrar información de las imágenes
print_message $BLUE "🖼️  Imágenes actuales:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep ghcr.io
echo ""

# Mostrar logs si se solicita
if [ "$SHOW_LOGS" = true ]; then
    print_message $BLUE "📝 Mostrando logs de los servicios (Ctrl+C para salir):"
    echo ""
    docker compose logs -f
else
    print_message $GREEN "🎉 ¡Despliegue completado exitosamente!"
    echo ""
    print_message $YELLOW "📝 Comandos útiles:"
    echo "   Ver logs en tiempo real:     docker compose logs -f"
    echo "   Ver logs de un servicio:    docker compose logs -f [nombre-servicio]"
    echo "   Ver estado de servicios:     docker compose ps"
    echo "   Ver uso de recursos:         docker stats"
    echo "   Reiniciar un servicio:       docker compose restart [nombre-servicio]"
    echo "   Ver logs de Watchtower:     docker logs watchtower"
    echo ""
    print_message $BLUE "🔍 Para monitorear el despliegue en tiempo real:"
    echo "   docker compose logs -f"
fi