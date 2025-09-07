from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
import json

User = get_user_model()

class SystemMovement(models.Model):
    """Modelo para registrar todos los movimientos del sistema"""
    
    ACTION_TYPES = [
        ('CREATE', 'Creación'),
        ('UPDATE', 'Actualización'),
        ('DELETE', 'Eliminación'),
        ('LOGIN', 'Inicio de Sesión'),
        ('LOGOUT', 'Cierre de Sesión'),
        ('VIEW', 'Visualización'),
        ('EXPORT', 'Exportación'),
        ('IMPORT', 'Importación'),
        ('VALIDATE', 'Validación'),
        ('REJECT', 'Rechazo'),
        ('APPROVE', 'Aprobación'),
        ('CANCEL', 'Cancelación'),
        ('RESTORE', 'Restauración'),
        ('ARCHIVE', 'Archivado'),
        ('OTHER', 'Otro'),
    ]
    
    # Información básica del movimiento
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_TYPES,
        verbose_name='Tipo de Acción'
    )
    
    description = models.TextField(
        verbose_name='Descripción del Movimiento'
    )
    
    # Usuario que realizó la acción
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Usuario',
        related_name='system_movements'
    )
    
    # Entidad afectada (opcional, para movimientos que no afectan entidades específicas)
    entity_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Tipo de Entidad'
    )
    
    entity_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='ID de la Entidad'
    )
    
    # Referencia genérica a la entidad (más flexible)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Tipo de Contenido'
    )
    
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='ID del Objeto'
    )
    
    content_object = GenericForeignKey(
        'content_type',
        'object_id'
    )
    
    # Cambios realizados (JSON)
    changes = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Cambios Realizados'
    )
    
    # Metadatos adicionales
    metadata = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Metadatos Adicionales'
    )
    
    # Información de la sesión
    session_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='ID de Sesión'
    )
    
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name='Dirección IP'
    )
    
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name='User Agent'
    )
    
    # Información del módulo/función
    module = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Módulo/Función'
    )
    
    function_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Nombre de la Función'
    )
    
    # Timestamps
    timestamp = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha y Hora'
    )
    
    # Información de rendimiento (opcional)
    execution_time = models.FloatField(
        blank=True,
        null=True,
        verbose_name='Tiempo de Ejecución (ms)'
    )
    
    # Estado del movimiento
    is_successful = models.BooleanField(
        default=True,
        verbose_name='Ejecutado Exitosamente'
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensaje de Error'
    )
    
    # Campos para auditoría avanzada
    related_movements = models.ManyToManyField(
        'self',
        blank=True,
        verbose_name='Movimientos Relacionados',
        symmetrical=False
    )
    
    parent_movement = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Movimiento Padre',
        related_name='child_movements'
    )
    
    # Prioridad del movimiento para análisis
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Baja'),
            ('MEDIUM', 'Media'),
            ('HIGH', 'Alta'),
            ('CRITICAL', 'Crítica'),
        ],
        default='MEDIUM',
        verbose_name='Prioridad'
    )
    
    # Etiquetas para categorización
    tags = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Etiquetas'
    )
    
    class Meta:
        verbose_name = 'Movimiento del Sistema'
        verbose_name_plural = 'Movimientos del Sistema'
        db_table = 'system_movements'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action_type']),
            models.Index(fields=['entity_type']),
            models.Index(fields=['user']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['module']),
            models.Index(fields=['is_successful']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.description[:50]} - {self.timestamp}"
    
    def get_changes_display(self):
        """Retorna los cambios en formato legible"""
        if not self.changes:
            return "Sin cambios"
        
        try:
            return json.dumps(self.changes, indent=2, ensure_ascii=False)
        except:
            return str(self.changes)
    
    def get_metadata_display(self):
        """Retorna los metadatos en formato legible"""
        if not self.metadata:
            return "Sin metadatos"
        
        try:
            return json.dumps(self.metadata, indent=2, ensure_ascii=False)
        except:
            return str(self.metadata)
    
    def get_duration_display(self):
        """Retorna la duración en formato legible"""
        if not self.execution_time:
            return "N/A"
        
        if self.execution_time < 1000:
            return f"{self.execution_time:.2f} ms"
        else:
            return f"{(self.execution_time / 1000):.2f} s"
    
    def is_recent(self, hours=24):
        """Verifica si el movimiento es reciente"""
        from django.utils import timezone
        return self.timestamp >= timezone.now() - timezone.timedelta(hours=hours)
    
    def get_severity_color(self):
        """Retorna el color CSS para la severidad"""
        if self.action_type == 'DELETE':
            return 'text-red-600'
        elif self.action_type == 'UPDATE':
            return 'text-yellow-600'
        elif self.action_type == 'CREATE':
            return 'text-green-600'
        else:
            return 'text-blue-600'


class MovementTemplate(models.Model):
    """Plantillas para movimientos comunes del sistema"""
    
    name = models.CharField(
        max_length=100,
        verbose_name='Nombre de la Plantilla'
    )
    
    description = models.CharField(
        max_length=200,
        verbose_name='Descripción'
    )
    
    action_type = models.CharField(
        max_length=20,
        choices=SystemMovement.ACTION_TYPES,
        verbose_name='Tipo de Acción'
    )
    
    entity_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Tipo de Entidad'
    )
    
    module = models.CharField(
        max_length=100,
        verbose_name='Módulo'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activa'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    class Meta:
        verbose_name = 'Plantilla de Movimiento'
        verbose_name_plural = 'Plantillas de Movimientos'
        db_table = 'movement_templates'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.get_action_type_display()}"
