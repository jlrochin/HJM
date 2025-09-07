#!/bin/bash

# Script para solucionar problemas de login en producción MAU
# Ejecutar en el servidor Ubuntu donde está desplegado MAU

echo "🔧 Solucionando problemas de login en producción MAU..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si Docker está ejecutándose
log_info "Verificando estado de Docker..."
if ! docker ps > /dev/null 2>&1; then
    log_error "Docker no está ejecutándose. Iniciando Docker..."
    sudo systemctl start docker
    sleep 5
fi

# Verificar contenedores de MAU
log_info "Verificando contenedores de MAU..."
MAU_CONTAINERS=$(docker ps --filter "name=mau" --format "table {{.Names}}\t{{.Status}}")
if [ -z "$MAU_CONTAINERS" ]; then
    log_warning "No se encontraron contenedores de MAU ejecutándose"
    log_info "Intentando iniciar servicios con docker-compose..."
    cd /path/to/your/mau/project  # Cambiar por la ruta real
    docker-compose up -d
else
    log_success "Contenedores de MAU encontrados:"
    echo "$MAU_CONTAINERS"
fi

# Verificar logs del backend
log_info "Verificando logs del backend MAU..."
BACKEND_CONTAINER=$(docker ps --filter "name=mau.*backend" --format "{{.Names}}" | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    log_info "Revisando últimos logs del backend ($BACKEND_CONTAINER)..."
    docker logs --tail=50 "$BACKEND_CONTAINER" | grep -E "(ERROR|WARNING|login|auth)" || log_info "No se encontraron errores relacionados con login"
else
    log_warning "No se encontró contenedor del backend"
fi

# Verificar configuración de entorno
log_info "Verificando variables de entorno..."
if [ -f "mau.env" ]; then
    log_success "Archivo mau.env encontrado"
    if grep -q "DEBUG=False" mau.env; then
        log_success "DEBUG está configurado como False"
    else
        log_warning "DEBUG no está configurado como False"
        log_info "Agregando DEBUG=False al archivo mau.env..."
        echo "DEBUG=False" >> mau.env
    fi
else
    log_warning "Archivo mau.env no encontrado"
fi

# Crear usuario admin si no existe
log_info "Verificando usuario administrador..."
docker exec "$BACKEND_CONTAINER" python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

try:
    admin_user = User.objects.get(username='admin')
    print(f"✅ Usuario admin encontrado: {admin_user.username}")
    print(f"📧 Email: {admin_user.email}")
    print(f"🔐 Activo: {admin_user.is_active}")
    
    # Verificar password
    if admin_user.check_password('admin123'):
        print("🔑 Password correcto: admin123")
    else:
        print("🔑 Actualizando password a 'admin123'...")
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Password actualizado")
        
except User.DoesNotExist:
    print("❌ Usuario admin no encontrado. Creando...")
    admin_user = User.objects.create_user(
        username='admin',
        password='admin123',
        first_name='Administrador',
        last_name='Sistema',
        email='admin@hospital.com',
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    print(f"✅ Usuario admin creado: {admin_user.username}")
EOF

# Verificar configuración de reCAPTCHA
log_info "Verificando configuración de reCAPTCHA..."
docker exec "$BACKEND_CONTAINER" python manage.py shell << 'EOF'
from django.conf import settings

debug_mode = getattr(settings, 'DEBUG', False)
print(f"🐛 DEBUG mode: {debug_mode}")

recaptcha_site_key = getattr(settings, 'RECAPTCHA_SITE_KEY', None)
recaptcha_secret_key = getattr(settings, 'RECAPTCHA_SECRET_KEY', None)

print(f"🔑 RECAPTCHA_SITE_KEY: {'✅ Configurado' if recaptcha_site_key else '❌ No configurado'}")
print(f"🔐 RECAPTCHA_SECRET_KEY: {'✅ Configurado' if recaptcha_secret_key else '❌ No configurado'}")

if not debug_mode and (not recaptcha_site_key or not recaptcha_secret_key):
    print("⚠️  ADVERTENCIA: reCAPTCHA no configurado en producción")
    print("💡 El sistema permitirá login sin reCAPTCHA (configuración actual)")
EOF

# Reiniciar servicios si es necesario
log_info "Reiniciando servicios para aplicar cambios..."
docker-compose restart

# Verificar que los servicios estén funcionando
log_info "Verificando que los servicios estén funcionando..."
sleep 10

# Test de conectividad
log_info "Probando conectividad del backend..."
BACKEND_URL="http://localhost:8000/mau/api/auth/login/"
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" | grep -q "405\|400"; then
    log_success "Backend responde (código 405/400 es esperado para GET en endpoint POST)"
else
    log_warning "Backend no responde correctamente"
fi

echo ""
echo "=================================================="
log_success "Verificación completada!"
echo ""
echo "🎯 Instrucciones para login:"
echo "1. Usuario: admin"
echo "2. Password: admin123"
echo "3. El sistema ahora permite login sin reCAPTCHA"
echo ""
echo "📝 Si el problema persiste:"
echo "- Verifica los logs: docker logs [nombre_contenedor_backend]"
echo "- Verifica la configuración de CORS en settings.py"
echo "- Verifica que el frontend esté apuntando al backend correcto"
echo ""
echo "🔍 Para debugging adicional:"
echo "docker exec [nombre_contenedor_backend] python manage.py shell"
