from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class Supplier(models.Model):
    """Proveedores de medicamentos"""
    
    name = models.CharField(max_length=200, verbose_name='Nombre del Proveedor')
    contact_person = models.CharField(max_length=150, verbose_name='Persona de Contacto')
    phone = models.CharField(max_length=20, verbose_name='Teléfono')
    email = models.EmailField(verbose_name='Email')
    address = models.TextField(verbose_name='Dirección')
    tax_id = models.CharField(max_length=50, unique=True, verbose_name='RFC/ID Fiscal')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MedicationCatalog(models.Model):
    """Catálogo maestro de medicamentos"""
    
    MEDICATION_TYPES = [
        ('GENERIC', 'Genérico'),
        ('BRAND', 'Marca'),
        ('BIOSIMILAR', 'Biosimilar'),
        ('MAGISTRAL', 'Magistral'),
    ]
    
    FORM_TYPES = [
        ('TABLET', 'Tableta'),
        ('CAPSULE', 'Cápsula'),
        ('SYRUP', 'Jarabe'),
        ('INJECTION', 'Inyección'),
        ('CREAM', 'Crema'),
        ('DROPS', 'Gotas'),
        ('INHALER', 'Inhalador'),
        ('PATCH', 'Parche'),
        ('SUPPOSITORY', 'Supositorio'),
    ]
    
    code = models.CharField(max_length=50, unique=True, verbose_name='Código')
    name = models.CharField(max_length=300, verbose_name='Nombre')
    active_ingredient = models.CharField(max_length=200, verbose_name='Principio Activo')
    concentration = models.CharField(max_length=100, verbose_name='Concentración')
    pharmaceutical_form = models.CharField(max_length=20, choices=FORM_TYPES, verbose_name='Forma Farmacéutica')
    medication_type = models.CharField(max_length=20, choices=MEDICATION_TYPES, verbose_name='Tipo')
    atc_code = models.CharField(max_length=10, blank=True, null=True, verbose_name='Código ATC')
    therapeutic_group = models.CharField(max_length=100, verbose_name='Grupo Terapéutico')
    requires_prescription = models.BooleanField(default=True, verbose_name='Requiere Receta')
    controlled_substance = models.BooleanField(default=False, verbose_name='Sustancia Controlada')
    unit_of_measure = models.CharField(max_length=50, verbose_name='Unidad de Medida')
    minimum_stock = models.PositiveIntegerField(default=10, verbose_name='Stock Mínimo')
    maximum_stock = models.PositiveIntegerField(default=1000, verbose_name='Stock Máximo')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Medicamento'
        verbose_name_plural = 'Catálogo de Medicamentos'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['active_ingredient']),
            models.Index(fields=['therapeutic_group']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.concentration}"


class InventoryStock(models.Model):
    """Stock actual de medicamentos en inventario"""
    
    STORAGE_CONDITIONS = [
        ('ROOM_TEMP', 'Temperatura Ambiente'),
        ('REFRIGERATED', 'Refrigerado (2-8°C)'),
        ('FROZEN', 'Congelado (-18°C)'),
        ('CONTROLLED_TEMP', 'Temperatura Controlada'),
    ]
    
    medication = models.OneToOneField(
        MedicationCatalog,
        on_delete=models.CASCADE,
        related_name='stock',
        verbose_name='Medicamento'
    )
    current_stock = models.PositiveIntegerField(default=0, verbose_name='Stock Actual')
    reserved_stock = models.PositiveIntegerField(default=0, verbose_name='Stock Reservado')
    # available_stock se calculará como property en lugar de GeneratedField
    average_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Costo Promedio'
    )
    last_purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Último Precio de Compra'
    )
    storage_location = models.CharField(max_length=100, verbose_name='Ubicación de Almacenamiento')
    storage_conditions = models.CharField(
        max_length=20,
        choices=STORAGE_CONDITIONS,
        default='ROOM_TEMP',
        verbose_name='Condiciones de Almacenamiento'
    )
    last_movement_date = models.DateTimeField(default=timezone.now, verbose_name='Última Fecha de Movimiento')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    
    class Meta:
        verbose_name = 'Stock de Inventario'
        verbose_name_plural = 'Stock de Inventario'
    
    def __str__(self):
        return f"{self.medication.name} - Stock: {self.current_stock}"
    
    @property
    def available_stock(self):
        """Stock disponible (stock actual - stock reservado)"""
        return max(0, self.current_stock - self.reserved_stock)
    
    @property
    def is_low_stock(self):
        return self.available_stock <= self.medication.minimum_stock
    
    @property
    def is_out_of_stock(self):
        return self.available_stock <= 0


