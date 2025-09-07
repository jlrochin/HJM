from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from apps.prescriptions.models import Receta, DetalleReceta, LoteDetalleReceta
from apps.patients.models import Paciente
from apps.authentication.models import User
from .models import SystemMetrics, AuditLog
import json


class DashboardService:
    """Servicio para generar datos del dashboard"""
    
    @staticmethod
    def get_general_stats():
        """Obtener estadísticas generales del sistema"""
        today = timezone.now().date()
        
        stats = {
            'total_pacientes': Paciente.objects.count(),
            'total_recetas': Receta.objects.count(),
            'recetas_pendientes': Receta.objects.filter(estado='PENDIENTE').count(),
            'recetas_completadas_hoy': Receta.objects.filter(
                estado='SURTIDA',
                fecha_dispensacion__date=today
            ).count(),
        }
        
        return stats
    
    @staticmethod
    def get_recipes_by_status():
        """Obtener recetas agrupadas por estado"""
        return dict(
            Receta.objects.values('estado')
            .annotate(count=Count('folio_receta'))
            .values_list('estado', 'count')
        )
    
    @staticmethod
    def get_recipes_by_type():
        """Obtener recetas agrupadas por tipo"""
        return dict(
            Receta.objects.values('tipo_receta')
            .annotate(count=Count('folio_receta'))
            .values_list('tipo_receta', 'count')
        )
    
    @staticmethod
    def get_active_services():
        """Obtener servicios más activos"""
        last_30_days = timezone.now() - timedelta(days=30)
        
        return list(
            Receta.objects.filter(fecha_creacion__gte=last_30_days)
            .values('servicio_solicitante')
            .annotate(count=Count('folio_receta'))
            .order_by('-count')[:10]
        )
    
    @staticmethod
    def get_dispensing_performance():
        """Obtener métricas de rendimiento de dispensación"""
        completed_recipes = Receta.objects.filter(
            estado='SURTIDA',
            fecha_validacion__isnull=False,
            fecha_dispensacion__isnull=False
        )
        
        if not completed_recipes.exists():
            return {'tiempo_promedio_dispensacion': 0}
        
        # Calcular tiempo promedio entre validación y dispensación
        total_time = 0
        count = 0
        
        for recipe in completed_recipes:
            if recipe.fecha_validacion and recipe.fecha_dispensacion:
                time_diff = recipe.fecha_dispensacion - recipe.fecha_validacion
                total_time += time_diff.total_seconds() / 3600  # Convertir a horas
                count += 1
        
        avg_time = round(total_time / count, 2) if count > 0 else 0
        
        return {'tiempo_promedio_dispensacion': avg_time}
    
    @staticmethod
    def get_most_dispensed_medications():
        """Obtener medicamentos más dispensados"""
        last_30_days = timezone.now() - timedelta(days=30)
        
        # Medicamentos dispensados tradicionalmente
        traditional = list(
            DetalleReceta.objects.filter(
                receta__fecha_dispensacion__gte=last_30_days,
                cantidad_surtida__gt=0
            )
            .values('descripcion_medicamento')
            .annotate(total_dispensado=Sum('cantidad_surtida'))
            .order_by('-total_dispensado')[:10]
        )
        
        # Medicamentos dispensados por lotes
        lotes = list(
            LoteDetalleReceta.objects.filter(
                fecha_dispensacion__gte=last_30_days
            )
            .values('detalle_receta__descripcion_medicamento')
            .annotate(total_dispensado=Sum('cantidad_dispensada'))
            .order_by('-total_dispensado')[:10]
        )
        
        # Combinar y procesar resultados
        medication_totals = {}
        
        for item in traditional:
            med_name = item['descripcion_medicamento']
            medication_totals[med_name] = medication_totals.get(med_name, 0) + item['total_dispensado']
        
        for item in lotes:
            med_name = item['detalle_receta__descripcion_medicamento']
            medication_totals[med_name] = medication_totals.get(med_name, 0) + item['total_dispensado']
        
        # Convertir a lista ordenada
        result = [
            {'medicamento': med, 'cantidad': int(total)}
            for med, total in sorted(medication_totals.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        return result
    
    @staticmethod
    def get_urgent_recipes():
        """Obtener count de recetas urgentes pendientes"""
        return Receta.objects.filter(
            estado__in=['PENDIENTE', 'VALIDADA'],
            prioridad='URGENTE'
        ).count()


class ReportService:
    """Servicio para generar reportes avanzados"""
    
    @staticmethod
    def generate_performance_report(date_from, date_to):
        """Generar reporte de rendimiento"""
        
        # Recetas en el período
        recipes_period = Receta.objects.filter(
            fecha_creacion__range=[date_from, date_to]
        )
        
        total_recipes = recipes_period.count()
        days_in_period = (date_to - date_from).days + 1
        recipes_per_day = round(total_recipes / days_in_period, 2) if days_in_period > 0 else 0
        
        # Tiempo promedio de validación
        validated_recipes = recipes_period.filter(
            fecha_validacion__isnull=False
        )
        
        validation_times = []
        for recipe in validated_recipes:
            if recipe.fecha_creacion and recipe.fecha_validacion:
                time_diff = recipe.fecha_validacion - recipe.fecha_creacion
                validation_times.append(time_diff.total_seconds() / 3600)
        
        avg_validation_time = round(sum(validation_times) / len(validation_times), 2) if validation_times else 0
        
        # Tiempo promedio de dispensación
        dispensed_recipes = recipes_period.filter(
            fecha_dispensacion__isnull=False,
            fecha_validacion__isnull=False
        )
        
        dispensing_times = []
        for recipe in dispensed_recipes:
            if recipe.fecha_validacion and recipe.fecha_dispensacion:
                time_diff = recipe.fecha_dispensacion - recipe.fecha_validacion
                dispensing_times.append(time_diff.total_seconds() / 3600)
        
        avg_dispensing_time = round(sum(dispensing_times) / len(dispensing_times), 2) if dispensing_times else 0
        
        # Usuarios más productivos
        user_productivity = list(
            recipes_period.filter(prescrito_por__isnull=False)
            .values('prescrito_por__first_name', 'prescrito_por__last_name')
            .annotate(recetas_prescritas=Count('folio_receta'))
            .order_by('-recetas_prescritas')[:10]
        )
        
        # Servicios con mejor rendimiento
        service_performance = list(
            recipes_period.values('servicio_solicitante')
            .annotate(
                total_recetas=Count('folio_receta'),
                recetas_completadas=Count('folio_receta', filter=Q(estado='SURTIDA'))
            )
            .order_by('-total_recetas')[:10]
        )
        
        return {
            'periodo': f"{date_from.strftime('%Y-%m-%d')} - {date_to.strftime('%Y-%m-%d')}",
            'fecha_inicio': date_from,
            'fecha_fin': date_to,
            'recetas_procesadas': total_recipes,
            'recetas_por_dia': recipes_per_day,
            'tiempo_promedio_validacion': avg_validation_time,
            'tiempo_promedio_dispensacion': avg_dispensing_time,
            'usuarios_mas_productivos': user_productivity,
            'servicios_rendimiento': service_performance,
            'tendencia_semanal': ReportService._get_weekly_trend(date_from, date_to),
            'comparacion_periodo_anterior': {}
        }
    
    @staticmethod
    def _get_weekly_trend(date_from, date_to):
        """Obtener tendencia semanal de recetas"""
        trend = []
        current_date = date_from
        
        while current_date <= date_to:
            week_end = min(current_date + timedelta(days=6), date_to)
            week_recipes = Receta.objects.filter(
                fecha_creacion__range=[current_date, week_end]
            ).count()
            
            trend.append({
                'semana': f"{current_date.strftime('%Y-%m-%d')} - {week_end.strftime('%Y-%m-%d')}",
                'recetas': week_recipes
            })
            
            current_date = week_end + timedelta(days=1)
        
        return trend
    
    @staticmethod
    def generate_inventory_report():
        """Generar reporte de inventario"""
        last_30_days = timezone.now() - timedelta(days=30)
        
        # Medicamentos más utilizados
        most_used = DashboardService.get_most_dispensed_medications()
        
        # Análisis de consumo por categoría (basado en forma farmacéutica)
        consumption_by_category = dict(
            DetalleReceta.objects.filter(
                receta__fecha_dispensacion__gte=last_30_days,
                cantidad_surtida__gt=0
            )
            .values('forma_farmaceutica')
            .annotate(total=Sum('cantidad_surtida'))
            .values_list('forma_farmaceutica', 'total')
        )
        
        # Simulación de alertas de inventario (datos de ejemplo)
        low_stock_alerts = [
            {'medicamento': 'Paracetamol 500mg', 'stock_actual': 15, 'stock_minimo': 50},
            {'medicamento': 'Ibuprofeno 400mg', 'stock_actual': 8, 'stock_minimo': 30},
        ]
        
        return {
            'fecha_reporte': timezone.now(),
            'medicamentos_top': most_used,
            'consumo_por_categoria': consumption_by_category,
            'proyeccion_stock': [],
            'medicamentos_agotados': [],
            'medicamentos_bajo_stock': low_stock_alerts,
            'medicamentos_vencimiento_proximo': [],
            'costo_total_medicamentos': Decimal('0.00'),
            'ahorro_genericos': Decimal('0.00')
        }


class AuditService:
    """Servicio para auditoría del sistema"""
    
    @staticmethod
    def log_action(user, action, model_name, object_id=None, object_repr='', changes=None, request=None):
        """Registrar una acción en el log de auditoría"""
        
        ip_address = '127.0.0.1'
        user_agent = 'Unknown'
        session_key = None
        
        if request:
            # Obtener IP real del usuario
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
            
            user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
            session_key = request.session.session_key
        
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id) if object_id else None,
            object_repr=object_repr,
            changes=changes or {},
            ip_address=ip_address,
            user_agent=user_agent,
            session_key=session_key
        )
    
    @staticmethod
    def get_user_activity(user, days=30):
        """Obtener actividad de un usuario en los últimos días"""
        since_date = timezone.now() - timedelta(days=days)
        
        return AuditLog.objects.filter(
            user=user,
            timestamp__gte=since_date
        ).order_by('-timestamp')
    
    @staticmethod
    def get_system_activity_summary(days=7):
        """Obtener resumen de actividad del sistema"""
        since_date = timezone.now() - timedelta(days=days)
        
        summary = AuditLog.objects.filter(
            timestamp__gte=since_date
        ).values('action').annotate(count=Count('id')).order_by('-count')
        
        return list(summary)


