from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from .models import ReportTemplate, GeneratedReport, SystemMetrics, AuditLog
from .serializers import (
    ReportTemplateSerializer, GeneratedReportSerializer,
    SystemMetricsSerializer, AuditLogSerializer,
    DashboardStatsSerializer, PerformanceReportSerializer,
    InventoryReportSerializer, CustomReportRequestSerializer
)
from .services import DashboardService, ReportService, AuditService, MetricsService


class ReportTemplateListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear plantillas de reportes"""
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReportTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para ver, actualizar y eliminar plantillas específicas"""
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated]


class GeneratedReportListView(generics.ListAPIView):
    """Vista para listar reportes generados"""
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = GeneratedReport.objects.all()
        
        # Filtrar por usuario si no es admin
        if user.role != 'ADMIN':
            queryset = queryset.filter(generated_by=user)
        
        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Endpoint para obtener estadísticas del dashboard"""
    
    try:
        # Obtener estadísticas básicas de forma segura
        from apps.prescriptions.models import Receta
        from apps.patients.models import Paciente
        from django.utils import timezone
        
        today = timezone.now().date()
        
        # Estadísticas básicas que sabemos que funcionan
        dashboard_data = {
            'total_pacientes': Paciente.objects.count(),
            'total_recetas': Receta.objects.count(),
            'recetas_pendientes': Receta.objects.filter(estado='PENDIENTE').count(),
            'recetas_validadas': Receta.objects.filter(estado='VALIDADA').count(),
            'recetas_completadas': Receta.objects.filter(estado='SURTIDA').count(),
            'recetas_completadas_hoy': Receta.objects.filter(
                estado='SURTIDA',
                fecha_dispensacion__date=today
            ).count(),
            'recetas_por_estado': {
                'PENDIENTE': Receta.objects.filter(estado='PENDIENTE').count(),
                'VALIDADA': Receta.objects.filter(estado='VALIDADA').count(),
                'PARCIALMENTE_SURTIDA': Receta.objects.filter(estado='PARCIALMENTE_SURTIDA').count(),
                'SURTIDA': Receta.objects.filter(estado='SURTIDA').count(),
                'CANCELADA': Receta.objects.filter(estado='CANCELADA').count(),
            },
            'recetas_por_tipo': {
                'FARMACIA': Receta.objects.filter(tipo_receta='FARMACIA').count(),
                'CMI': Receta.objects.filter(tipo_receta='CMI').count(),
            },
            'servicios_mas_activos': [],
            'tiempo_promedio_dispensacion': 0,
            'medicamentos_mas_dispensados': [],
            'medicamentos_bajo_stock': [],
            'recetas_urgentes': Receta.objects.filter(
                estado__in=['PENDIENTE', 'VALIDADA'],
                prioridad='URGENTE'
            ).count(),
            'sistema_activo': True,
            'ultima_actualizacion': timezone.now()
        }
        
        return Response(dashboard_data)
        
    except Exception as e:
        # Fallback con datos mínimos si todo falla
        fallback_data = {
            'total_pacientes': 0,
            'total_recetas': 0,
            'recetas_pendientes': 0,
            'recetas_validadas': 0,
            'recetas_completadas': 0,
            'recetas_completadas_hoy': 0,
            'sistema_activo': False,
            'error': f'Error del sistema: {str(e)}',
            'ultima_actualizacion': timezone.now()
        }
        
        return Response(fallback_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_performance_report(request):
    """Endpoint para generar reporte de rendimiento"""
    
    try:
        # Obtener parámetros de fecha (últimos 30 días por defecto)
        date_to = timezone.now()
        date_from = date_to - timedelta(days=30)
        
        if 'date_from' in request.data:
            date_from = datetime.fromisoformat(request.data['date_from'].replace('Z', '+00:00'))
        
        if 'date_to' in request.data:
            date_to = datetime.fromisoformat(request.data['date_to'].replace('Z', '+00:00'))
        
        # Generar reporte
        report_data = ReportService.generate_performance_report(date_from, date_to)
        
        # Registrar en auditoría
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='PerformanceReport',
            object_repr=f"Reporte de Rendimiento {date_from.date()} - {date_to.date()}",
            request=request
        )
        
        serializer = PerformanceReportSerializer(report_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': f'Error al generar reporte de rendimiento: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_report(request):
    """Endpoint para generar reporte de inventario"""
    
    try:
        report_data = ReportService.generate_inventory_report()
        
        # Registrar en auditoría
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='InventoryReport',
            object_repr="Reporte de Inventario",
            request=request
        )
        
        serializer = InventoryReportSerializer(report_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': f'Error al generar reporte de inventario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def real_time_metrics(request):
    """Endpoint para métricas en tiempo real"""
    
    try:
        metrics_data = MetricsService.get_real_time_dashboard()
        
        return Response({
            'timestamp': timezone.now(),
            'metrics': metrics_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener métricas en tiempo real: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs(request):
    """Endpoint para obtener logs de auditoría"""
    
    # Obtener el usuario real para acceder al role
    try:
        if hasattr(request.user, 'role'):
            user_role = request.user.role
        else:
            # Para TokenUser de JWT, obtener el usuario real
            from apps.authentication.models import User
            user = User.objects.get(id=request.user.id)
            user_role = user.role
    except:
        return Response(
            {'error': 'No tiene permisos para ver logs de auditoría'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not user_role in ['ADMIN', 'ATENCION_USUARIO']:
        return Response(
            {'error': 'No tiene permisos para ver logs de auditoría'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Parámetros de filtrado
        days = int(request.GET.get('days', 7))
        user_id = request.GET.get('user_id')
        action = request.GET.get('action')
        
        since_date = timezone.now() - timedelta(days=days)
        queryset = AuditLog.objects.filter(timestamp__gte=since_date)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if action:
            queryset = queryset.filter(action=action)
        
        # Limitar resultados para rendimiento
        queryset = queryset.order_by('-timestamp')[:1000]
        
        serializer = AuditLogSerializer(queryset, many=True)
        return Response({
            'logs': serializer.data,
            'total': queryset.count()
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener logs de auditoría: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_custom_report(request):
    """Endpoint para generar reportes personalizados"""
    
    try:
        serializer = CustomReportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Aquí se implementaría la lógica específica para cada tipo de reporte
        # Por ahora, devolvemos una estructura básica
        
        report_result = {
            'report_type': data['report_type'],
            'period': {
                'from': data['date_from'],
                'to': data['date_to']
            },
            'filters': data['filters'],
            'data': [],  # Los datos específicos se generarían aquí
            'generated_at': timezone.now(),
            'generated_by': request.user.get_full_name()
        }
        
        # Registrar en auditoría
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='CustomReport',
            object_repr=f"Reporte Personalizado - {data['report_type']}",
            changes={'filters': data['filters']},
            request=request
        )
        
        return Response(report_result)
        
    except Exception as e:
        return Response(
            {'error': f'Error al generar reporte personalizado: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """Endpoint para verificar la salud del sistema"""
    
    # Obtener el usuario real para acceder al role
    try:
        if hasattr(request.user, 'role'):
            user_role = request.user.role
        else:
            # Para TokenUser de JWT, obtener el usuario real
            from apps.authentication.models import User
            user = User.objects.get(id=request.user.id)
            user_role = user.role
    except:
        return Response(
            {'error': 'Solo administradores pueden ver la salud del sistema'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if user_role != 'ADMIN':
        return Response(
            {'error': 'Solo administradores pueden ver la salud del sistema'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Métricas básicas de salud
        health_data = {
            'timestamp': timezone.now(),
            'database_connection': True,  # Si llegamos aquí, la conexión funciona
            'active_users_last_hour': DashboardService.get_general_stats(),
            'system_load': {
                'cpu_usage': 'N/A',  # Requeriría librería adicional
                'memory_usage': 'N/A',
                'disk_usage': 'N/A'
            },
            'recent_errors': [],  # Se podría implementar un sistema de logs de errores
            'uptime': 'N/A'  # Requeriría tracking adicional
        }
        
        return Response(health_data)
        
    except Exception as e:
        return Response(
            {'error': f'Error al verificar salud del sistema: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
