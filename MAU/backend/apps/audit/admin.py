from django.contrib import admin
from django.utils.html import format_html
from .models import SystemMovement, MovementTemplate

@admin.register(SystemMovement)
class SystemMovementAdmin(admin.ModelAdmin):
    list_display = [
        'timestamp_short', 'user_simple', 'action_simple', 'module_simple', 
        'description_short', 'status_simple'
    ]
    
    list_filter = [
        'action_type', 'module', 'is_successful', 'timestamp'
    ]
    
    search_fields = [
        'description', 'user__username', 'module', 'action_type'
    ]
    
    readonly_fields = [
        'timestamp', 'execution_time', 'session_id', 'ip_address',
        'user_agent', 'tags_display'
    ]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('action_type', 'description', 'user', 'timestamp')
        }),
        ('Módulo y Entidad', {
            'fields': ('module', 'entity_type', 'entity_id')
        }),
        ('Información Técnica', {
            'fields': ('ip_address', 'execution_time', 'is_successful')
        }),
        ('Metadatos', {
            'fields': ('tags_display',),
            'classes': ('collapse',)
        })
    )
    
    def timestamp_short(self, obj):
        """Timestamp en formato corto"""
        return obj.timestamp.strftime('%d/%m %H:%M')
    timestamp_short.short_description = 'Fecha/Hora'
    
    def user_simple(self, obj):
        """Usuario de forma simple"""
        if obj.user:
            if hasattr(obj.user, 'username'):
                return obj.user.username
            elif hasattr(obj.user, 'first_name'):
                return obj.user.first_name
            else:
                return f"Usuario {obj.user.id}"
        return "Sistema"
    user_simple.short_description = 'Usuario'
    
    def action_simple(self, obj):
        """Acción de forma simple"""
        action_map = {
            'LOGIN': 'Iniciar Sesión',
            'LOGOUT': 'Cerrar Sesión',
            'CREAR': 'Crear',
            'ACTUALIZAR': 'Actualizar',
            'ELIMINAR': 'Eliminar',
            'ACCESO': 'Acceso',
            'ERROR': 'Error'
        }
        return action_map.get(obj.action_type, obj.action_type)
    action_simple.short_description = 'Acción'
    
    def module_simple(self, obj):
        """Módulo de forma simple"""
        return obj.module
    module_simple.short_description = 'Módulo'
    
    def description_short(self, obj):
        """Descripción truncada y simple"""
        desc = obj.description
        if len(desc) > 40:
            return desc[:40] + '...'
        return desc
    description_short.short_description = 'Descripción'
    
    def status_simple(self, obj):
        """Estado de forma simple con colores"""
        if obj.is_successful:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Éxito</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Error</span>'
            )
    status_simple.short_description = 'Estado'
    
    def tags_display(self, obj):
        """Mostrar tags de forma legible"""
        if obj.tags:
            try:
                tags = obj.tags if isinstance(obj.tags, dict) else {}
                html = '<div style="font-family: monospace; font-size: 12px;">'
                for key, value in tags.items():
                    html += f'<strong>{key}:</strong> {value}<br>'
                html += '</div>'
                return format_html(html)
            except:
                return str(obj.tags)
        return "Sin metadatos"
    tags_display.short_description = 'Metadatos'
    
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('user').order_by('-timestamp')
    
    def has_add_permission(self, request):
        """Los movimientos se crean automáticamente"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Los movimientos no se pueden editar"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Solo superusuarios pueden eliminar"""
        return request.user.is_superuser
    
    # Acciones simples
    actions = ['mark_as_high_priority', 'export_selected']
    
    def mark_as_high_priority(self, request, queryset):
        """Marcar como alta prioridad"""
        updated = queryset.update(priority='HIGH')
        self.message_user(request, f'{updated} movimientos marcados como alta prioridad.')
    mark_as_high_priority.short_description = "Marcar como alta prioridad"
    
    def export_selected(self, request, queryset):
        """Exportar seleccionados"""
        self.message_user(request, f'Exportación de {queryset.count()} movimientos iniciada.')
    export_selected.short_description = "Exportar seleccionados"


@admin.register(MovementTemplate)
class MovementTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'action_type', 'entity_type', 'module', 'is_active']
    list_filter = ['action_type', 'entity_type', 'module', 'is_active']
    search_fields = ['name', 'description', 'module']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'action_type')
        }),
        ('Configuración', {
            'fields': ('entity_type', 'module', 'is_active')
        })
    )
    
    readonly_fields = ['created_at']
    
    def has_delete_permission(self, request, obj=None):
        """Solo superusuarios pueden eliminar plantillas"""
        return request.user.is_superuser
