from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class NotificationChannel(models.Model):
    """Canales de notificación del sistema"""
    
    CHANNEL_TYPES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'Notificación en App'),
        ('WEBHOOK', 'Webhook'),
        ('WEBSOCKET', 'WebSocket'),
    ]
    
    name = models.CharField(max_length=100, unique=True, verbose_name='Nombre del Canal')
    channel_type = models.CharField(max_length=20, choices=CHANNEL_TYPES, verbose_name='Tipo de Canal')
    configuration = models.JSONField(default=dict, verbose_name='Configuración')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Canal de Notificación'
        verbose_name_plural = 'Canales de Notificación'
    
    def __str__(self):
        return f"{self.name} ({self.get_channel_type_display()})"


class NotificationTemplate(models.Model):
    """Plantillas de notificaciones"""
    
    EVENT_TYPES = [
        ('RECIPE_CREATED', 'Receta Creada'),
        ('RECIPE_VALIDATED', 'Receta Validada'),
        ('RECIPE_DISPENSED', 'Receta Dispensada'),
        ('RECIPE_CANCELLED', 'Receta Cancelada'),
        ('STOCK_LOW', 'Stock Bajo'),
        ('STOCK_OUT', 'Sin Stock'),
        ('MEDICATION_EXPIRED', 'Medicamento Vencido'),
        ('USER_LOGIN', 'Inicio de Sesión'),
        ('SYSTEM_ERROR', 'Error del Sistema'),
        ('URGENT_RECIPE', 'Receta Urgente'),
        ('PARTIAL_DISPENSING', 'Dispensación Parcial'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Nombre de la Plantilla')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES, verbose_name='Tipo de Evento')
    title_template = models.CharField(max_length=200, verbose_name='Plantilla del Título')
    body_template = models.TextField(verbose_name='Plantilla del Cuerpo')
    channels = models.ManyToManyField(NotificationChannel, verbose_name='Canales')
    target_roles = models.JSONField(default=list, verbose_name='Roles Objetivo')
    is_active = models.BooleanField(default=True, verbose_name='Activa')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Plantilla de Notificación'
        verbose_name_plural = 'Plantillas de Notificación'
        unique_together = [['event_type', 'name']]
    
    def __str__(self):
        return f"{self.name} - {self.get_event_type_display()}"


class Notification(models.Model):
    """Notificaciones enviadas a usuarios"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('SENT', 'Enviada'),
        ('DELIVERED', 'Entregada'),
        ('READ', 'Leída'),
        ('FAILED', 'Fallida'),
        ('CANCELLED', 'Cancelada'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Baja'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'Alta'),
        ('URGENT', 'Urgente'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Destinatario')
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Plantilla'
    )
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE, verbose_name='Canal')
    title = models.CharField(max_length=200, verbose_name='Título')
    body = models.TextField(verbose_name='Cuerpo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL', verbose_name='Prioridad')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Estado')
    
    # Metadatos adicionales
    metadata = models.JSONField(default=dict, verbose_name='Metadatos')
    context_data = models.JSONField(default=dict, verbose_name='Datos de Contexto')
    
    # Campos relacionados con objetos del sistema
    related_recipe = models.ForeignKey(
        'prescriptions.Receta',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Receta Relacionada'
    )
    related_patient = models.ForeignKey(
        'patients.Paciente',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Paciente Relacionado'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Envío')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Entrega')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Lectura')
    
    # Campos para reintento automático
    retry_count = models.PositiveIntegerField(default=0, verbose_name='Intentos de Reenvío')
    max_retries = models.PositiveIntegerField(default=3, verbose_name='Máximo de Reintentos')
    next_retry_at = models.DateTimeField(null=True, blank=True, verbose_name='Próximo Reintento')
    
    # Campo para agrupación de notificaciones
    group_key = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name='Clave de Agrupación'
    )
    
    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['priority', 'created_at']),
            models.Index(fields=['group_key']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.get_full_name()}"
    
    def mark_as_read(self):
        """Marcar notificación como leída"""
        if self.status != 'READ':
            self.status = 'READ'
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])


class NotificationSubscription(models.Model):
    """Suscripciones de usuarios a tipos de notificaciones"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Usuario')
    event_type = models.CharField(max_length=30, verbose_name='Tipo de Evento')
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE, verbose_name='Canal')
    is_enabled = models.BooleanField(default=True, verbose_name='Habilitada')
    preferences = models.JSONField(default=dict, verbose_name='Preferencias')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Suscripción de Notificación'
        verbose_name_plural = 'Suscripciones de Notificación'
        unique_together = [['user', 'event_type', 'channel']]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event_type} - {self.channel.name}"


class WebSocketConnection(models.Model):
    """Conexiones WebSocket activas para notificaciones en tiempo real"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Usuario')
    connection_id = models.CharField(max_length=100, unique=True, verbose_name='ID de Conexión')
    channel_name = models.CharField(max_length=100, verbose_name='Nombre del Canal')
    ip_address = models.GenericIPAddressField(verbose_name='Dirección IP')
    user_agent = models.TextField(verbose_name='User Agent')
    connected_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Conexión')
    last_ping = models.DateTimeField(default=timezone.now, verbose_name='Último Ping')
    is_active = models.BooleanField(default=True, verbose_name='Activa')
    
    class Meta:
        verbose_name = 'Conexión WebSocket'
        verbose_name_plural = 'Conexiones WebSocket'
        ordering = ['-connected_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.connection_id}"
    
    def is_stale(self, timeout_minutes=30):
        """Verificar si la conexión está obsoleta"""
        timeout = timezone.now() - timezone.timedelta(minutes=timeout_minutes)
        return self.last_ping < timeout


class NotificationSummary(models.Model):
    """Resúmenes de notificaciones para reporting"""
    
    date = models.DateField(verbose_name='Fecha')
    event_type = models.CharField(max_length=30, verbose_name='Tipo de Evento')
    channel_type = models.CharField(max_length=20, verbose_name='Tipo de Canal')
    total_sent = models.PositiveIntegerField(default=0, verbose_name='Total Enviadas')
    total_delivered = models.PositiveIntegerField(default=0, verbose_name='Total Entregadas')
    total_read = models.PositiveIntegerField(default=0, verbose_name='Total Leídas')
    total_failed = models.PositiveIntegerField(default=0, verbose_name='Total Fallidas')
    
    class Meta:
        verbose_name = 'Resumen de Notificaciones'
        verbose_name_plural = 'Resúmenes de Notificaciones'
        unique_together = [['date', 'event_type', 'channel_type']]
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.date} - {self.event_type} - {self.channel_type}"
    
    @property
    def delivery_rate(self):
        """Tasa de entrega"""
        if self.total_sent == 0:
            return 0
        return (self.total_delivered / self.total_sent) * 100
    
    @property
    def read_rate(self):
        """Tasa de lectura"""
        if self.total_delivered == 0:
            return 0
        return (self.total_read / self.total_delivered) * 100
