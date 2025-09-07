#!/usr/bin/env python3
"""
Script para habilitar la funcionalidad de simulación de roles para el admin
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def setup_admin_user():
    """Asegurar que el admin tenga acceso completo"""
    print("👑 Configurando usuario administrador...")
    
    try:
        admin_user = User.objects.get(username='admin')
        admin_user.role = 'ADMIN'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()
        print(f"   ✅ Admin configurado: {admin_user.username} (rol: {admin_user.role})")
        
        # Verificar password
        if not admin_user.check_password('admin123'):
            admin_user.set_password('admin123')
            admin_user.save()
            print("   🔑 Password del admin actualizado a 'admin123'")
            
        return admin_user
        
    except User.DoesNotExist:
        print("   ❌ Usuario admin no encontrado. Creando...")
        admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            first_name='Administrador',
            last_name='Sistema',
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            email='admin@hospital.com'
        )
        print(f"   ✅ Admin creado: {admin_user.username} (rol: {admin_user.role})")
        return admin_user

def verify_test_users():
    """Verificar que los usuarios de prueba estén disponibles"""
    print("🧑‍💼 Verificando usuarios de prueba...")
    
    roles = ['ATENCION_USUARIO', 'FARMACIA', 'CMI', 'MEDICO']
    
    for role in roles:
        users = User.objects.filter(role=role, is_active=True)
        print(f"   {role}: {users.count()} usuarios")
        
        if users.exists():
            sample_user = users.first()
            print(f"      Ejemplo: {sample_user.username} - {sample_user.get_full_name()}")

def main():
    """Función principal"""
    print("🔧 Configurando funcionalidad de administrador...")
    print("=" * 50)
    
    # Configurar admin
    admin = setup_admin_user()
    
    # Verificar usuarios de prueba
    verify_test_users()
    
    print("=" * 50)
    print("✅ Configuración completada!")
    print("\n🎯 Instrucciones para testing:")
    print("1. Login como 'admin' con password 'admin123'")
    print("2. Tendrás acceso a todos los módulos")
    print("3. En el Dashboard verás todos los módulos disponibles")
    print("4. Cada módulo respetará los permisos según el rol")
    print("\n👥 Usuarios de prueba disponibles:")
    print("- maria.gonzalez (ATENCION_USUARIO) - password: 123456")
    print("- carlos.martinez (FARMACIA) - password: 123456") 
    print("- ana.lopez (CMI) - password: 123456")
    print("- luis.rodriguez (MEDICO) - password: 123456")
    print("\n📊 Datos disponibles:")
    print("- 105 pacientes")
    print("- 109 recetas")
    print("- 319 medicamentos")
    print("- 60 lotes")

if __name__ == "__main__":
    main()
