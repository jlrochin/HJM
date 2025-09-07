from rest_framework import serializers
from apps.patients.models import Paciente
from apps.prescriptions.models import Receta, DetalleReceta, LoteDetalleReceta
from apps.authentication.models import User
from apps.reports.models import AuditLog
from django.utils import timezone


class MobileUserSerializer(serializers.ModelSerializer):
    """Serializer optimizado para usuarios móviles"""
    
    permissions = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'role', 'departamento', 'telefono', 'permissions', 'avatar_url',
            'last_login', 'is_active'
        ]
    
    def get_permissions(self, obj):
        """Obtener permisos específicos para móvil"""
        return {
            'can_create_patients': obj.can_create_patients(),
            'can_edit_patients': obj.can_edit_patients(),
            'can_validate_prescriptions': obj.can_validate_prescriptions(),
            'can_dispense_pharmacy': obj.can_dispense_pharmacy(),
            'can_dispense_cmi': obj.can_dispense_cmi(),
            'can_create_prescriptions': obj.can_create_prescriptions(),
        }
    
    def get_avatar_url(self, obj):
        """URL del avatar (placeholder por ahora)"""
        return f"https://ui-avatars.com/api/?name={obj.first_name}+{obj.last_name}&background=4b5563&color=fff"


class MobilePatientSerializer(serializers.ModelSerializer):
    """Serializer optimizado para pacientes en móvil"""
    
    edad = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    recetas_activas = serializers.SerializerMethodField()
    ultima_receta = serializers.SerializerMethodField()
    
    class Meta:
        model = Paciente
        fields = [
            'expediente', 'nombre_completo', 'curp', 'fecha_nacimiento',
            'edad', 'genero', 'patologia', 'cie10', 'telefono',
            'recetas_activas', 'ultima_receta'
        ]
    
    def get_edad(self, obj):
        if obj.fecha_nacimiento:
            today = timezone.now().date()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None
    
    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido_paterno} {obj.apellido_materno}"
    
    def get_recetas_activas(self, obj):
        return obj.recetas.filter(estado__in=['PENDIENTE', 'VALIDADA', 'PARCIALMENTE_SURTIDA']).count()
    
    def get_ultima_receta(self, obj):
        ultima = obj.recetas.order_by('-fecha_creacion').first()
        if ultima:
            return {
                'folio': ultima.folio_receta,
                'fecha': ultima.fecha_creacion,
                'estado': ultima.estado,
                'tipo': ultima.tipo_receta
            }
        return None


class MobileRecipeListSerializer(serializers.ModelSerializer):
    """Serializer para lista de recetas en móvil"""
    
    paciente_info = serializers.SerializerMethodField()
    progreso = serializers.SerializerMethodField()
    tiempo_transcurrido = serializers.SerializerMethodField()
    prescrito_por_name = serializers.CharField(source='prescrito_por.get_full_name', read_only=True)
    
    class Meta:
        model = Receta
        fields = [
            'folio_receta', 'tipo_receta', 'estado', 'prioridad',
            'servicio_solicitante', 'fecha_creacion', 'diagnostico',
            'paciente_info', 'progreso', 'tiempo_transcurrido',
            'prescrito_por_name'
        ]
    
    def get_paciente_info(self, obj):
        return {
            'expediente': obj.paciente.expediente,
            'nombre_completo': f"{obj.paciente.nombre} {obj.paciente.apellido_paterno}",
            'edad': obj.paciente.get_edad() if hasattr(obj.paciente, 'get_edad') else None,
            'genero': obj.paciente.genero
        }
    
    def get_progreso(self, obj):
        """Calcular progreso de la receta"""
        total_medicamentos = obj.detalles.count()
        if total_medicamentos == 0:
            return 0
        
        completados = 0
        for detalle in obj.detalles.all():
            if detalle.is_completely_dispensed():
                completados += 1
        
        return round((completados / total_medicamentos) * 100, 1)
    
    def get_tiempo_transcurrido(self, obj):
        """Tiempo transcurrido desde creación"""
        now = timezone.now()
        delta = now - obj.fecha_creacion
        
        if delta.days > 0:
            return f"{delta.days} días"
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} horas"
        else:
            minutes = delta.seconds // 60
            return f"{minutes} min"


class MobileRecipeDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para recetas en móvil"""
    
    paciente = MobilePatientSerializer(read_only=True)
    medicamentos = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    puede_dispensar = serializers.SerializerMethodField()
    prescrito_por_name = serializers.CharField(source='prescrito_por.get_full_name', read_only=True)
    validado_por_name = serializers.CharField(source='validado_por.get_full_name', read_only=True)
    dispensado_por_name = serializers.CharField(source='dispensado_por.get_full_name', read_only=True)
    
    class Meta:
        model = Receta
        fields = [
            'folio_receta', 'tipo_receta', 'estado', 'prioridad',
            'servicio_solicitante', 'diagnostico', 'indicaciones_generales',
            'fecha_creacion', 'fecha_validacion', 'fecha_dispensacion',
            'prescrito_por_name', 'validado_por_name', 'dispensado_por_name',
            'paciente', 'medicamentos', 'timeline', 'puede_dispensar'
        ]
    
    def get_medicamentos(self, obj):
        """Obtener medicamentos con información optimizada para móvil"""
        medicamentos = []
        for detalle in obj.detalles.all():
            med_data = {
                'id': detalle.id,
                'descripcion': detalle.descripcion_medicamento,
                'concentracion': detalle.concentracion,
                'forma': detalle.forma_farmaceutica,
                'cantidad_prescrita': detalle.cantidad_prescrita,
                'cantidad_surtida': detalle.cantidad_surtida,
                'unidad': detalle.unidad_medida,
                'dosis': detalle.dosis,
                'frecuencia': detalle.frecuencia,
                'completado': detalle.is_completely_dispensed(),
                'progreso': detalle.get_porcentaje_surtido(),
                'lotes': []
            }
            
            # Agregar información de lotes si existen
            for lote in detalle.lotes.all():
                med_data['lotes'].append({
                    'numero_lote': lote.numero_lote,
                    'cantidad': lote.cantidad_dispensada,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'laboratorio': lote.laboratorio,
                    'fecha_dispensacion': lote.fecha_dispensacion
                })
            
            medicamentos.append(med_data)
        
        return medicamentos
    
    def get_timeline(self, obj):
        """Timeline de eventos de la receta"""
        events = []
        
        # Evento de creación
        events.append({
            'tipo': 'CREADA',
            'fecha': obj.fecha_creacion,
            'usuario': obj.prescrito_por.get_full_name() if obj.prescrito_por else 'Sistema',
            'descripcion': f"Receta creada por {obj.servicio_solicitante}"
        })
        
        # Evento de validación
        if obj.fecha_validacion:
            events.append({
                'tipo': 'VALIDADA',
                'fecha': obj.fecha_validacion,
                'usuario': obj.validado_por.get_full_name() if obj.validado_por else 'Sistema',
                'descripcion': 'Receta validada y lista para dispensar'
            })
        
        # Eventos de dispensación (lotes)
        for detalle in obj.detalles.all():
            for lote in detalle.lotes.all():
                events.append({
                    'tipo': 'LOTE_DISPENSADO',
                    'fecha': lote.fecha_dispensacion,
                    'usuario': lote.dispensado_por.get_full_name() if lote.dispensado_por else 'Sistema',
                    'descripcion': f"Dispensado lote {lote.numero_lote} de {detalle.descripcion_medicamento}"
                })
        
        # Evento de dispensación completa
        if obj.fecha_dispensacion:
            events.append({
                'tipo': 'COMPLETADA',
                'fecha': obj.fecha_dispensacion,
                'usuario': obj.dispensado_por.get_full_name() if obj.dispensado_por else 'Sistema',
                'descripcion': 'Receta completamente dispensada'
            })
        
        return sorted(events, key=lambda x: x['fecha'])
    
    def get_puede_dispensar(self, obj):
        """Verificar si el usuario actual puede dispensar esta receta"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Verificar estado de la receta
        if obj.estado not in ['VALIDADA', 'PARCIALMENTE_SURTIDA']:
            return False
        
        # Verificar permisos según tipo de receta
        if obj.tipo_receta == 'FARMACIA':
            return user.can_dispense_pharmacy()
        elif obj.tipo_receta == 'CMI':
            return user.can_dispense_cmi()
        
        return False


class MobileStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas móviles"""
    
    # Estadísticas personales del usuario
    mis_recetas_hoy = serializers.IntegerField()
    mis_recetas_semana = serializers.IntegerField()
    mis_dispensaciones_hoy = serializers.IntegerField()
    mi_productividad = serializers.DecimalField(max_digits=5, decimal_places=1)
    
    # Estadísticas generales del sistema
    recetas_pendientes = serializers.IntegerField()
    recetas_urgentes = serializers.IntegerField()
    alertas_inventario = serializers.IntegerField()
    usuarios_activos = serializers.IntegerField()
    
    # Métricas de rendimiento
    tiempo_promedio_validacion = serializers.DecimalField(max_digits=5, decimal_places=1)
    tiempo_promedio_dispensacion = serializers.DecimalField(max_digits=5, decimal_places=1)
    
    # Top medicamentos del día
    medicamentos_top_hoy = serializers.ListField()


class QuickActionSerializer(serializers.Serializer):
    """Serializer para acciones rápidas en móvil"""
    
    action_type = serializers.ChoiceField(choices=[
        ('VALIDATE_RECIPE', 'Validar Receta'),
        ('DISPENSE_MEDICATION', 'Dispensar Medicamento'),
        ('SEARCH_PATIENT', 'Buscar Paciente'),
        ('CREATE_RECIPE', 'Crear Receta'),
        ('SCAN_BARCODE', 'Escanear Código'),
        ('EMERGENCY_ACCESS', 'Acceso de Emergencia'),
    ])
    
    parameters = serializers.JSONField(default=dict)


class MobileNotificationSerializer(serializers.Serializer):
    """Serializer para notificaciones móviles"""
    
    id = serializers.IntegerField()
    tipo = serializers.CharField()
    titulo = serializers.CharField()
    mensaje = serializers.CharField()
    prioridad = serializers.CharField()
    fecha = serializers.DateTimeField()
    leida = serializers.BooleanField()
    datos_contexto = serializers.JSONField()
    
    # Información del objeto relacionado
    receta_relacionada = serializers.IntegerField(allow_null=True)
    paciente_relacionado = serializers.CharField(allow_null=True)


class MobileSearchResultSerializer(serializers.Serializer):
    """Serializer para resultados de búsqueda unificada"""
    
    tipo = serializers.ChoiceField(choices=[
        ('PATIENT', 'Paciente'),
        ('RECIPE', 'Receta'),
        ('MEDICATION', 'Medicamento'),
    ])
    
    id = serializers.CharField()
    titulo = serializers.CharField()
    subtitulo = serializers.CharField()
    descripcion = serializers.CharField()
    metadata = serializers.JSONField(default=dict)
    relevancia = serializers.DecimalField(max_digits=3, decimal_places=2)


class MobileOfflineSyncSerializer(serializers.Serializer):
    """Serializer para sincronización offline"""
    
    ultima_sincronizacion = serializers.DateTimeField()
    datos_pendientes = serializers.JSONField()
    cambios_locales = serializers.JSONField()
    conflictos = serializers.ListField()
    version_datos = serializers.CharField()
    
    # Configuración de sincronización
    sincronizacion_automatica = serializers.BooleanField(default=True)
    frecuencia_sync = serializers.IntegerField(default=300)  # segundos
    solo_wifi = serializers.BooleanField(default=False)