class InventoryBatch(models.Model):
    """Lotes específicos de medicamentos en inventario"""
    
    stock = models.ForeignKey(
        InventoryStock,
        on_delete=models.CASCADE,
        related_name='batches',
        verbose_name='Stock'
    )
    batch_number = models.CharField(max_length=100, verbose_name='Número de Lote')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, verbose_name='Proveedor')
    manufacturing_date = models.DateField(verbose_name='Fecha de Fabricación')
    expiry_date = models.DateField(verbose_name='Fecha de Vencimiento')
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)], verbose_name='Cantidad')
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Costo Unitario')
    purchase_date = models.DateField(verbose_name='Fecha de Compra')
    received_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Recibido por')
    is_quarantined = models.BooleanField(default=False, verbose_name='En Cuarentena')
    quarantine_reason = models.TextField(blank=True, null=True, verbose_name='Motivo de Cuarentena')
    quality_checked = models.BooleanField(default=False, verbose_name='Control de Calidad')
    notes = models.TextField(blank=True, null=True, verbose_name='Notas')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Lote de Inventario'
        verbose_name_plural = 'Lotes de Inventario'
        unique_together = [['stock', 'batch_number']]
        ordering = ['expiry_date']
        indexes = [
            models.Index(fields=['batch_number']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['supplier']),
        ]
    
    def __str__(self):
        return f"Lote {self.batch_number} - {self.stock.medication.name}"
    
    @property
    def is_expired(self):
        return self.expiry_date < timezone.now().date()
    
    @property
    def days_to_expiry(self):
        delta = self.expiry_date - timezone.now().date()
        return delta.days


class MedicamentoStock(models.Model):
    """Stock simplificado de medicamentos usando CatalogoMedicamentos"""
    
    STORAGE_CONDITIONS = [
        ('ROOM_TEMP', 'Temperatura Ambiente'),
        ('REFRIGERATED', 'Refrigerado (2-8°C)'),
        ('FROZEN', 'Congelado (-18°C)'),
        ('CONTROLLED_TEMP', 'Temperatura Controlada'),
    ]
    
    medicamento_catalogo = models.ForeignKey(
        'prescriptions.CatalogoMedicamentos',
        on_delete=models.CASCADE,
        related_name='stock_records',
        verbose_name='Medicamento'
    )
    current_stock = models.PositiveIntegerField(default=0, verbose_name='Stock Actual')
    reserved_stock = models.PositiveIntegerField(default=0, verbose_name='Stock Reservado')
    average_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Costo Promedio'
    )
    last_purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Último Precio de Compra'
    )
    storage_location = models.CharField(max_length=100, verbose_name='Ubicación de Almacenamiento', default='Farmacia General')
    storage_conditions = models.CharField(
        max_length=20,
        choices=STORAGE_CONDITIONS,
        default='ROOM_TEMP',
        verbose_name='Condiciones de Almacenamiento'
    )
    last_movement_date = models.DateTimeField(default=timezone.now, verbose_name='Última Fecha de Movimiento')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Stock de Medicamento'
        verbose_name_plural = 'Stock de Medicamentos'
        indexes = [
            models.Index(fields=['medicamento_catalogo']),
            models.Index(fields=['current_stock']),
        ]
    
    def __str__(self):
        return f"{self.medicamento_catalogo.nombre} - Stock: {self.current_stock}"
    
    @property
    def available_stock(self):
        """Stock disponible (stock actual - stock reservado)"""
        return max(0, self.current_stock - self.reserved_stock)
    
    @property
    def is_low_stock(self):
        return self.available_stock <= 20  # Stock mínimo por defecto
    
    @property
    def is_out_of_stock(self):
        return self.available_stock <= 0


