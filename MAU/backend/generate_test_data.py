#!/usr/bin/env python3
"""
Script para generar datos de prueba masivos para el sistema MAU Hospital
Genera: 100 pacientes, 100 recetas, usuarios adicionales y datos completos
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.patients.models import Paciente
from apps.prescriptions.models import Receta, DetalleReceta, LoteDetalleReceta
from django.utils import timezone

User = get_user_model()

# Datos de muestra para generar contenido realista
NOMBRES = [
    'María', 'José', 'Ana', 'Carlos', 'Luis', 'Carmen', 'Francisco', 'Dolores', 'Antonio', 'Isabel',
    'Manuel', 'Pilar', 'David', 'María Carmen', 'Alejandro', 'María José', 'Daniel', 'Francisca',
    'Rafael', 'Laura', 'Miguel', 'María Pilar', 'Sergio', 'Concepción', 'Javier', 'Mercedes',
    'Ángel', 'Rosario', 'Pablo', 'Teresa', 'Adrián', 'Antonia', 'Álvaro', 'María Dolores',
    'Óscar', 'Cristina', 'Rubén', 'María Isabel', 'Jorge', 'María Teresa', 'Diego', 'Montserrat',
    'Iván', 'Manuela', 'Marcos', 'Beatriz', 'Nicolás', 'Margarita', 'Santiago', 'Rosa'
]

APELLIDOS = [
    'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
    'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz',
    'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez',
    'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales',
    'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
    'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano',
    'Prieto', 'Méndez', 'Cruz', 'Flores', 'Herrera', 'Peña', 'León', 'Marquez'
]

PATOLOGIAS = [
    'Hipertensión arterial', 'Diabetes mellitus tipo 2', 'Insuficiencia cardíaca',
    'Enfermedad pulmonar obstructiva crónica', 'Artritis reumatoide', 'Osteoporosis',
    'Depresión mayor', 'Ansiedad generalizada', 'Migraña', 'Asma bronquial',
    'Gastritis crónica', 'Colitis ulcerosa', 'Hipotiroidismo', 'Fibromialgia',
    'Síndrome de intestino irritable', 'Insuficiencia renal crónica', 'Cáncer de mama',
    'Cáncer de próstata', 'Leucemia', 'Epilepsia', 'Esquizofrenia', 'Trastorno bipolar'
]

CODIGOS_CIE10 = [
    'I10', 'E11', 'I50', 'J44', 'M06', 'M81', 'F32', 'F41', 'G43', 'J45',
    'K29', 'K51', 'E03', 'M79', 'K58', 'N18', 'C50', 'C61', 'C95', 'G40',
    'F20', 'F31', 'E78', 'I25', 'M79.3', 'K21', 'N39', 'L40', 'M54', 'G35'
]

SERVICIOS = [
    'Medicina Interna', 'Cardiología', 'Endocrinología', 'Neumología', 'Reumatología',
    'Psiquiatría', 'Neurología', 'Gastroenterología', 'Nefrología', 'Oncología',
    'Urología', 'Ginecología', 'Dermatología', 'Traumatología', 'Oftalmología',
    'Otorrinolaringología', 'Hematología', 'Geriatría', 'Pediatría', 'Cirugía General'
]

MEDICAMENTOS = [
    {'clave': 'MED001', 'nombre': 'Paracetamol 500mg', 'concentracion': '500mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED002', 'nombre': 'Ibuprofeno 400mg', 'concentracion': '400mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED003', 'nombre': 'Amoxicilina 500mg', 'concentracion': '500mg', 'forma': 'Cápsula', 'unidad': 'CÁPSULAS'},
    {'clave': 'MED004', 'nombre': 'Losartán 50mg', 'concentracion': '50mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED005', 'nombre': 'Metformina 850mg', 'concentracion': '850mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED006', 'nombre': 'Atorvastatina 20mg', 'concentracion': '20mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED007', 'nombre': 'Omeprazol 20mg', 'concentracion': '20mg', 'forma': 'Cápsula', 'unidad': 'CÁPSULAS'},
    {'clave': 'MED008', 'nombre': 'Furosemida 40mg', 'concentracion': '40mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED009', 'nombre': 'Carbonato de Calcio 500mg', 'concentracion': '500mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED010', 'nombre': 'Eritropoyetina 4000 UI', 'concentracion': '4000 UI', 'forma': 'Ampolla', 'unidad': 'AMPOLLETAS'},
    {'clave': 'MED011', 'nombre': 'Insulina NPH 100 UI/ml', 'concentracion': '100 UI/ml', 'forma': 'Frasco', 'unidad': 'FRASCOS'},
    {'clave': 'MED012', 'nombre': 'Salbutamol 100mcg', 'concentracion': '100mcg', 'forma': 'Inhalador', 'unidad': 'INHALADORES'},
    {'clave': 'MED013', 'nombre': 'Diclofenaco 75mg', 'concentracion': '75mg', 'forma': 'Ampolla', 'unidad': 'AMPOLLETAS'},
    {'clave': 'MED014', 'nombre': 'Clopidogrel 75mg', 'concentracion': '75mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED015', 'nombre': 'Levotiroxina 100mcg', 'concentracion': '100mcg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED016', 'nombre': 'Tramadol 50mg', 'concentracion': '50mg', 'forma': 'Cápsula', 'unidad': 'CÁPSULAS'},
    {'clave': 'MED017', 'nombre': 'Amlodipino 5mg', 'concentracion': '5mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED018', 'nombre': 'Clonazepam 2mg', 'concentracion': '2mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'},
    {'clave': 'MED019', 'nombre': 'Dexametasona 4mg', 'concentracion': '4mg', 'forma': 'Ampolla', 'unidad': 'AMPOLLETAS'},
    {'clave': 'MED020', 'nombre': 'Ciprofloxacino 500mg', 'concentracion': '500mg', 'forma': 'Tableta', 'unidad': 'TABLETAS'}
]

LABORATORIOS = [
    'Laboratorio ABC', 'Farmacéutica XYZ', 'Laboratorio DEF', 'Pharma GHI', 
    'Medicamentos JKL', 'Bio-Lab MNO', 'Laboratorio PQR', 'Pharma STU'
]

def generate_curp():
    """Genera un CURP fake pero con formato válido"""
    letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    numeros = '0123456789'
    
    return (
        ''.join(random.choices(letras, k=4)) +
        ''.join(random.choices(numeros, k=6)) +
        ''.join(random.choices(letras + numeros, k=8))
    )

def create_users():
    """Crear usuarios adicionales para testing"""
    print("🧑‍💼 Creando usuarios adicionales...")
    
    users_data = [
        {'username': 'maria.gonzalez', 'first_name': 'María', 'last_name': 'González', 'role': 'ATENCION_USUARIO'},
        {'username': 'carlos.martinez', 'first_name': 'Carlos', 'last_name': 'Martínez', 'role': 'FARMACIA'},
        {'username': 'ana.lopez', 'first_name': 'Ana', 'last_name': 'López', 'role': 'CMI'},
        {'username': 'luis.rodriguez', 'first_name': 'Luis', 'last_name': 'Rodríguez', 'role': 'MEDICO'},
        {'username': 'carmen.sanchez', 'first_name': 'Carmen', 'last_name': 'Sánchez', 'role': 'FARMACIA'},
        {'username': 'francisco.perez', 'first_name': 'Francisco', 'last_name': 'Pérez', 'role': 'CMI'},
        {'username': 'isabel.garcia', 'first_name': 'Isabel', 'last_name': 'García', 'role': 'ATENCION_USUARIO'},
        {'username': 'manuel.torres', 'first_name': 'Manuel', 'last_name': 'Torres', 'role': 'MEDICO'},
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': user_data['role'],
                'is_active': True,
                'email': f"{user_data['username']}@hospital.com"
            }
        )
        if created:
            user.set_password('123456')  # Password simple para testing
            user.save()
            created_users.append(user)
            print(f"   ✅ Usuario creado: {user.username} ({user.role})")
        else:
            created_users.append(user)
            print(f"   ♻️  Usuario existente: {user.username} ({user.role})")
    
    return created_users

def create_patients():
    """Crear 100 pacientes con datos realistas"""
    print("🏥 Creando 100 pacientes...")
    
    patients = []
    existing_expedientes = set(Paciente.objects.values_list('expediente', flat=True))
    
    for i in range(100):
        # Generar expediente único
        expediente = f"EXP{i+1:03d}"
        while expediente in existing_expedientes:
            expediente = f"EXP{random.randint(100, 9999)}"
        
        # Generar fecha de nacimiento realista (entre 18 y 90 años)
        edad = random.randint(18, 90)
        fecha_nacimiento = datetime.now().date() - timedelta(days=edad * 365 + random.randint(0, 365))
        
        # Seleccionar patología y código CIE10
        patologia_index = random.randint(0, len(PATOLOGIAS) - 1)
        
        patient_data = {
            'expediente': expediente,
            'nombre': random.choice(NOMBRES),
            'apellido_paterno': random.choice(APELLIDOS),
            'apellido_materno': random.choice(APELLIDOS),
            'curp': generate_curp(),
            'fecha_nacimiento': fecha_nacimiento,
            'genero': random.choice(['M', 'F']),
            'patologia': PATOLOGIAS[patologia_index],
            'cie10': CODIGOS_CIE10[patologia_index] if patologia_index < len(CODIGOS_CIE10) else f"A{random.randint(10,99)}",
            'fecha_diagnostico': fecha_nacimiento + timedelta(days=random.randint(365*5, edad*365-365))
        }
        
        patient, created = Paciente.objects.get_or_create(
            expediente=patient_data['expediente'],
            defaults=patient_data
        )
        
        if created:
            patients.append(patient)
            if (i + 1) % 10 == 0:
                print(f"   ✅ Creados {i + 1} pacientes...")
        else:
            patients.append(patient)
    
    print(f"   🎉 Total pacientes disponibles: {len(patients)}")
    return patients

def create_recipes_and_details(patients, users):
    """Crear 100 recetas con detalles de medicamentos"""
    print("📋 Creando 100 recetas con medicamentos...")
    
    # Filtrar usuarios por rol
    medicos = [u for u in users if u.role in ['MEDICO', 'ATENCION_USUARIO', 'ADMIN']]
    validadores = [u for u in users if u.role in ['ATENCION_USUARIO', 'ADMIN']]
    farmacia_users = [u for u in users if u.role in ['FARMACIA', 'ADMIN']]
    cmi_users = [u for u in users if u.role in ['CMI', 'ADMIN']]
    
    estados_posibles = ['PENDIENTE', 'VALIDADA', 'PARCIALMENTE_SURTIDA', 'SURTIDA', 'CANCELADA']
    prioridades = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA']
    
    recipes_created = 0
    
    for i in range(100):
        # Seleccionar paciente aleatorio
        patient = random.choice(patients)
        
        # Datos de la receta
        tipo_receta = random.choice(['FARMACIA', 'CMI'])
        estado = random.choice(estados_posibles)
        prioridad = random.choice(prioridades)
        
        # Fechas progresivas
        fecha_base = timezone.now() - timedelta(days=random.randint(1, 30))
        
        recipe_data = {
            'paciente': patient,
            'tipo_receta': tipo_receta,
            'estado': estado,
            'prioridad': prioridad,
            'servicio_solicitante': random.choice(SERVICIOS),
            'diagnostico': patient.patologia,
            'indicaciones_generales': f"Tratamiento para {patient.patologia}. Seguimiento médico requerido.",
            'fecha_creacion': fecha_base,
            'prescrito_por': random.choice(medicos) if medicos else None,
        }
        
        # Ajustar fechas según estado
        if estado in ['VALIDADA', 'PARCIALMENTE_SURTIDA', 'SURTIDA']:
            recipe_data['fecha_validacion'] = fecha_base + timedelta(hours=random.randint(1, 24))
            recipe_data['validado_por'] = random.choice(validadores) if validadores else None
            
        if estado in ['PARCIALMENTE_SURTIDA', 'SURTIDA']:
            if estado == 'PARCIALMENTE_SURTIDA':
                recipe_data['fecha_dispensacion_parcial'] = recipe_data['fecha_validacion'] + timedelta(hours=random.randint(1, 48))
            else:
                recipe_data['fecha_dispensacion'] = recipe_data['fecha_validacion'] + timedelta(hours=random.randint(1, 72))
                
            # Asignar dispensador según tipo
            if tipo_receta == 'FARMACIA' and farmacia_users:
                recipe_data['dispensado_por'] = random.choice(farmacia_users)
            elif tipo_receta == 'CMI' and cmi_users:
                recipe_data['dispensado_por'] = random.choice(cmi_users)
        
        try:
            recipe = Receta.objects.create(**recipe_data)
            
            # Crear medicamentos para la receta (1-5 medicamentos por receta)
            num_medicamentos = random.randint(1, 5)
            medicamentos_receta = random.sample(MEDICAMENTOS, min(num_medicamentos, len(MEDICAMENTOS)))
            
            for med_data in medicamentos_receta:
                cantidad_prescrita = random.randint(10, 180)
                
                detalle_data = {
                    'receta': recipe,
                    'clave_medicamento': med_data['clave'],
                    'descripcion_medicamento': med_data['nombre'],
                    'concentracion': med_data['concentracion'],
                    'forma_farmaceutica': med_data['forma'],
                    'dosis': f"{random.randint(1,3)} cada {random.randint(6,24)} horas",
                    'via_administracion': random.choice(['Oral', 'Intramuscular', 'Intravenosa', 'Subcutánea']),
                    'frecuencia': f"Cada {random.randint(6,24)} horas",
                    'duracion_tratamiento': f"{random.randint(5,30)} días",
                    'cantidad_prescrita': cantidad_prescrita,
                    'unidad_medida': med_data['unidad'],
                    'precio_unitario': Decimal(f"{random.uniform(0.50, 50.00):.2f}"),
                    'permite_sustitucion': random.choice([True, False])
                }
                
                # Si la receta está dispensada, agregar información de dispensación
                if estado in ['PARCIALMENTE_SURTIDA', 'SURTIDA']:
                    if estado == 'SURTIDA':
                        detalle_data['cantidad_surtida'] = cantidad_prescrita
                        detalle_data['lote'] = f"{med_data['clave'][:3]}{random.randint(100,999)}"
                        detalle_data['fecha_caducidad'] = fecha_base.date() + timedelta(days=random.randint(180, 730))
                        detalle_data['laboratorio'] = random.choice(LABORATORIOS)
                    else:  # PARCIALMENTE_SURTIDA
                        detalle_data['cantidad_surtida'] = random.randint(1, cantidad_prescrita - 1)
                        if random.choice([True, False]):  # 50% chance de tener lote tradicional
                            detalle_data['lote'] = f"{med_data['clave'][:3]}{random.randint(100,999)}"
                            detalle_data['fecha_caducidad'] = fecha_base.date() + timedelta(days=random.randint(180, 730))
                            detalle_data['laboratorio'] = random.choice(LABORATORIOS)
                
                detalle = DetalleReceta.objects.create(**detalle_data)
                
                # Crear lotes múltiples para algunos medicamentos parcialmente surtidos
                if estado == 'PARCIALMENTE_SURTIDA' and random.choice([True, False]):
                    # Crear 1-3 lotes para medicamento parcialmente dispensado
                    num_lotes = random.randint(1, 3)
                    cantidad_restante = detalle_data.get('cantidad_surtida', 0)
                    
                    for lote_num in range(num_lotes):
                        if cantidad_restante <= 0:
                            break
                            
                        cantidad_lote = random.randint(1, min(cantidad_restante, cantidad_prescrita // 2))
                        
                        lote_data = {
                            'detalle_receta': detalle,
                            'numero_lote': f"{med_data['clave'][:3]}{random.randint(100,999)}",
                            'fecha_caducidad': fecha_base.date() + timedelta(days=random.randint(180, 730)),
                            'laboratorio': random.choice(LABORATORIOS),
                            'cantidad_dispensada': cantidad_lote,
                            'fecha_dispensacion': recipe_data.get('fecha_dispensacion_parcial', fecha_base),
                            'dispensado_por': recipe_data.get('dispensado_por'),
                            'observaciones': f"Lote {lote_num + 1} - Dispensación parcial"
                        }
                        
                        LoteDetalleReceta.objects.create(**lote_data)
                        cantidad_restante -= cantidad_lote
            
            recipes_created += 1
            if recipes_created % 10 == 0:
                print(f"   ✅ Creadas {recipes_created} recetas...")
                
        except Exception as e:
            print(f"   ⚠️  Error creando receta {i+1}: {e}")
            continue
    
    print(f"   🎉 Total recetas creadas: {recipes_created}")

def main():
    """Función principal"""
    print("🚀 Iniciando generación de datos de prueba masivos...")
    print("=" * 60)
    
    try:
        # Crear usuarios adicionales
        users = create_users()
        
        # Obtener todos los usuarios disponibles
        all_users = list(User.objects.all())
        
        # Crear pacientes
        patients = create_patients()
        
        # Crear recetas y detalles
        create_recipes_and_details(patients, all_users)
        
        print("=" * 60)
        print("🎉 ¡Generación de datos completada exitosamente!")
        print(f"📊 Estadísticas finales:")
        print(f"   👥 Pacientes totales: {Paciente.objects.count()}")
        print(f"   📋 Recetas totales: {Receta.objects.count()}")
        print(f"   💊 Detalles de medicamentos: {DetalleReceta.objects.count()}")
        print(f"   📦 Lotes de medicamentos: {LoteDetalleReceta.objects.count()}")
        print(f"   🧑‍💼 Usuarios totales: {User.objects.count()}")
        
        # Estadísticas por estado
        print(f"\n📈 Recetas por estado:")
        for estado in ['PENDIENTE', 'VALIDADA', 'PARCIALMENTE_SURTIDA', 'SURTIDA', 'CANCELADA']:
            count = Receta.objects.filter(estado=estado).count()
            print(f"   {estado}: {count}")
            
        print(f"\n🏥 Recetas por tipo:")
        print(f"   FARMACIA: {Receta.objects.filter(tipo_receta='FARMACIA').count()}")
        print(f"   CMI: {Receta.objects.filter(tipo_receta='CMI').count()}")
        
    except Exception as e:
        print(f"❌ Error durante la generación: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
