from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.audit.models import SystemMovement
from datetime import timedelta
import random
import logging
from django.db.models import Count

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Generar datos de auditoría de ejemplo para acciones importantes del sistema'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Número de registros de auditoría a generar'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Número de días hacia atrás para generar datos'
        )
    
    def handle(self, *args, **options):
        count = options['count']
        days = options['days']
        
        self.stdout.write(f'Generando {count} registros de auditoría importantes para los últimos {days} días...')
        
        # Crear usuarios de ejemplo si no existen
        users = self.create_sample_users()
        
        # Solo acciones importantes (no navegación rutinaria)
        action_types = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'DISPENSE', 'VALIDATE']
        
        # Solo entidades importantes
        entity_types = ['PATIENT', 'PRESCRIPTION', 'MEDICATION', 'BATCH', 'USER', 'REPORT']
        
        # Solo módulos importantes
        modules = ['PATIENTS', 'PRESCRIPTIONS', 'INVENTORY', 'REPORTS', 'AUTHENTICATION', 'ADMIN']
        
        # Prioridades
        priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        
        # Generar registros
        records_created = 0
        start_date = timezone.now() - timedelta(days=days)
        
        for i in range(count):
            try:
                # Fecha aleatoria dentro del rango
                random_days = random.randint(0, days)
                random_hours = random.randint(8, 20)  # Solo horario laboral
                random_minutes = random.randint(0, 59)
                timestamp = start_date + timedelta(
                    days=random_days,
                    hours=random_hours,
                    minutes=random_minutes
                )
                
                # Seleccionar valores aleatorios
                action_type = random.choice(action_types)
                entity_type = random.choice(entity_types)
                module = random.choice(modules)
                priority = random.choice(priorities)
                user = random.choice(users) if users else None
                
                # Determinar si fue exitoso basado en la acción
                is_successful = random.choice([True, True, True, True, False])  # 80% exitoso
                
                # Generar descripción más específica
                descriptions = {
                    'CREATE': f'Creación de {entity_type.lower()}',
                    'UPDATE': f'Actualización de {entity_type.lower()}',
                    'DELETE': f'Eliminación de {entity_type.lower()}',
                    'LOGIN': 'Inicio de sesión en el sistema',
                    'LOGOUT': 'Cierre de sesión del sistema',
                    'EXPORT': f'Exportación de reporte de {entity_type.lower()}',
                    'DISPENSE': f'Dispensación de receta de {entity_type.lower()}',
                    'VALIDATE': f'Validación de {entity_type.lower()}'
                }
                
                description = descriptions.get(action_type, f'Acción {action_type} en {entity_type}')
                
                # Generar tags más específicos
                tags = {
                    'generated': True,
                    'action_type': action_type,
                    'entity_type': entity_type,
                    'module': module,
                    'priority': priority,
                    'user_id': user.id if user else None,
                    'username': user.username if user else None,
                    'business_critical': action_type in ['DELETE', 'DISPENSE', 'VALIDATE'],
                    'data_change': action_type in ['CREATE', 'UPDATE', 'DELETE']
                }
                
                # Crear el registro
                SystemMovement.objects.create(
                    action_type=action_type,
                    entity_type=entity_type,
                    entity_id=random.randint(1, 1000) if action_type != 'LOGIN' else None,
                    object_id=random.randint(1, 1000) if action_type in ['CREATE', 'UPDATE', 'DELETE'] else None,
                    description=description,
                    user=user,
                    ip_address=f'192.168.1.{random.randint(1, 254)}',
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    session_id=f'session_{random.randint(1000, 9999)}',
                    module=module,
                    function_name=f'{action_type.lower()}_{entity_type.lower()}',
                    timestamp=timestamp,
                    execution_time=random.uniform(50, 2000),  # 50ms-2s (más realista)
                    is_successful=is_successful,
                    priority=priority,
                    error_message=f'Error simulado en {action_type}' if not is_successful else None,
                    tags=tags
                )
                
                records_created += 1
                
                if records_created % 10 == 0:
                    self.stdout.write(f'  {records_created} registros creados...')
                    
            except Exception as e:
                logger.error(f'Error al crear registro de auditoría: {str(e)}')
                continue
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Se generaron {records_created} registros de auditoría importantes exitosamente'
            )
        )
        
        # Mostrar estadísticas
        total_records = SystemMovement.objects.count()
        self.stdout.write(f'Total de registros en la base de datos: {total_records}')
        
        # Estadísticas por tipo de acción
        action_stats = SystemMovement.objects.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        self.stdout.write('\nEstadísticas por tipo de acción:')
        for stat in action_stats:
            self.stdout.write(f'  {stat["action_type"]}: {stat["count"]}')
        
        # Estadísticas por prioridad
        priority_stats = SystemMovement.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('-count')
        
        self.stdout.write('\nEstadísticas por prioridad:')
        for stat in priority_stats:
            self.stdout.write(f'  {stat["priority"]}: {stat["count"]}')
    
    def create_sample_users(self):
        """Crear usuarios de ejemplo si no existen"""
        users = []
        
        try:
            # Intentar usar el modelo User de la app de autenticación
            from apps.authentication.models import User
        except ImportError:
            # Si no existe, usar el modelo User por defecto de Django
            from django.contrib.auth.models import User
        
        # Usuario administrador
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mau.com',
                'first_name': 'Administrador',
                'last_name': 'Sistema',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('  Usuario administrador creado')
        users.append(admin_user)
        
        # Usuario médico
        doctor_user, created = User.objects.get_or_create(
            username='doctor',
            defaults={
                'email': 'doctor@mau.com',
                'first_name': 'Dr. Juan',
                'last_name': 'Pérez',
                'is_staff': False,
                'is_superuser': False
            }
        )
        if created:
            doctor_user.set_password('doctor123')
            doctor_user.save()
            self.stdout.write('  Usuario médico creado')
        users.append(doctor_user)
        
        # Usuario farmacéutico
        pharmacist_user, created = User.objects.get_or_create(
            username='pharmacist',
            defaults={
                'email': 'pharmacist@mau.com',
                'first_name': 'Lic. María',
                'last_name': 'García',
                'is_staff': False,
                'is_superuser': False
            }
        )
        if created:
            pharmacist_user.set_password('pharmacist123')
            pharmacist_user.save()
            self.stdout.write('  Usuario farmacéutico creado')
        users.append(pharmacist_user)
        
        # Usuario enfermero
        nurse_user, created = User.objects.get_or_create(
            username='nurse',
            defaults={
                'email': 'nurse@mau.com',
                'first_name': 'Lic. Carlos',
                'last_name': 'López',
                'is_staff': False,
                'is_superuser': False
            }
        )
        if created:
            nurse_user.set_password('nurse123')
            nurse_user.save()
            self.stdout.write('  Usuario enfermero creado')
        users.append(nurse_user)
        
        return users
