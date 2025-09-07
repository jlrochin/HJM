from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.patients.models import Paciente
from apps.prescriptions.models import Receta


class Command(BaseCommand):
    help = 'Actualiza el estado de los pacientes basado en su actividad. Pacientes con más de 4 años sin movimientos se inactivan.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Ejecutar sin hacer cambios reales en la base de datos',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forzar la actualización de todos los pacientes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        # Fecha límite: 4 años atrás desde hoy
        fecha_limite = timezone.now() - timedelta(days=4*365)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Iniciando actualización de estado de pacientes...'
            )
        )
        self.stdout.write(
            f'Fecha límite para actividad: {fecha_limite.strftime("%d/%m/%Y")}'
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('MODO DRY-RUN: No se harán cambios reales')
            )
        
        # Obtener todos los pacientes
        pacientes = Paciente.objects.all()
        total_pacientes = pacientes.count()
        
        self.stdout.write(f'Total de pacientes: {total_pacientes}')
        
        pacientes_activos = 0
        pacientes_inactivos = 0
        pacientes_actualizados = 0
        
        for paciente in pacientes:
            # Verificar si el paciente ha tenido actividad reciente
            # Buscar la receta más reciente del paciente
            ultima_receta = Receta.objects.filter(
                paciente=paciente
            ).order_by('-created_at').first()
            
            # Buscar la última actualización del paciente
            ultima_actividad = paciente.updated_at
            
            # Si hay recetas, usar la fecha de la más reciente
            if ultima_receta and ultima_receta.created_at > ultima_actividad:
                ultima_actividad = ultima_receta.created_at
            
            # Determinar si debe estar activo
            debe_estar_activo = ultima_actividad >= fecha_limite
            
            # Verificar si el estado actual es correcto
            if paciente.is_active != debe_estar_activo:
                if not dry_run:
                    paciente.is_active = debe_estar_activo
                    paciente.save(update_fields=['is_active'])
                    pacientes_actualizados += 1
                
                self.stdout.write(
                    f'Paciente {paciente.expediente} - {paciente.get_nombre_completo()}: '
                    f'{"ACTIVADO" if debe_estar_activo else "INACTIVADO"} '
                    f'(Última actividad: {ultima_actividad.strftime("%d/%m/%Y")})'
                )
            
            # Contar estados
            if paciente.is_active:
                pacientes_activos += 1
            else:
                pacientes_inactivos += 1
        
        # Resumen final
        self.stdout.write('\n' + '='*50)
        self.stdout.write('RESUMEN DE ACTUALIZACIÓN')
        self.stdout.write('='*50)
        self.stdout.write(f'Total de pacientes: {total_pacientes}')
        self.stdout.write(f'Pacientes activos: {pacientes_activos}')
        self.stdout.write(f'Pacientes inactivos: {pacientes_inactivos}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'Pacientes que se actualizarían: {pacientes_actualizados}'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Pacientes actualizados: {pacientes_actualizados}'
                )
            )
        
        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    '✅ Actualización completada exitosamente'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    '🔍 DRY-RUN completado. Ejecuta sin --dry-run para aplicar cambios'
                )
            )
