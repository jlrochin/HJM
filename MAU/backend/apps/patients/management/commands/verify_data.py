from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.patients.models import Paciente, CIE10Mexico
from datetime import date, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Verificar y crear datos de prueba en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Verificando datos en la base de datos...')
        
        # Verificar usuarios
        self.verify_users()
        
        # Verificar códigos CIE-10
        self.verify_cie10()
        
        # Verificar pacientes
        self.verify_patients()
        
        self.stdout.write(self.style.SUCCESS('✅ Verificación completada'))

    def verify_users(self):
        """Verificar que existan usuarios de prueba"""
        self.stdout.write('\n👥 Verificando usuarios...')
        
        # Verificar admin
        try:
            admin = User.objects.get(username='admin')
            self.stdout.write(f'   ✅ Admin existe: {admin.username} (rol: {admin.role})')
        except User.DoesNotExist:
            self.stdout.write('   ❌ Admin no existe. Ejecuta: python manage.py create_admin_simulation')
        
        # Verificar usuarios de prueba
        test_users = ['maria.gonzalez', 'carlos.martinez', 'ana.lopez', 'luis.rodriguez']
        for username in test_users:
            try:
                user = User.objects.get(username=username)
                self.stdout.write(f'   ✅ {username} existe (rol: {user.role})')
            except User.DoesNotExist:
                self.stdout.write(f'   ❌ {username} no existe')

    def verify_cie10(self):
        """Verificar códigos CIE-10"""
        self.stdout.write('\n🏥 Verificando códigos CIE-10...')
        
        cie10_count = CIE10Mexico.objects.count()
        self.stdout.write(f'   Total códigos CIE-10: {cie10_count}')
        
        if cie10_count == 0:
            self.stdout.write('   ⚠️ No hay códigos CIE-10. Ejecuta: python manage.py load_cie10_mexico')
        else:
            # Mostrar algunos ejemplos
            ejemplos = CIE10Mexico.objects.all()[:5]
            self.stdout.write('   Ejemplos:')
            for codigo in ejemplos:
                self.stdout.write(f'     - {codigo.codigo}: {codigo.descripcion_corta or codigo.descripcion[:50]}')

    def verify_patients(self):
        """Verificar pacientes"""
        self.stdout.write('\n👤 Verificando pacientes...')
        
        paciente_count = Paciente.objects.count()
        self.stdout.write(f'   Total pacientes: {paciente_count}')
        
        if paciente_count == 0:
            self.stdout.write('   ⚠️ No hay pacientes. Creando datos de prueba...')
            self.create_sample_patients()
        else:
            # Mostrar algunos ejemplos
            ejemplos = Paciente.objects.all()[:5]
            self.stdout.write('   Ejemplos:')
            for paciente in ejemplos:
                self.stdout.write(f'     - {paciente.expediente}: {paciente.get_nombre_completo()}')

    def create_sample_patients(self):
        """Crear algunos pacientes de prueba"""
        try:
            # Obtener algunos códigos CIE-10 para usar
            cie10_codes = list(CIE10Mexico.objects.all()[:10])
            if not cie10_codes:
                self.stdout.write('   ❌ No hay códigos CIE-10 disponibles')
                return
            
            # Crear pacientes de prueba
            sample_data = [
                {
                    'expediente': 'EXP001',
                    'curp': 'ABCD123456HMCLEF01',
                    'nombre': 'Juan Carlos',
                    'apellido_paterno': 'Pérez',
                    'apellido_materno': 'García',
                    'fecha_nacimiento': date(1985, 5, 15),
                    'genero': 'M',
                    'patologia': 'Hipertensión arterial',
                    'cie10': 'I10',
                    'fecha_diagnostico': date(2023, 1, 10),
                    'tipo_sangre': 'O+',
                    'telefono': '5551234567',
                    'direccion': 'Av. Principal 123, Ciudad'
                },
                {
                    'expediente': 'EXP002',
                    'curp': 'EFGH987654MNLKJI02',
                    'nombre': 'María Elena',
                    'apellido_paterno': 'Rodríguez',
                    'apellido_materno': 'López',
                    'fecha_nacimiento': date(1990, 8, 22),
                    'genero': 'F',
                    'patologia': 'Diabetes mellitus tipo 2',
                    'cie10': 'E11.9',
                    'fecha_diagnostico': date(2023, 3, 15),
                    'tipo_sangre': 'A+',
                    'telefono': '5559876543',
                    'direccion': 'Calle Secundaria 456, Ciudad'
                }
            ]
            
            for data in sample_data:
                # Seleccionar un código CIE-10 aleatorio
                cie10_code = random.choice(cie10_codes)
                data['cie10'] = cie10_code.codigo
                
                paciente = Paciente.objects.create(**data)
                self.stdout.write(f'   ✅ Paciente creado: {paciente.expediente} - {paciente.get_nombre_completo()}')
            
            self.stdout.write(f'   ✅ {len(sample_data)} pacientes de prueba creados')
            
        except Exception as e:
            self.stdout.write(f'   ❌ Error creando pacientes de prueba: {e}')
