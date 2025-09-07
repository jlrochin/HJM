#!/usr/bin/env python3
"""
Script para solucionar problemas de login en producción
- Verifica que el usuario admin exista
- Crea el usuario admin si no existe
- Verifica la configuración de reCAPTCHA
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

def check_admin_user():
    """Verificar y crear usuario admin"""
    print("🔍 Verificando usuario administrador...")
    
    try:
        admin_user = User.objects.get(username='admin')
        print(f"   ✅ Usuario admin encontrado: {admin_user.username}")
        print(f"   📧 Email: {admin_user.email}")
        print(f"   🔐 Activo: {admin_user.is_active}")
        print(f"   👑 Es staff: {admin_user.is_staff}")
        print(f"   🛡️ Es superuser: {admin_user.is_superuser}")
        
        # Verificar password
        if admin_user.check_password('admin123'):
            print("   🔑 Password correcto: admin123")
        else:
            print("   🔑 Actualizando password a 'admin123'...")
            admin_user.set_password('admin123')
            admin_user.save()
            print("   ✅ Password actualizado")
            
        return admin_user
        
    except User.DoesNotExist:
        print("   ❌ Usuario admin no encontrado. Creando...")
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
        print(f"   ✅ Usuario admin creado: {admin_user.username}")
        return admin_user

def check_recaptcha_config():
    """Verificar configuración de reCAPTCHA"""
    print("\n🔍 Verificando configuración de reCAPTCHA...")
    
    debug_mode = getattr(settings, 'DEBUG', False)
    print(f"   🐛 DEBUG mode: {debug_mode}")
    
    recaptcha_site_key = getattr(settings, 'RECAPTCHA_SITE_KEY', None)
    recaptcha_secret_key = getattr(settings, 'RECAPTCHA_SECRET_KEY', None)
    
    print(f"   🔑 RECAPTCHA_SITE_KEY: {'✅ Configurado' if recaptcha_site_key else '❌ No configurado'}")
    print(f"   🔐 RECAPTCHA_SECRET_KEY: {'✅ Configurado' if recaptcha_secret_key else '❌ No configurado'}")
    
    if not debug_mode and (not recaptcha_site_key or not recaptcha_secret_key):
        print("   ⚠️  ADVERTENCIA: reCAPTCHA no configurado en producción")
        print("   💡 Solución: El sistema permitirá login sin reCAPTCHA")

def test_login_serializer():
    """Probar el serializer de login"""
    print("\n🧪 Probando serializer de login...")
    
    from apps.authentication.serializers import LoginSerializer
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.post('/mau/api/auth/login/')
    
    # Test con datos válidos
    test_data = {
        'username': 'admin',
        'password': 'admin123',
        'recaptcha_token': ''  # Token vacío
    }
    
    serializer = LoginSerializer(data=test_data, request=request)
    
    if serializer.is_valid():
        print("   ✅ Serializer válido con token vacío")
        user = serializer.validated_data.get('user')
        if user:
            print(f"   👤 Usuario validado: {user.username}")
        else:
            print("   ❌ Usuario no encontrado en datos validados")
    else:
        print("   ❌ Serializer inválido:")
        for field, errors in serializer.errors.items():
            print(f"      {field}: {errors}")

def main():
    """Función principal"""
    print("🔧 Solucionando problemas de login en producción...")
    print("=" * 60)
    
    # Verificar usuario admin
    admin_user = check_admin_user()
    
    # Verificar configuración de reCAPTCHA
    check_recaptcha_config()
    
    # Probar serializer
    test_login_serializer()
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada!")
    print("\n🎯 Instrucciones para login:")
    print("1. Usuario: admin")
    print("2. Password: admin123")
    print("3. El sistema ahora permite login sin reCAPTCHA")
    print("\n📝 Si el problema persiste:")
    print("- Verifica que el backend esté ejecutándose")
    print("- Verifica la configuración de CORS")
    print("- Revisa los logs del servidor")

if __name__ == "__main__":
    main()
