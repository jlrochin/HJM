from django.db import migrations, models
from django.utils import timezone
from datetime import timedelta


def actualizar_estado_pacientes(apps, schema_editor):
    """Actualiza el estado de los pacientes basado en su actividad"""
    Paciente = apps.get_model('patients', 'Paciente')
    Receta = apps.get_model('prescriptions', 'Receta')
    
    # Fecha límite: 4 años atrás desde hoy
    fecha_limite = timezone.now() - timedelta(days=4*365)
    
    pacientes_actualizados = 0
    
    for paciente in Paciente.objects.all():
        # Buscar la receta más reciente del paciente
        ultima_receta = Receta.objects.filter(
            paciente=paciente
        ).order_by('-fecha_creacion').first()
        
        # Buscar la última actividad del paciente
        ultima_actividad = paciente.updated_at
        
        # Si hay recetas, usar la fecha de la más reciente
        if ultima_receta and ultima_receta.fecha_creacion > ultima_actividad:
            ultima_actividad = ultima_receta.fecha_creacion
        
        # Determinar si debe estar activo
        debe_estar_activo = ultima_actividad >= fecha_limite
        
        # Actualizar si es necesario
        if paciente.is_active != debe_estar_activo:
            paciente.is_active = debe_estar_activo
            paciente.save(update_fields=['is_active'])
            pacientes_actualizados += 1
    
    print(f'Pacientes actualizados: {pacientes_actualizados}')


def revertir_estado_pacientes(apps, schema_editor):
    """Revierte todos los pacientes a estado activo"""
    Paciente = apps.get_model('patients', 'Paciente')
    Paciente.objects.all().update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0002_add_cie10_mexico'),
        ('prescriptions', '0005_catalogomedicamentos_alter_detallereceta_options_and_more'),
    ]

    operations = [
        migrations.RunPython(
            actualizar_estado_pacientes,
            revertir_estado_pacientes
        ),
    ]
