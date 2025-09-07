from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from apps.patients.models import Paciente

class CatalogoMedicamentos(models.Model):
    """Catálogo centralizado de medicamentos disponibles"""
    
    CATEGORIA_CHOICES = [
        ('ANALGESICO', 'Analgésico'),
        ('ANTIBIOTICO', 'Antibiótico'),
        ('ANTIINFLAMATORIO', 'Antiinflamatorio'),
        ('ANTIVIRAL', 'Antiviral'),
        ('CARDIOVASCULAR', 'Cardiovascular'),
        ('DERMATOLOGICO', 'Dermatológico'),
        ('ENDOCRINO', 'Endócrino'),
        ('GASTROINTESTINAL', 'Gastrointestinal'),
        ('GINECOLOGICO', 'Ginecológico'),
        ('HEMATOLOGICO', 'Hematológico'),
        ('IMMUNOLOGICO', 'Inmunológico'),
        ('NEUROLOGICO', 'Neurológico'),
        ('OFTALMOLOGICO', 'Oftalmológico'),
        ('ONCOLOGICO', 'Oncológico'),
        ('OTORRINOLARINGOLOGICO', 'Otorrinolaringológico'),
        ('PSIQUIATRICO', 'Psiquiátrico'),
        ('RESPIRATORIO', 'Respiratorio'),
        ('UROLOGICO', 'Urológico'),
        ('VACUNAS', 'Vacunas'),
        ('VITAMINAS_MINERALES', 'Vitaminas y Minerales'),
        ('OTROS', 'Otros'),
    ]
    
    TIPO_RECETA_CHOICES = [
        ('FARMACIA', 'Farmacia'),
        ('CMI', 'Centro de Mezclas (CMI)'),
        ('AMBOS', 'Ambos'),
    ]
    
    clave = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Clave del Medicamento',
        help_text='Clave única del medicamento (ej: PAR-500)'
    )
    
    nombre = models.CharField(
        max_length=200,
        verbose_name='Nombre del Medicamento',
        help_text='Nombre completo con concentración (ej: Paracetamol 500mg)'
    )
    
    principio_activo = models.CharField(
        max_length=150,
        verbose_name='Principio Activo',
        help_text='Componente activo principal'
    )
    
    concentracion = models.CharField(
        max_length=50,
        verbose_name='Concentración',
        help_text='Concentración del medicamento (ej: 500mg, 10ml)'
    )
    
    forma_farmaceutica = models.CharField(
        max_length=50,
        verbose_name='Forma Farmacéutica',
        help_text='Tableta, jarabe, ampolleta, etc.'
    )
    
    categoria = models.CharField(
        max_length=30,
        choices=CATEGORIA_CHOICES,
        verbose_name='Categoría'
    )
    
    tipo_receta_permitido = models.CharField(
        max_length=10,
        choices=TIPO_RECETA_CHOICES,
        default='AMBOS',
        verbose_name='Tipo de Receta Permitido'
    )
    
    via_administracion = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Vía de Administración',
        help_text='Oral, intravenosa, intramuscular, tópica, etc.'
    )
    
    dosis_sugerida = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Dosis Sugerida',
        help_text='Dosis típica (ej: 1 tableta cada 8 horas)'
    )
    
    contraindicaciones = models.TextField(
        blank=True,
        verbose_name='Contraindicaciones',
        help_text='Principales contraindicaciones'
    )
    
    requiere_refrigeracion = models.BooleanField(
        default=False,
        verbose_name='Requiere Refrigeración'
    )
    
    es_controlado = models.BooleanField(
        default=False,
        verbose_name='Medicamento Controlado'
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        verbose_name = 'Medicamento del Catálogo'
        verbose_name_plural = 'Catálogo de Medicamentos'
        db_table = 'catalogo_medicamentos'
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['clave']),
            models.Index(fields=['nombre']),
            models.Index(fields=['principio_activo']),
            models.Index(fields=['categoria']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        return f"{self.clave} - {self.nombre}"
    
    def get_nombre_completo(self):
        """Retorna el nombre completo formateado"""
        return f"{self.nombre} ({self.forma_farmaceutica})"
    
    def is_available_for_recipe_type(self, tipo_receta):
        """Verifica si está disponible para el tipo de receta"""
        return self.tipo_receta_permitido in ['AMBOS', tipo_receta]

class Receta(models.Model):
    """Modelo para gestionar recetas médicas"""
    
    TIPO_RECETA_CHOICES = [
        ('FARMACIA', 'Farmacia'),
        ('CMI', 'Centro de Mezclas (CMI)'),
    ]
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('VALIDADA', 'Validada'),
        ('PARCIALMENTE_SURTIDA', 'Parcialmente Surtida'),
        ('SURTIDA', 'Surtida'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
        ('URGENTE', 'Urgente'),
    ]
    
    # Folio de receta como Primary Key
    folio_receta = models.AutoField(
        primary_key=True,
        verbose_name='Folio de Receta'
    )
    
    # Relación con paciente
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.CASCADE,
        related_name='recetas',
        verbose_name='Paciente',
        to_field='expediente'
    )
    
    # Información de la receta
    tipo_receta = models.CharField(
        max_length=10,
        choices=TIPO_RECETA_CHOICES,
        verbose_name='Tipo de Receta'
    )
    
    estado = models.CharField(
        max_length=25,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        verbose_name='Estado'
    )
    
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDAD_CHOICES,
        default='MEDIA',
        verbose_name='Prioridad'
    )
    
    servicio_solicitante = models.CharField(
        max_length=100,
        verbose_name='Servicio Solicitante',
        help_text='Ej: Oncología, Medicina Interna, Urgencias, etc.'
    )
    
    diagnostico = models.TextField(
        verbose_name='Diagnóstico',
        help_text='Diagnóstico asociado a la receta'
    )
    
    indicaciones_generales = models.TextField(
        blank=True,
        verbose_name='Indicaciones Generales',
        help_text='Instrucciones generales para el paciente'
    )
    
    observaciones = models.TextField(
        blank=True,
        verbose_name='Observaciones',
        help_text='Observaciones adicionales de validación o dispensación'
    )
    
    fecha_vencimiento = models.DateField(
        blank=True,
        null=True,
        verbose_name='Fecha de Vencimiento',
        help_text='Fecha límite para surtir la receta'
    )
    
    # Información de seguimiento
    prescrito_por = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recetas_prescritas',
        verbose_name='Prescrito por'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    validado_por = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recetas_validadas',
        verbose_name='Validado por'
    )
    
    fecha_validacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Validación'
    )
    
    dispensado_por = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recetas_dispensadas',
        verbose_name='Dispensado por'
    )
    
    fecha_dispensacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Dispensación'
    )
    
    fecha_dispensacion_parcial = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Dispensación Parcial'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        verbose_name = 'Receta'
        verbose_name_plural = 'Recetas'
        db_table = 'recetas'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['tipo_receta']),
            models.Index(fields=['fecha_creacion']),
            models.Index(fields=['servicio_solicitante']),
            models.Index(fields=['prioridad']),
        ]
    
    def __str__(self):
        return f"Receta {self.folio_receta} - {self.paciente.expediente} ({self.get_estado_display()})"
    
    def can_be_validated(self):
        """Verifica si la receta puede ser validada"""
        return self.estado == 'PENDIENTE'
    
    def can_be_dispensed(self):
        """Verifica si la receta puede ser dispensada"""
        return self.estado in ['VALIDADA', 'PARCIALMENTE_SURTIDA']
    
    def get_total_medicamentos(self):
        """Retorna el número total de medicamentos en la receta"""
        return self.detalles.count()
    
    def is_partially_dispensed(self):
        """Verifica si la receta está parcialmente surtida"""
        medicamentos = self.detalles.all()
        if not medicamentos:
            return False
        
        any_dispensed = any(med.cantidad_surtida > 0 for med in medicamentos)
        all_dispensed = all(med.is_completely_dispensed() for med in medicamentos)
        
        return any_dispensed and not all_dispensed
    
    def is_completely_dispensed(self):
        """Verifica si todos los medicamentos están completamente dispensados"""
        medicamentos = self.detalles.all()
        if not medicamentos:
            return False
        return all(med.is_completely_dispensed() for med in medicamentos)

