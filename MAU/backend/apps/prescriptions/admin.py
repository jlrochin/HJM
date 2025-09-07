from django.contrib import admin
from .models import Receta, DetalleReceta, CatalogoMedicamentos, LoteDetalleReceta

class DetalleRecetaInline(admin.TabularInline):
    """Inline para mostrar detalles de receta en el admin"""
    model = DetalleReceta
    extra = 0
    fields = [
        'medicamento_catalogo', 'clave_medicamento', 'descripcion_medicamento', 'dosis',
        'cantidad_prescrita', 'cantidad_surtida', 'lote', 'fecha_caducidad'
    ]
    readonly_fields = ['fecha_creacion']

@admin.register(Receta)
class RecetaAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo Receta"""
    
    list_display = [
        'folio_receta', 'paciente', 'tipo_receta', 'estado',
        'prioridad', 'servicio_solicitante', 'fecha_creacion',
        'prescrito_por'
    ]
    
    list_filter = [
        'tipo_receta', 'estado', 'prioridad', 'servicio_solicitante',
        'fecha_creacion', 'fecha_validacion', 'fecha_dispensacion'
    ]
    
    search_fields = [
        'folio_receta', 'paciente__expediente', 'paciente__nombre',
        'diagnostico', 'servicio_solicitante'
    ]
    
    readonly_fields = [
        'folio_receta', 'fecha_creacion', 'fecha_actualizacion'
    ]
    
    ordering = ['-fecha_creacion']
    
    inlines = [DetalleRecetaInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'folio_receta', 'paciente', 'tipo_receta',
                'estado', 'prioridad'
            )
        }),
        ('Información Médica', {
            'fields': (
                'servicio_solicitante', 'diagnostico',
                'indicaciones_generales'
            )
        }),
        ('Fechas', {
            'fields': (
                'fecha_creacion', 'fecha_validacion',
                'fecha_dispensacion', 'fecha_vencimiento'
            )
        }),
        ('Responsables', {
            'fields': (
                'prescrito_por', 'validado_por', 'dispensado_por'
            )
        }),
        ('Observaciones', {
            'fields': ('observaciones',),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('fecha_actualizacion',),
            'classes': ('collapse',)
        }),
    )

@admin.register(DetalleReceta)
class DetalleRecetaAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo DetalleReceta"""
    
    list_display = [
        'receta', 'clave_medicamento', 'descripcion_medicamento',
        'cantidad_prescrita', 'cantidad_surtida', 'lote'
    ]
    
    list_filter = [
        'receta__tipo_receta', 'fecha_caducidad', 'fecha_creacion'
    ]
    
    search_fields = [
        'clave_medicamento', 'descripcion_medicamento',
        'lote', 'receta__folio_receta'
    ]
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    ordering = ['-fecha_creacion']
    
    fieldsets = (
        ('Información del Medicamento', {
            'fields': (
                'receta', 'medicamento_catalogo', 'clave_medicamento', 'descripcion_medicamento'
            )
        }),
        ('Dosis y Administración', {
            'fields': (
                'dosis',
            )
        }),
        ('Cantidad', {
            'fields': (
                'cantidad_prescrita', 'cantidad_surtida'
            )
        }),
        ('Información de Dispensación', {
            'fields': (
                'lote', 'fecha_caducidad', 'observaciones_dispensacion'
            )
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

@admin.register(CatalogoMedicamentos)
class CatalogoMedicamentosAdmin(admin.ModelAdmin):
    """Configuración del admin para el catálogo de medicamentos"""
    
    list_display = [
        'clave', 'nombre', 'principio_activo', 'concentracion',
        'forma_farmaceutica', 'categoria', 'activo'
    ]
    
    list_filter = [
        'categoria', 'tipo_receta_permitido', 'forma_farmaceutica',
        'requiere_refrigeracion', 'es_controlado', 'activo'
    ]
    
    search_fields = [
        'clave', 'nombre', 'principio_activo', 'concentracion'
    ]
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    ordering = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'clave', 'nombre', 'principio_activo', 'concentracion',
                'forma_farmaceutica', 'categoria'
            )
        }),
        ('Configuración de Recetas', {
            'fields': (
                'tipo_receta_permitido', 'via_administracion', 'dosis_sugerida'
            )
        }),
        ('Información Médica', {
            'fields': (
                'contraindicaciones',
            )
        }),
        ('Control y Almacenamiento', {
            'fields': (
                'requiere_refrigeracion', 'es_controlado', 'activo'
            )
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

@admin.register(LoteDetalleReceta)
class LoteDetalleRecetaAdmin(admin.ModelAdmin):
    """Configuración del admin para lotes de medicamentos"""
    
    list_display = [
        'detalle_receta', 'lote', 'cantidad_dispensada',
        'fecha_caducidad', 'dispensado_por', 'fecha_dispensacion'
    ]
    
    list_filter = [
        'fecha_caducidad', 'fecha_dispensacion', 'dispensado_por'
    ]
    
    search_fields = [
        'lote', 'detalle_receta__clave_medicamento',
        'detalle_receta__receta__folio_receta'
    ]
    
    readonly_fields = ['fecha_dispensacion']
    
    ordering = ['-fecha_dispensacion']