class MetricsService:
    """Servicio para métricas del sistema"""
    
    @staticmethod
    def record_metric(name, value, unit='count', category='general', metadata=None):
        """Registrar una métrica del sistema"""
        SystemMetrics.objects.create(
            metric_name=name,
            metric_value=value,
            metric_unit=unit,
            category=category,
            metadata=metadata or {}
        )
    
    @staticmethod
    def get_metrics(name, hours=24):
        """Obtener métricas de las últimas horas"""
        since_time = timezone.now() - timedelta(hours=hours)
        
        return SystemMetrics.objects.filter(
            metric_name=name,
            timestamp__gte=since_time
        ).order_by('timestamp')
    
    @staticmethod
    def get_real_time_dashboard():
        """Obtener datos para dashboard en tiempo real"""
        current_hour = timezone.now().replace(minute=0, second=0, microsecond=0)
        
        # Métricas de la última hora
        metrics = {
            'recetas_creadas_ultima_hora': Receta.objects.filter(
                fecha_creacion__gte=current_hour
            ).count(),
            'recetas_dispensadas_ultima_hora': Receta.objects.filter(
                fecha_dispensacion__gte=current_hour
            ).count(),
            'usuarios_activos': User.objects.filter(
                last_login__gte=timezone.now() - timedelta(hours=1)
            ).count(),
        }
        
        return metrics
