from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
from apps.patients.models import Paciente, CIE10Mexico

class Command(BaseCommand):
    help = 'Verificar el estado de la base de datos y modelos'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Verificando estado de la base de datos...')
        
        # Verificar conexión a la base de datos
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS('✅ Conexión a la base de datos exitosa'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error de conexión a la base de datos: {e}'))
            return
        
        # Verificar modelos
        try:
            # Verificar modelo Paciente
            paciente_count = Paciente.objects.count()
            self.stdout.write(f'📊 Total de pacientes en la base: {paciente_count}')
            
            if paciente_count > 0:
                # Mostrar algunos pacientes de ejemplo
                pacientes_ejemplo = Paciente.objects.all()[:3]
                self.stdout.write('📋 Ejemplos de pacientes:')
                for paciente in pacientes_ejemplo:
                    self.stdout.write(f'   - {paciente.expediente}: {paciente.get_nombre_completo()}')
            
            # Verificar modelo CIE10Mexico
            cie10_count = CIE10Mexico.objects.count()
            self.stdout.write(f'🏥 Total de códigos CIE-10: {cie10_count}')
            
            if cie10_count > 0:
                # Mostrar algunos códigos de ejemplo
                cie10_ejemplo = CIE10Mexico.objects.all()[:3]
                self.stdout.write('📋 Ejemplos de códigos CIE-10:')
                for codigo in cie10_ejemplo:
                    self.stdout.write(f'   - {codigo.codigo}: {codigo.descripcion_corta or codigo.descripcion[:50]}')
            
            # Verificar tablas en la base de datos
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name LIKE '%paciente%' OR name LIKE '%cie10%'
                """)
                tablas = cursor.fetchall()
                self.stdout.write('🗃️ Tablas relacionadas encontradas:')
                for tabla in tablas:
                    self.stdout.write(f'   - {tabla[0]}')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error verificando modelos: {e}'))
        
        self.stdout.write(self.style.SUCCESS('✅ Verificación completada'))