class InventoryMovement(models.Model):
    """Movimientos de inventario (entradas y salidas)"""
    
    MOVEMENT_TYPES = [
        ('ENTRY', 'Entrada'),
        ('EXIT', 'Salida'),
        ('ADJUSTMENT', 'Ajuste'),
        ('TRANSFER', 'Transferencia'),
        ('WASTE', 'Desperdicio'),
        ('EXPIRY', 'Vencimiento'),
    ]
    
    MOVEMENT_REASONS = [
        ('PURCHASE', 'Compra'),
        ('DISPENSING', 'Dispensación'),
        ('RETURN', 'Devolución'),
        ('DAMAGED', 'Dañado'),
        ('EXPIRED', 'Vencido'),
        ('INVENTORY_COUNT', 'Conteo de Inventario'),
        ('TRANSFER_IN', 'Transferencia Entrada'),
        ('TRANSFER_OUT', 'Transferencia Salida'),
    ]
    
    stock = models.ForeignKey(
        InventoryStock,
        on_delete=models.CASCADE,
        related_name='movements',
        verbose_name='Stock'
    )
    batch = models.ForeignKey(
        InventoryBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Lote'
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES, verbose_name='Tipo de Movimiento')
    reason = models.CharField(max_length=20, choices=MOVEMENT_REASONS, verbose_name='Motivo')
    quantity = models.IntegerField(verbose_name='Cantidad')  # Puede ser negativo para salidas
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Costo Unitario'
    )
    reference_document = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Documento de Referencia'
    )
    notes = models.TextField(blank=True, null=True, verbose_name='Notas')
    processed_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Procesado por')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Fecha y Hora')
    
    # Campos para integración con recetas
    related_prescription = models.ForeignKey(
        'prescriptions.Receta',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Receta Relacionada'
    )
    related_prescription_detail = models.ForeignKey(
        'prescriptions.DetalleReceta',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Detalle de Receta Relacionado'
    )
    
    class Meta:
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['movement_type', 'timestamp']),
            models.Index(fields=['reason', 'timestamp']),
            models.Index(fields=['processed_by', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.stock.medication.name} - {self.quantity}"


class InventoryAlert(models.Model):
    """Alertas del sistema de inventario"""
    
    ALERT_TYPES = [
        ('LOW_STOCK', 'Stock Bajo'),
        ('OUT_OF_STOCK', 'Sin Stock'),
        ('NEAR_EXPIRY', 'Próximo a Vencer'),
        ('EXPIRED', 'Vencido'),
        ('QUALITY_ISSUE', 'Problema de Calidad'),
        ('SYSTEM_ERROR', 'Error del Sistema'),
    ]
    
    ALERT_PRIORITIES = [
        ('LOW', 'Baja'),
        ('MEDIUM', 'Media'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES, verbose_name='Tipo de Alerta')
    priority = models.CharField(max_length=10, choices=ALERT_PRIORITIES, verbose_name='Prioridad')
    title = models.CharField(max_length=200, verbose_name='Título')
    message = models.TextField(verbose_name='Mensaje')
    medication = models.ForeignKey(
        MedicationCatalog,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Medicamento'
    )
    batch = models.ForeignKey(
        InventoryBatch,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Lote'
    )
    is_acknowledged = models.BooleanField(default=False, verbose_name='Reconocida')
    acknowledged_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts',
        verbose_name='Reconocida por'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Reconocimiento')
    is_resolved = models.BooleanField(default=False, verbose_name='Resuelta')
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts',
        verbose_name='Resuelta por'
    )
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Resolución')
    resolution_notes = models.TextField(blank=True, null=True, verbose_name='Notas de Resolución')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Alerta de Inventario'
        verbose_name_plural = 'Alertas de Inventario'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'is_resolved']),
            models.Index(fields=['priority', 'is_acknowledged']),
        ]
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title}"
