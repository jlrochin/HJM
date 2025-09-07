from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from datetime import timedelta, datetime
from apps.patients.models import Paciente
from apps.prescriptions.models import Receta, DetalleReceta
from apps.authentication.models import User
from apps.reports.services import DashboardService, AuditService
from .serializers import (
    MobileUserSerializer, MobilePatientSerializer,
    MobileRecipeListSerializer, MobileRecipeDetailSerializer,
    MobileStatsSerializer, QuickActionSerializer,
    MobileNotificationSerializer, MobileSearchResultSerializer,
    MobileOfflineSyncSerializer
)


class MobileUserProfileView(generics.RetrieveUpdateAPIView):
    """Perfil de usuario optimizado para móvil"""
    serializer_class = MobileUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_dashboard(request):
    """Dashboard principal para aplicación móvil"""
    
    user = request.user
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    # Estadísticas personales del usuario
    personal_stats = {
        'mis_recetas_hoy': 0,
        'mis_recetas_semana': 0,
        'mis_dispensaciones_hoy': 0,
        'mi_productividad': 0.0
    }
    
    # Estadísticas según el rol del usuario
    if user.role in ['MEDICO', 'ATENCION_USUARIO']:
        personal_stats['mis_recetas_hoy'] = Receta.objects.filter(
            prescrito_por=user,
            fecha_creacion__date=today
        ).count()
        
        personal_stats['mis_recetas_semana'] = Receta.objects.filter(
            prescrito_por=user,
            fecha_creacion__date__gte=week_start
        ).count()
    
    elif user.role in ['FARMACIA', 'CMI']:
        personal_stats['mis_dispensaciones_hoy'] = DetalleReceta.objects.filter(
            receta__dispensado_por=user,
            receta__fecha_dispensacion__date=today
        ).count()
    
    # Estadísticas generales del sistema
    general_stats = DashboardService.get_general_stats()
    
    # Combinar estadísticas
    dashboard_data = {
        **personal_stats,
        'recetas_pendientes': general_stats['recetas_pendientes'],
        'recetas_urgentes': DashboardService.get_urgent_recipes(),
        'alertas_inventario': 0,  # Se implementará con el módulo de inventario
        'usuarios_activos': User.objects.filter(
            last_login__gte=timezone.now() - timedelta(hours=24)
        ).count(),
        'tiempo_promedio_validacion': 2.5,  # Placeholder
        'tiempo_promedio_dispensacion': DashboardService.get_dispensing_performance().get('tiempo_promedio_dispensacion', 0),
        'medicamentos_top_hoy': DashboardService.get_most_dispensed_medications()[:5]
    }
    
    serializer = MobileStatsSerializer(dashboard_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_app_config(request):
    """Configuración de la aplicación móvil"""
    
    user = request.user
    
    config = {
        'version': '1.0.0',
        'features': {
            'offline_sync': True,
            'barcode_scanner': True,
            'push_notifications': True,
            'biometric_auth': True,
            'dark_mode': True
        },
        'permissions': {
            'can_validate': user.can_validate_prescriptions(),
            'can_dispense_pharmacy': user.can_dispense_pharmacy(),
            'can_dispense_cmi': user.can_dispense_cmi(),
            'can_create_patients': user.can_create_patients(),
            'can_create_recipes': user.can_create_prescriptions()
        },
        'sync_settings': {
            'auto_sync': True,
            'sync_frequency': 300,
            'wifi_only': False,
            'compress_data': True
        },
        'ui_settings': {
            'theme': 'light',
            'language': 'es',
            'date_format': 'dd/MM/yyyy',
            'time_format': '24h'
        },
        'server_info': {
            'api_version': '1.0',
            'server_time': timezone.now(),
            'maintenance_mode': False
        }
    }
    
    return Response(config)
