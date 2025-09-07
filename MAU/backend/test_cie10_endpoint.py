#!/usr/bin/env python
"""
Script de prueba para el endpoint de búsqueda CIE-10
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from apps.patients.views import buscar_cie10
from apps.patients.models import CIE10Mexico

def test_cie10_search():
    """Probar el endpoint de búsqueda CIE-10"""
    print("🔍 Probando endpoint de búsqueda CIE-10...")
    
    # Crear un request de prueba
    factory = RequestFactory()
    request = factory.get('/api/pacientes/cie10/buscar/?q=A00')
    
    # Crear un usuario de prueba
    User = get_user_model()
    try:
        user = User.objects.first()
        if not user:
            print("❌ No hay usuarios en la base de datos")
            return
        print(f"✅ Usuario de prueba: {user.username}")
    except Exception as e:
        print(f"❌ Error obteniendo usuario: {e}")
        return
    
    # Autenticar el request
    force_authenticate(request, user=user)
    
    try:
        # Llamar al endpoint
        print("📡 Llamando al endpoint...")
        response = buscar_cie10(request)
        
        print(f"✅ Status code: {response.status_code}")
        print(f"✅ Response data: {response.data}")
        
    except Exception as e:
        print(f"❌ Error en el endpoint: {e}")
        import traceback
        traceback.print_exc()

def test_cie10_model():
    """Probar el modelo CIE10Mexico"""
    print("\n🔍 Probando modelo CIE10Mexico...")
    
    try:
        # Contar registros
        total = CIE10Mexico.objects.count()
        print(f"✅ Total de códigos CIE-10: {total}")
        
        # Obtener un registro de ejemplo
        if total > 0:
            ejemplo = CIE10Mexico.objects.first()
            print(f"✅ Ejemplo de código: {ejemplo.codigo} - {ejemplo.descripcion_corta}")
            
            # Probar métodos del serializer
            print(f"✅ get_descripcion_display: {ejemplo.get_descripcion_display()}")
            print(f"✅ clave_capitulo: {ejemplo.clave_capitulo}")
            print(f"✅ genero_aplicable: {ejemplo.genero_aplicable}")
            
    except Exception as e:
        print(f"❌ Error en el modelo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("🚀 Iniciando pruebas del endpoint CIE-10...")
    test_cie10_model()
    test_cie10_search()
    print("\n✅ Pruebas completadas")
