from django.contrib import admin
from .models import ReportTemplate, GeneratedReport, SystemMetrics, AuditLog


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'is_active', 'created_by', 'created_at']
    list_filter = ['report_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'report_type', 'is_active')
        }),
        ('Configuración', {
            'fields': ('query_template', 'visualization_config'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'template', 'status', 'generated_by', 'generated_at']
    list_filter = ['status', 'template__report_type', 'generated_at']
    search_fields = ['title', 'template__name']
    readonly_fields = ['generated_at', 'completed_at']
    
    fieldsets = (
        ('Información del Reporte', {
            'fields': ('template', 'title', 'status')
        }),
        ('Parámetros', {
            'fields': ('parameters', 'date_from', 'date_to'),
            'classes': ('collapse',)
        }),
        ('Resultados', {
            'fields': ('data', 'file_path'),
            'classes': ('collapse',)
        }),
        ('Auditoría', {
            'fields': ('generated_by', 'generated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SystemMetrics)
class SystemMetricsAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_value', 'metric_unit', 'category', 'timestamp']
    list_filter = ['category', 'metric_unit', 'timestamp']
    search_fields = ['metric_name', 'category']
    readonly_fields = ['timestamp']
    
    def has_add_permission(self, request):
        return False  # Las métricas se generan automáticamente
    
    def has_change_permission(self, request, obj=None):
        return False  # Las métricas no se deben modificar


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_repr', 'ip_address', 'timestamp']
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'object_repr']
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'object_repr', 
                       'changes', 'ip_address', 'user_agent', 'timestamp', 'session_key']
    
    def has_add_permission(self, request):
        return False  # Los logs se generan automáticamente
    
    def has_change_permission(self, request, obj=None):
        return False  # Los logs no se deben modificar
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Solo superusuarios pueden eliminar logs
