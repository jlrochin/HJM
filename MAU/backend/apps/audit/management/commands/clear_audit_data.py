from django.core.management.base import BaseCommand
from apps.audit.models import SystemMovement
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Borrar todos los registros de auditoría existentes'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Confirmar la eliminación sin preguntar'
        )
    
    def handle(self, *args, **options):
        # Contar registros existentes
        total_records = SystemMovement.objects.count()
        
        if total_records == 0:
            self.stdout.write(
                self.style.WARNING('No hay registros de auditoría para eliminar.')
            )
            return
        
        # Confirmar la eliminación
        if not options['yes']:
            confirm = input(
                f'¿Estás seguro de que quieres eliminar {total_records} registros de auditoría? (yes/no): '
            )
            if confirm.lower() not in ['yes', 'y', 'si', 's']:
                self.stdout.write(
                    self.style.WARNING('Operación cancelada.')
                )
                return
        
        try:
            # Eliminar todos los registros
            deleted_count = SystemMovement.objects.all().delete()[0]
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Se eliminaron {deleted_count} registros de auditoría exitosamente'
                )
            )
            
            # Verificar que se eliminaron todos
            remaining_records = SystemMovement.objects.count()
            if remaining_records == 0:
                self.stdout.write(
                    self.style.SUCCESS('✅ Base de datos de auditoría completamente limpia')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  Quedaron {remaining_records} registros sin eliminar'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error al eliminar registros: {str(e)}')
            )
            logger.error(f'Error al eliminar registros de auditoría: {str(e)}')
