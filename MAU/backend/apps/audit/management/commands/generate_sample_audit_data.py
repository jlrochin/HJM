from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.audit.models import SystemMovement
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Genera datos de ejemplo para la auditoría del sistema'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Número de registros de auditoría a generar'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Obtener usuarios existentes o crear algunos de ejemplo
        users = list(User.objects.all())
        if not users:
            self.stdout.write('No hay usuarios en el sistema. Creando usuarios de ejemplo...')
            users = self.create_sample_users()
        
        # Tipos de acciones disponibles
        action_types = [
            'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
            'VIEW', 'EXPORT', 'IMPORT', 'VALIDATE', 'REJECT', 
            'APPROVE', 'CANCEL', 'RESTORE', 'ARCHIVE'
        ]
        
        # Tipos de entidades
        entity_types = [
            'Paciente', 'Receta', 'Medicamento', 'Usuario', 
            'Inventario', 'Reporte', 'Notificación', 'Sesión'
        ]
        
        # Módulos del sistema
        modules = [
            'patients', 'prescriptions', 'inventory', 'reports',
            'notifications', 'authentication', 'admin', 'api'
        ]
        
        # Prioridades
        priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        
        self.stdout.write(f'Generando {count} registros de auditoría...')
        
        movements_created = 0
        
        for i in range(count):
            # Generar timestamp aleatorio en los últimos 30 días
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            
            timestamp = timezone.now() - timedelta(
                days=days_ago, 
                hours=hours_ago, 
                minutes=minutes_ago
            )
            
            # Seleccionar valores aleatorios
            user = random.choice(users)
            action_type = random.choice(action_types)
            entity_type = random.choice(entity_types)
            module = random.choice(modules)
            priority = random.choice(priorities)
            
            # Generar descripción
            descriptions = {
                'CREATE': f'Creación de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'UPDATE': f'Actualización de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'DELETE': f'Eliminación de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'LOGIN': f'Inicio de sesión del usuario {user.username}',
                'LOGOUT': f'Cierre de sesión del usuario {user.username}',
                'VIEW': f'Visualización de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'EXPORT': f'Exportación de datos de {entity_type.lower()}',
                'IMPORT': f'Importación de datos de {entity_type.lower()}',
                'VALIDATE': f'Validación de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'REJECT': f'Rechazo de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'APPROVE': f'Aprobación de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'CANCEL': f'Cancelación de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'RESTORE': f'Restauración de {entity_type.lower()} #{random.randint(1000, 9999)}',
                'ARCHIVE': f'Archivado de {entity_type.lower()} #{random.randint(1000, 9999)}'
            }
            
            description = descriptions.get(action_type, f'Acción {action_type} en {entity_type}')
            
            # Crear el movimiento
            movement = SystemMovement.objects.create(
                action_type=action_type,
                description=description,
                user=user,
                entity_type=entity_type,
                entity_id=str(random.randint(1000, 9999)),
                module=module,
                function_name=f'handle_{action_type.lower()}',
                ip_address=f'192.168.1.{random.randint(1, 255)}',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                priority=priority,
                is_successful=random.choice([True, True, True, False]),  # 75% éxito
                timestamp=timestamp,
                execution_time=random.uniform(10, 500),  # 10-500ms
                changes={'field': 'value'} if action_type in ['CREATE', 'UPDATE'] else None,
                metadata={'source': 'web', 'session_id': f'session_{random.randint(1000, 9999)}'}
            )
            
            movements_created += 1
            
            if movements_created % 10 == 0:
                self.stdout.write(f'Creados {movements_created} registros...')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Se generaron exitosamente {movements_created} registros de auditoría'
            )
        )
    
    def create_sample_users(self):
        """Crea usuarios de ejemplo si no existen"""
        users = []
        
        sample_users = [
            {'username': 'admin', 'first_name': 'Administrador', 'last_name': 'Sistema', 'email': 'admin@mau.com'},
            {'username': 'farmacia1', 'first_name': 'Juan', 'last_name': 'Farmacia', 'email': 'farmacia@mau.com'},
            {'username': 'atencion1', 'first_name': 'María', 'last_name': 'Atención', 'email': 'atencion@mau.com'},
            {'username': 'cmi1', 'first_name': 'Carlos', 'last_name': 'CMI', 'email': 'cmi@mau.com'},
            {'username': 'medico1', 'first_name': 'Dr. Ana', 'last_name': 'Médico', 'email': 'medico@mau.com'},
        ]
        
        for user_data in sample_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Usuario creado: {user.username}')
            users.append(user)
        
        return users
