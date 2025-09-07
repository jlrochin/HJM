from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ReportTemplate(models.Model):
    """Plantillas de reportes predefinidas"""
    
    REPORT_TYPES = [
        ('DAILY', 'Reporte Diario'),
        ('WEEKLY', 'Reporte Semanal'),
        ('MONTHLY', 'Reporte Mensual'),
        ('CUSTOM', 'Reporte Personalizado'),
        ('PERFORMANCE', 'Reporte de Rendimiento'),
        ('INVENTORY', 'Reporte de Inventario'),
        ('AUDIT', 'Reporte de Auditoría'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Nombre del Reporte')
    description = models.TextField(verbose_name='Descripción')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, verbose_name='Tipo de Reporte')
    query_template = models.JSONField(verbose_name='Plantilla de Consulta')
    visualization_config = models.JSONField(default=dict, verbose_name='Configuración de Visualización')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Creado por')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Plantilla de Reporte'
        verbose_name_plural = 'Plantillas de Reportes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class GeneratedReport(models.Model):
    """Reportes generados y sus resultados"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('PROCESSING', 'Procesando'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
    ]
    
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, verbose_name='Plantilla')
    title = models.CharField(max_length=300, verbose_name='Título del Reporte')
    parameters = models.JSONField(default=dict, verbose_name='Parámetros')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Estado')
    data = models.JSONField(null=True, blank=True, verbose_name='Datos del Reporte')
    file_path = models.CharField(max_length=500, null=True, blank=True, verbose_name='Ruta del Archivo')
    generated_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Generado por')
    date_from = models.DateTimeField(verbose_name='Fecha Desde')
    date_to = models.DateTimeField(verbose_name='Fecha Hasta')
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Generación')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Finalización')
    
    class Meta:
        verbose_name = 'Reporte Generado'
        verbose_name_plural = 'Reportes Generados'
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class SystemMetrics(models.Model):
    """Métricas del sistema para dashboards en tiempo real"""
    
    metric_name = models.CharField(max_length=100, verbose_name='Nombre de la Métrica')
    metric_value = models.DecimalField(max_digits=15, decimal_places=4, verbose_name='Valor')
    metric_unit = models.CharField(max_length=50, default='count', verbose_name='Unidad')
    category = models.CharField(max_length=100, verbose_name='Categoría')
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='Timestamp')
    metadata = models.JSONField(default=dict, verbose_name='Metadatos')
    
    class Meta:
        verbose_name = 'Métrica del Sistema'
        verbose_name_plural = 'Métricas del Sistema'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['metric_name', 'timestamp']),
            models.Index(fields=['category', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.metric_name}: {self.metric_value} {self.metric_unit}"


class AuditLog(models.Model):
    """Log de auditoría para todas las acciones del sistema"""
    
    ACTION_TYPES = [
        ('CREATE', 'Crear'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('VIEW', 'Ver'),
        ('LOGIN', 'Iniciar Sesión'),
        ('LOGOUT', 'Cerrar Sesión'),
        ('DISPENSE', 'Dispensar'),
        ('VALIDATE', 'Validar'),
        ('CANCEL', 'Cancelar'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Usuario')
    action = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name='Acción')
    model_name = models.CharField(max_length=100, verbose_name='Modelo')
    object_id = models.CharField(max_length=100, null=True, blank=True, verbose_name='ID del Objeto')
    object_repr = models.CharField(max_length=300, verbose_name='Representación del Objeto')
    changes = models.JSONField(default=dict, verbose_name='Cambios')
    ip_address = models.GenericIPAddressField(verbose_name='Dirección IP')
    user_agent = models.TextField(verbose_name='User Agent')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Timestamp')
    session_key = models.CharField(max_length=100, null=True, blank=True, verbose_name='Clave de Sesión')
    
    class Meta:
        verbose_name = 'Log de Auditoría'
        verbose_name_plural = 'Logs de Auditoría'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['model_name', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.get_action_display()} - {self.object_repr}"
