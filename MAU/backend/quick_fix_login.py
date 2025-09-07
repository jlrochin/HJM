#!/usr/bin/env python3
"""
Script rápido para solucionar el problema de login en producción
Solo aplica los cambios críticos necesarios
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def main():
    print("🔧 Aplicando fix rápido para login...")
    
    # 1. Crear/verificar usuario admin
    try:
        admin_user = User.objects.get(username='admin')
        print(f"✅ Usuario admin encontrado: {admin_user.username}")
        
        # Asegurar que el password sea correcto
        if not admin_user.check_password('admin123'):
            admin_user.set_password('admin123')
            admin_user.save()
            print("🔑 Password actualizado a 'admin123'")
        
        # Asegurar que esté activo
        if not admin_user.is_active:
            admin_user.is_active = True
            admin_user.save()
            print("🔐 Usuario activado")
            
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
    
    # 2. Verificar configuración
    from django.conf import settings
    debug_mode = getattr(settings, 'DEBUG', False)
    print(f"🐛 DEBUG mode: {debug_mode}")
    
    if debug_mode:
        print("⚠️  ADVERTENCIA: DEBUG=True en producción")
    else:
        print("✅ DEBUG=False (correcto para producción)")
    
    print("\n🎯 Login debería funcionar ahora con:")
    print("   Usuario: admin")
    print("   Password: admin123")
    print("\n💡 El sistema permite login sin reCAPTCHA")

if __name__ == "__main__":
    main()
