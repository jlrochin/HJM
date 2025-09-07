from django.contrib import admin
from .models import Paciente, CIE10Mexico

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo Paciente"""
    
    list_display = [
        'expediente', 'get_nombre_completo', 'curp', 'genero',
        'get_edad', 'patologia', 'is_active', 'created_at'
    ]
    
    list_filter = [
        'genero', 'tipo_sangre', 'institucion_seguro',
        'is_active', 'created_at', 'fecha_diagnostico'
    ]
    
    search_fields = [
        'expediente', 'nombre', 'apellido_paterno', 'apellido_materno',
        'curp', 'telefono', 'patologia'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    ordering = ['apellido_paterno', 'apellido_materno', 'nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'expediente', 'nombre', 'apellido_paterno', 'apellido_materno',
                'curp', 'fecha_nacimiento', 'genero'
            )
        }),
        ('Información Médica', {
            'fields': (
                'patologia', 'cie10', 'fecha_diagnostico',
                'tipo_sangre', 'alergias'
            )
        }),
        ('Información de Contacto', {
            'fields': (
                'telefono', 'direccion', 'contacto_emergencia_nombre',
                'contacto_emergencia_telefono'
            )
        }),
        ('Información del Seguro', {
            'fields': ('numero_seguro_social', 'institucion_seguro')
        }),
        ('Estado y Metadatos', {
            'fields': (
                'is_active', 'created_at', 'updated_at',
                'created_by', 'updated_by'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_nombre_completo(self, obj):
        return obj.get_nombre_completo()
    get_nombre_completo.short_description = 'Nombre Completo'
    
    def get_edad(self, obj):
        return f"{obj.get_edad()} años"
    get_edad.short_description = 'Edad'


@admin.register(CIE10Mexico)
class CIE10MexicoAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo CIE10Mexico"""
    
    list_display = [
        'codigo', 'descripcion_corta', 'clave_capitulo', 'letra',
        'prinmorta', 'es_mortalidad', 'activo'
    ]
    
    list_filter = [
        'clave_capitulo', 'letra', 'es_mortalidad', 'es_morbilidad',
        'activo', 'prinmorta', 'fecha_creacion'
    ]
    
    search_fields = [
        'codigo', 'descripcion', 'descripcion_corta', 'categoria'
    ]
    
    readonly_fields = [
        'fecha_creacion', 'fecha_actualizacion'
    ]
    
    ordering = ['codigo']
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'codigo', 'descripcion', 'descripcion_corta',
                'capitulo', 'categoria', 'tipo', 'letra', 'no_caracteres'
            )
        }),
        ('Información del Capítulo', {
            'fields': (
                'clave_capitulo', 'nombre_capitulo', 'lista1', 'grupo1', 'lista5'
            )
        }),
        ('Aplicabilidad', {
            'fields': (
                'genero_aplicable', 'es_mortalidad', 'es_morbilidad', 'activo'
            )
        }),
        ('Epidemiología', {
            'fields': (
                'prinmorta', 'prinmorb', 'epi_clave', 'epi_clave_desc',
                'es_causes', 'num_causes'
            ),
            'classes': ('collapse',)
        }),
        ('Vigilancia', {
            'fields': (
                'es_suive_morta', 'es_suive_morb', 'es_suive_est_epi',
                'notdiaria', 'notsemanal', 'sistema_especial'
            ),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': (
                'fecha_creacion', 'fecha_actualizacion', 'consecutivo',
                'year_modifi', 'year_aplicacion', 'valid'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Acciones personalizadas
    actions = ['marcar_como_activo', 'marcar_como_inactivo']
    
    def marcar_como_activo(self, request, queryset):
        updated = queryset.update(activo=True)
        self.message_user(request, f'{updated} códigos marcados como activos.')
    marcar_como_activo.short_description = 'Marcar códigos seleccionados como activos'
    
    def marcar_como_inactivo(self, request, queryset):
        updated = queryset.update(activo=False)
        self.message_user(request, f'{updated} códigos marcados como inactivos.')
    marcar_como_inactivo.short_description = 'Marcar códigos seleccionados como inactivos'
