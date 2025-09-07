from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import SystemMovement
from .serializers import SystemMovementSerializer
import logging

logger = logging.getLogger(__name__)


class AuditViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar registros de auditoría del sistema
    """
    queryset = SystemMovement.objects.all()
    serializer_class = SystemMovementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            queryset = SystemMovement.objects.select_related('user').order_by('-timestamp')
            
            # Filtros
            action_type = self.request.query_params.get('action_type', None)
            entity_type = self.request.query_params.get('entity_type', None)
            user = self.request.query_params.get('user', None)
            date_from = self.request.query_params.get('date_from', None)
            date_to = self.request.query_params.get('date_to', None)
            module = self.request.query_params.get('module', None)
            
            if action_type:
                queryset = queryset.filter(action_type=action_type)
            
            if entity_type:
                queryset = queryset.filter(entity_type=entity_type)
            
            if user:
                queryset = queryset.filter(user__username__icontains=user)
            
            if date_from:
                try:
                    date_from = timezone.datetime.strptime(date_from, '%Y-%m-%d')
                    queryset = queryset.filter(timestamp__date__gte=date_from.date())
                except ValueError:
                    logger.warning(f'Fecha inválida en date_from: {date_from}')
                    pass
            
            if date_to:
                try:
                    date_to = timezone.datetime.strptime(date_to, '%Y-%m-%d')
                    queryset = queryset.filter(timestamp__date__lte=date_to.date())
                except ValueError:
                    logger.warning(f'Fecha inválida en date_to: {date_to}')
                    pass
            
            if module:
                queryset = queryset.filter(module__icontains=module)
            
            return queryset
        except Exception as e:
            logger.error(f'Error en get_queryset: {str(e)}')
            return SystemMovement.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error en list: {str(e)}')
            return Response(
                {'error': 'Error interno del servidor al cargar registros de auditoría'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Obtener estadísticas de auditoría
        """
        now = timezone.now()
        today = now.date()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Estadísticas generales
        total_movements = SystemMovement.objects.count()
        today_movements = SystemMovement.objects.filter(timestamp__date=today).count()
        week_movements = SystemMovement.objects.filter(timestamp__date__gte=week_ago).count()
        month_movements = SystemMovement.objects.filter(timestamp__date__gte=month_ago).count()
        
        # Eventos críticos (DELETE, ERROR, etc.)
        critical_events = SystemMovement.objects.filter(
            Q(action_type='DELETE') | 
            Q(is_successful=False) |
            Q(priority__in=['HIGH', 'CRITICAL'])
        ).count()
        
        # Usuarios activos (últimos 7 días)
        active_users = SystemMovement.objects.filter(
            timestamp__date__gte=week_ago
        ).values('user').distinct().count()
        
        # Acciones más frecuentes
        top_actions = SystemMovement.objects.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Usuarios más activos
        top_users = SystemMovement.objects.values(
            'user__username', 'user__first_name', 'user__last_name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Módulos más activos
        top_modules = SystemMovement.objects.values('module').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Estadísticas por tipo de entidad
        entity_stats = SystemMovement.objects.values('entity_type').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Estadísticas por prioridad
        priority_stats = SystemMovement.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Estadísticas por estado de éxito
        success_stats = SystemMovement.objects.values('is_successful').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_movements': total_movements,
            'today_movements': today_movements,
            'week_movements': week_movements,
            'month_movements': month_movements,
            'critical_events': critical_events,
            'active_users': active_users,
            'top_actions': list(top_actions),
            'top_users': list(top_users),
            'top_modules': list(top_modules),
            'entity_stats': list(entity_stats),
            'priority_stats': list(priority_stats),
            'success_stats': list(success_stats),
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Obtener resumen de auditoría para el dashboard
        """
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        
        # Resumen del día
        today_summary = {
            'total': SystemMovement.objects.filter(timestamp__date=today).count(),
            'creations': SystemMovement.objects.filter(
                timestamp__date=today, action_type='CREATE'
            ).count(),
            'updates': SystemMovement.objects.filter(
                timestamp__date=today, action_type='UPDATE'
            ).count(),
            'deletions': SystemMovement.objects.filter(
                timestamp__date=today, action_type='DELETE'
            ).count(),
            'logins': SystemMovement.objects.filter(
                timestamp__date=today, action_type='LOGIN'
            ).count(),
            'errors': SystemMovement.objects.filter(
                timestamp__date=today, is_successful=False
            ).count(),
        }
        
        # Resumen de la semana
        week_summary = {
            'total': SystemMovement.objects.filter(timestamp__date__gte=week_ago).count(),
            'daily_breakdown': []
        }
        
        for i in range(7):
            date = today - timedelta(days=i)
            count = SystemMovement.objects.filter(timestamp__date=date).count()
            week_summary['daily_breakdown'].append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return Response({
            'today': today_summary,
            'week': week_summary,
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Exportar registros de auditoría
        """
        queryset = self.get_queryset()
        
        # Aquí podrías implementar la exportación real
        # Por ahora solo retornamos un mensaje
        return Response({
            'message': f'Exportación iniciada para {queryset.count()} registros',
            'count': queryset.count()
        })