class DetalleReceta(models.Model):
    """Modelo para gestionar los medicamentos dentro de una receta"""
    
    receta = models.ForeignKey(
        Receta,
        on_delete=models.CASCADE,
        related_name='detalles',
        verbose_name='Receta'
    )
    
    # Relación opcional con el catálogo
    medicamento_catalogo = models.ForeignKey(
        CatalogoMedicamentos,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Medicamento del Catálogo'
    )
    
    # Campos tradicionales (se mantienen para compatibilidad)
    clave_medicamento = models.CharField(
        max_length=50,
        verbose_name='Clave del Medicamento'
    )
    
    descripcion_medicamento = models.TextField(
        verbose_name='Descripción del Medicamento'
    )
    
    dosis = models.CharField(
        max_length=200,
        verbose_name='Dosis',
        help_text='Cantidad y frecuencia (ej: 1 tableta cada 8 horas)'
    )
    
    cantidad_prescrita = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Cantidad Prescrita'
    )
    
    cantidad_surtida = models.PositiveIntegerField(
        default=0,
        verbose_name='Cantidad Surtida'
    )
    
    # Información de dispensación
    lote = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Lote'
    )
    
    fecha_caducidad = models.DateField(
        blank=True,
        null=True,
        verbose_name='Fecha de Caducidad'
    )
    
    observaciones_dispensacion = models.TextField(
        blank=True,
        verbose_name='Observaciones de Dispensación'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    class Meta:
        verbose_name = 'Detalle de Receta'
        verbose_name_plural = 'Detalles de Recetas'
        db_table = 'detalle_recetas'
        unique_together = ('receta', 'clave_medicamento')
        indexes = [
            models.Index(fields=['clave_medicamento']),
            models.Index(fields=['cantidad_surtida']),
        ]
    
    def __str__(self):
        return f"{self.clave_medicamento} - {self.descripcion_medicamento}"
    
    def save(self, *args, **kwargs):
        # Auto-completar campos desde el catálogo si está vinculado
        if self.medicamento_catalogo and not self.clave_medicamento:
            self.clave_medicamento = self.medicamento_catalogo.clave
            self.descripcion_medicamento = self.medicamento_catalogo.get_nombre_completo()
        
        # Validar cantidad surtida
        if self.cantidad_surtida > self.cantidad_prescrita:
            raise ValidationError(
                'La cantidad surtida no puede ser mayor a la cantidad prescrita'
            )
        
        super().save(*args, **kwargs)
    
    def is_completely_dispensed(self):
        """Verifica si el medicamento está completamente dispensado"""
        # Priorizar la suma de lotes si existen
        total_lotes_dispensados = self.lotes.aggregate(
            total=models.Sum('cantidad_dispensada')
        )['total'] or 0
        
        if total_lotes_dispensados > 0:
            return total_lotes_dispensados >= self.cantidad_prescrita
        
        # Si no hay lotes, usar dispensación tradicional
        return self.cantidad_surtida >= self.cantidad_prescrita
    
    def get_porcentaje_surtido(self):
        """Calcula el porcentaje surtido del medicamento"""
        if self.cantidad_prescrita == 0:
            return 0
        
        # Priorizar la suma de lotes si existen
        total_lotes_dispensados = self.lotes.aggregate(
            total=models.Sum('cantidad_dispensada')
        )['total'] or 0
        
        if total_lotes_dispensados > 0:
            cantidad_actual = total_lotes_dispensados
        else:
            cantidad_actual = self.cantidad_surtida
        
        porcentaje = (cantidad_actual / self.cantidad_prescrita) * 100
        return min(porcentaje, 100)  # No exceder 100%
    
    def get_cantidad_pendiente(self):
        """Calcula la cantidad pendiente por dispensar"""
        # Priorizar la suma de lotes si existen
        total_lotes_dispensados = self.lotes.aggregate(
            total=models.Sum('cantidad_dispensada')
        )['total'] or 0
        
        if total_lotes_dispensados > 0:
            cantidad_actual = total_lotes_dispensados
        else:
            cantidad_actual = self.cantidad_surtida
        
        return max(0, self.cantidad_prescrita - cantidad_actual)
    
    def get_total_lotes_dispensados(self):
        """Obtiene el total de cantidad dispensada por lotes"""
        return self.lotes.aggregate(
            total=models.Sum('cantidad_dispensada')
        )['total'] or 0

class LoteDetalleReceta(models.Model):
    """Modelo para gestionar múltiples lotes de un mismo medicamento"""
    
    detalle_receta = models.ForeignKey(
        DetalleReceta,
        on_delete=models.CASCADE,
        related_name='lotes',
        verbose_name='Detalle de Receta'
    )
    
    lote = models.CharField(
        max_length=50,
        default='SIN_LOTE',
        verbose_name='Número de Lote'
    )
    
    fecha_caducidad = models.DateField(
        verbose_name='Fecha de Caducidad'
    )
    
    cantidad_dispensada = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Cantidad Dispensada'
    )
    
    observaciones = models.TextField(
        blank=True,
        default='',
        verbose_name='Observaciones'
    )
    
    dispensado_por = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Dispensado por'
    )
    
    fecha_dispensacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Dispensación'
    )
    
    class Meta:
        verbose_name = 'Lote de Medicamento'
        verbose_name_plural = 'Lotes de Medicamentos'
        db_table = 'lotes_detalle_receta'
        ordering = ['-fecha_dispensacion']
    
    def __str__(self):
        return f"Lote {self.lote} - {self.cantidad_dispensada} unidades"
    
    def save(self, *args, **kwargs):
        # Validar que no se exceda la cantidad prescrita
        total_otros_lotes = self.detalle_receta.lotes.exclude(id=self.id).aggregate(
            total=models.Sum('cantidad_dispensada')
        )['total'] or 0
        
        total_con_este_lote = total_otros_lotes + self.cantidad_dispensada
        
        if total_con_este_lote > self.detalle_receta.cantidad_prescrita:
            raise ValidationError(
                f'La cantidad total dispensada ({total_con_este_lote}) '
                f'excede la cantidad prescrita ({self.detalle_receta.cantidad_prescrita})'
            )
        
        super().save(*args, **kwargs)
        
        # Actualizar estado de la receta
        self._update_recipe_status()
    
    def _update_recipe_status(self):
        """Actualiza el estado de la receta basado en el progreso de dispensación"""
        from django.utils import timezone
        
        receta = self.detalle_receta.receta
        
        if receta.is_completely_dispensed():
            receta.estado = 'SURTIDA'
            receta.fecha_dispensacion = timezone.now()
        elif receta.is_partially_dispensed():
            if receta.estado != 'PARCIALMENTE_SURTIDA':
                receta.estado = 'PARCIALMENTE_SURTIDA'
                receta.fecha_dispensacion_parcial = timezone.now()
        
        receta.save()