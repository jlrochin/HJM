#!/usr/bin/env python
"""
Script para actualizar el estado de los pacientes basado en su actividad.
Pacientes con más de 4 años sin movimientos se inactivan automáticamente.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from apps.patients.models import Paciente
from apps.prescriptions.models import Receta


def actualizar_estado_pacientes():
    """Actualiza el estado de todos los pacientes basado en su actividad"""
    
    # Fecha límite: 4 años atrás desde hoy
    fecha_limite = timezone.now() - timedelta(days=4*365)
    
    print("=" * 60)
    print("ACTUALIZACIÓN AUTOMÁTICA DE ESTADO DE PACIENTES")
    print("=" * 60)
    print(f"Fecha límite para actividad: {fecha_limite.strftime('%d/%m/%Y')}")
    print(f"Pacientes con actividad anterior a esta fecha se marcarán como INACTIVOS")
    print()
    
    # Obtener todos los pacientes
    pacientes = Paciente.objects.all()
    total_pacientes = pacientes.count()
    
    print(f"Total de pacientes en la base de datos: {total_pacientes}")
    print()
    
    pacientes_activos = 0
    pacientes_inactivos = 0
    pacientes_actualizados = 0
    
    for i, paciente in enumerate(pacientes, 1):
        print(f"Procesando paciente {i}/{total_pacientes}: {paciente.expediente} - {paciente.get_nombre_completo()}")
        
        # Verificar si el paciente ha tenido actividad reciente
        # Buscar la receta más reciente del paciente
        ultima_receta = Receta.objects.filter(
            paciente=paciente
        ).order_by('-created_at').first()
        
        # Buscar la última actividad del paciente
        ultima_actividad = paciente.updated_at
        
        # Si hay recetas, usar la fecha de la más reciente
        if ultima_receta and ultima_receta.created_at > ultima_actividad:
            ultima_actividad = ultima_receta.created_at
        
        # Determinar si debe estar activo
        debe_estar_activo = ultima_actividad >= fecha_limite
        
        # Verificar si el estado actual es correcto
        if paciente.is_active != debe_estar_activo:
            print(f"  ⚠️  Estado incorrecto: {'ACTIVO' if paciente.is_active else 'INACTIVO'} → {'ACTIVO' if debe_estar_activo else 'INACTIVO'}")
            print(f"     Última actividad: {ultima_actividad.strftime('%d/%m/%Y')}")
            
            # Actualizar el estado
            paciente.is_active = debe_estar_activo
            paciente.save(update_fields=['is_active'])
            pacientes_actualizados += 1
        else:
            print(f"  ✅ Estado correcto: {'ACTIVO' if paciente.is_active else 'INACTIVO'}")
        
        # Contar estados
        if paciente.is_active:
            pacientes_activos += 1
        else:
            pacientes_inactivos += 1
        
        print()
    
    # Resumen final
    print("=" * 60)
    print("RESUMEN DE ACTUALIZACIÓN")
    print("=" * 60)
    print(f"Total de pacientes: {total_pacientes}")
    print(f"Pacientes activos: {pacientes_activos}")
    print(f"Pacientes inactivos: {pacientes_inactivos}")
    print(f"Pacientes actualizados: {pacientes_actualizados}")
    print()
    
    if pacientes_actualizados > 0:
        print("✅ Actualización completada exitosamente")
        print(f"   {pacientes_actualizados} pacientes fueron actualizados")
    else:
        print("✅ No se requirieron actualizaciones")
        print("   Todos los pacientes ya tienen el estado correcto")
    
    print("=" * 60)


if __name__ == "__main__":
    try:
        actualizar_estado_pacientes()
    except KeyboardInterrupt:
        print("\n❌ Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la actualización: {e}")
        sys.exit(1)
