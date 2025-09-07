from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport, SystemMetrics, AuditLog
from apps.prescriptions.models import Receta, DetalleReceta
from apps.patients.models import Paciente
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta, datetime

User = get_user_model()


class ReportTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class GeneratedReportSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = GeneratedReport
        fields = '__all__'
        read_only_fields = ['generated_by', 'generated_at', 'completed_at']


class SystemMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemMetrics
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    
    # Estadísticas generales
    total_pacientes = serializers.IntegerField()
    total_recetas = serializers.IntegerField()
    recetas_pendientes = serializers.IntegerField()
    recetas_completadas_hoy = serializers.IntegerField()
    
    # Estadísticas por estado
    recetas_por_estado = serializers.DictField()
    
    # Estadísticas por tipo
    recetas_por_tipo = serializers.DictField()
    
    # Estadísticas por servicio
    servicios_mas_activos = serializers.ListField()
    
    # Métricas de rendimiento
    tiempo_promedio_dispensacion = serializers.DecimalField(max_digits=10, decimal_places=2)
    medicamentos_mas_dispensados = serializers.ListField()
    
    # Alertas y notificaciones
    medicamentos_bajo_stock = serializers.ListField()
    recetas_urgentes = serializers.IntegerField()


class PerformanceReportSerializer(serializers.Serializer):
    """Serializer para reportes de rendimiento"""
    
    periodo = serializers.CharField()
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()
    
    # Métricas de productividad
    recetas_procesadas = serializers.IntegerField()
    recetas_por_dia = serializers.DecimalField(max_digits=10, decimal_places=2)
    tiempo_promedio_validacion = serializers.DecimalField(max_digits=10, decimal_places=2)
    tiempo_promedio_dispensacion = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Métricas por usuario
    usuarios_mas_productivos = serializers.ListField()
    
    # Métricas por servicio
    servicios_rendimiento = serializers.ListField()
    
    # Tendencias
    tendencia_semanal = serializers.ListField()
    comparacion_periodo_anterior = serializers.DictField()


class InventoryReportSerializer(serializers.Serializer):
    """Serializer para reportes de inventario"""
    
    fecha_reporte = serializers.DateTimeField()
    
    # Medicamentos más utilizados
    medicamentos_top = serializers.ListField()
    
    # Análisis de consumo
    consumo_por_categoria = serializers.DictField()
    proyeccion_stock = serializers.ListField()
    
    # Alertas de inventario
    medicamentos_agotados = serializers.ListField()
    medicamentos_bajo_stock = serializers.ListField()
    medicamentos_vencimiento_proximo = serializers.ListField()
    
    # Métricas de costo
    costo_total_medicamentos = serializers.DecimalField(max_digits=15, decimal_places=2)
    ahorro_genericos = serializers.DecimalField(max_digits=15, decimal_places=2)


class CustomReportRequestSerializer(serializers.Serializer):
    """Serializer para solicitudes de reportes personalizados"""
    
    REPORT_TYPES = [
        ('prescriptions', 'Reportes de Recetas'),
        ('patients', 'Reportes de Pacientes'),
        ('inventory', 'Reportes de Inventario'),
        ('performance', 'Reportes de Rendimiento'),
        ('audit', 'Reportes de Auditoría'),
    ]
    
    report_type = serializers.ChoiceField(choices=REPORT_TYPES)
    date_from = serializers.DateTimeField()
    date_to = serializers.DateTimeField()
    filters = serializers.DictField(default=dict)
    grouping = serializers.ListField(child=serializers.CharField(), default=list)
    metrics = serializers.ListField(child=serializers.CharField(), default=list)
    format = serializers.ChoiceField(choices=[('json', 'JSON'), ('excel', 'Excel'), ('pdf', 'PDF')], default='json')
    
    def validate(self):
        data = super().validate()
        if data['date_from'] >= data['date_to']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin")
        return data
