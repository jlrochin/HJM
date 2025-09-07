from rest_framework import serializers
from .models import Receta, DetalleReceta, LoteDetalleReceta, CatalogoMedicamentos
from apps.patients.serializers import PacienteBusquedaSerializer

class CatalogoMedicamentosSerializer(serializers.ModelSerializer):
    """Serializer para el catálogo de medicamentos"""
    
    class Meta:
        model = CatalogoMedicamentos
        fields = [
            'id', 'clave', 'nombre', 'principio_activo', 'concentracion',
            'forma_farmaceutica', 'categoria', 'tipo_receta_permitido',
            'via_administracion', 'dosis_sugerida', 'contraindicaciones',
            'requiere_refrigeracion', 'es_controlado', 'activo',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_clave(self, value):
        """Validar que la clave sea única"""
        if self.instance:
            # Si estamos actualizando, excluir la instancia actual
            if CatalogoMedicamentos.objects.filter(clave=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Ya existe un medicamento con esta clave")
        else:
            # Si es creación nueva
            if CatalogoMedicamentos.objects.filter(clave=value).exists():
                raise serializers.ValidationError("Ya existe un medicamento con esta clave")
        return value


class LoteDetalleRecetaSerializer(serializers.ModelSerializer):
    """Serializador para gestionar lotes de medicamentos"""
    
    dispensado_por_name = serializers.SerializerMethodField()
    fecha_dispensacion_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = LoteDetalleReceta
        fields = [
            'id', 'lote', 'fecha_caducidad',
            'cantidad_dispensada', 'fecha_dispensacion', 'fecha_dispensacion_formatted',
            'dispensado_por', 'dispensado_por_name', 'observaciones'
        ]
        read_only_fields = ['id', 'fecha_dispensacion']
    
    def get_dispensado_por_name(self, obj):
        """Obtener nombre completo del usuario que dispensó"""
        return obj.dispensado_por.get_full_name() if obj.dispensado_por else None
    
    def get_fecha_dispensacion_formatted(self, obj):
        """Obtener fecha de dispensación formateada"""
        if obj.fecha_dispensacion:
            return obj.fecha_dispensacion.strftime('%d/%m/%Y %H:%M')
        return None
    
    def validate(self, data):
        """Validaciones del lote"""
        detalle_receta = self.context.get('detalle_receta')
        if not detalle_receta:
            raise serializers.ValidationError("Detalle de receta requerido")
        
        # Verificar que la cantidad no exceda lo prescrito
        total_actual = detalle_receta.get_total_lotes_dispensados()
        if self.instance:  # Si estamos actualizando
            total_actual -= self.instance.cantidad_dispensada
        
        nueva_cantidad = data.get('cantidad_dispensada', 0)
        if total_actual + nueva_cantidad > detalle_receta.cantidad_prescrita:
            raise serializers.ValidationError(
                f'La cantidad total dispensada ({total_actual + nueva_cantidad}) '
                f'excede lo prescrito ({detalle_receta.cantidad_prescrita})'
            )
        
        return data


class LoteDetalleRecetaCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear nuevos lotes con validación de inventario"""
    
    class Meta:
        model = LoteDetalleReceta
        fields = [
            'lote', 'fecha_caducidad',
            'cantidad_dispensada', 'observaciones'
        ]
    
    def validate_cantidad_dispensada(self, value):
        """Validar cantidad a dispensar contra inventario disponible"""
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        
        # Verificar stock si el contexto incluye detalle_receta
        detalle_receta = self.context.get('detalle_receta')
        if detalle_receta:
            # Importar aquí para evitar import circular
            from apps.inventory.models import MedicamentoStock
            
            try:
                medicamento_stock = MedicamentoStock.objects.get(
                    medicamento_catalogo=detalle_receta.medicamento
                )
                
                if medicamento_stock.available_stock < value:
                    raise serializers.ValidationError(
                        f"Stock insuficiente. Disponible: {medicamento_stock.available_stock}, "
                        f"solicitado: {value}"
                    )
                    
            except MedicamentoStock.DoesNotExist:
                raise serializers.ValidationError(
                    f"Medicamento '{detalle_receta.medicamento.nombre}' no encontrado en inventario"
                )
        
        return value
    
    def validate_fecha_caducidad(self, value):
        """Validar que la fecha de caducidad no haya pasado"""
        from django.utils import timezone
        
        if value < timezone.now().date():
            raise serializers.ValidationError("La fecha de caducidad no puede ser anterior a hoy")
        
        return value
    
    def create(self, validated_data):
        """Crear nuevo lote"""
        validated_data['detalle_receta'] = self.context['detalle_receta']
        validated_data['dispensado_por'] = self.context['request'].user
        return super().create(validated_data)


class DetalleRecetaSerializer(serializers.ModelSerializer):
    """Serializador para DetalleReceta"""
    
    porcentaje_surtido = serializers.SerializerMethodField()
    cantidad_pendiente = serializers.SerializerMethodField()
    is_completely_dispensed = serializers.SerializerMethodField()
    lotes = LoteDetalleRecetaSerializer(many=True, read_only=True)
    total_lotes_dispensados = serializers.SerializerMethodField()
    medicamento_info = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleReceta
        fields = [
            'id', 'clave_medicamento', 'descripcion_medicamento', 'dosis',
            'cantidad_prescrita', 'cantidad_surtida', 'lote', 'fecha_caducidad',
            'medicamento_catalogo', 'medicamento_info', 'observaciones_dispensacion', 
            'porcentaje_surtido', 'cantidad_pendiente', 'is_completely_dispensed', 
            'lotes', 'total_lotes_dispensados', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = [
            'porcentaje_surtido', 'cantidad_pendiente', 'is_completely_dispensed',
            'lotes', 'total_lotes_dispensados',
            'fecha_creacion', 'fecha_actualizacion'
        ]
    
    def get_porcentaje_surtido(self, obj):
        return obj.get_porcentaje_surtido()
    
    def get_cantidad_pendiente(self, obj):
        return obj.get_cantidad_pendiente()
    
    def get_is_completely_dispensed(self, obj):
        return obj.is_completely_dispensed()
    
    def get_total_lotes_dispensados(self, obj):
        return obj.get_total_lotes_dispensados()
    
    def get_medicamento_info(self, obj):
        """Obtener información del medicamento desde el catálogo"""
        if obj.medicamento_catalogo:
            return {
                'id': obj.medicamento_catalogo.id,
                'clave': obj.medicamento_catalogo.clave,
                'nombre': obj.medicamento_catalogo.nombre,
                'concentracion': obj.medicamento_catalogo.concentracion,
                'forma_farmaceutica': obj.medicamento_catalogo.forma_farmaceutica,
                'via_administracion': obj.medicamento_catalogo.via_administracion,
                'categoria': obj.medicamento_catalogo.categoria
            }
        return None
    
    def validate_cantidad_surtida(self, value):
        """Validar que la cantidad surtida no exceda la prescrita"""
        if hasattr(self, 'initial_data'):
            cantidad_prescrita = self.initial_data.get('cantidad_prescrita')
            if cantidad_prescrita and value > cantidad_prescrita:
                raise serializers.ValidationError(
                    "La cantidad surtida no puede ser mayor a la cantidad prescrita"
                )
        return value

class RecetaSerializer(serializers.ModelSerializer):
    """Serializador para Receta con información completa"""
    
    paciente_info = PacienteBusquedaSerializer(source='paciente', read_only=True)
    detalles = DetalleRecetaSerializer(many=True, read_only=True)
    total_medicamentos = serializers.SerializerMethodField()
    prescrito_por_name = serializers.SerializerMethodField()
    validado_por_name = serializers.SerializerMethodField()
    dispensado_por_name = serializers.SerializerMethodField()
    can_be_validated = serializers.SerializerMethodField()
    can_be_dispensed = serializers.SerializerMethodField()
    is_partially_dispensed = serializers.SerializerMethodField()
    is_completely_dispensed = serializers.SerializerMethodField()
    
    class Meta:
        model = Receta
        fields = [
            'folio_receta', 'paciente', 'paciente_info', 'tipo_receta',
            'estado', 'prioridad', 'servicio_solicitante', 'diagnostico',
            'indicaciones_generales', 'fecha_creacion', 'fecha_validacion',
            'fecha_dispensacion_parcial', 'fecha_dispensacion', 'fecha_vencimiento', 'prescrito_por',
            'prescrito_por_name', 'validado_por', 'validado_por_name',
            'dispensado_por', 'dispensado_por_name', 'observaciones',
            'detalles', 'total_medicamentos', 'can_be_validated',
            'can_be_dispensed', 'is_partially_dispensed', 'is_completely_dispensed'
        ]
        read_only_fields = [
            'folio_receta', 'paciente_info', 'detalles', 'total_medicamentos',
            'prescrito_por_name', 'validado_por_name', 'dispensado_por_name',
            'can_be_validated', 'can_be_dispensed', 'fecha_creacion'
        ]
    
    def get_total_medicamentos(self, obj):
        return obj.get_total_medicamentos()
    
    def get_prescrito_por_name(self, obj):
        return obj.prescrito_por.get_full_name() if obj.prescrito_por else None
    
    def get_validado_por_name(self, obj):
        return obj.validado_por.get_full_name() if obj.validado_por else None
    
    def get_dispensado_por_name(self, obj):
        return obj.dispensado_por.get_full_name() if obj.dispensado_por else None
    
    def get_can_be_validated(self, obj):
        return obj.can_be_validated()
    
    def get_can_be_dispensed(self, obj):
        return obj.can_be_dispensed()
    
    def get_is_partially_dispensed(self, obj):
        return obj.is_partially_dispensed()
    
    def get_is_completely_dispensed(self, obj):
        return obj.is_completely_dispensed()

class RecetaListSerializer(serializers.ModelSerializer):
    """Serializador simplificado para listar recetas"""
    
    paciente_info = PacienteBusquedaSerializer(source='paciente', read_only=True)
    total_medicamentos = serializers.SerializerMethodField()
    prescrito_por_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Receta
        fields = [
            'folio_receta', 'paciente_info', 'tipo_receta', 'estado',
            'prioridad', 'servicio_solicitante', 'fecha_creacion',
            'fecha_vencimiento', 'prescrito_por_name', 'total_medicamentos'
        ]
    
    def get_total_medicamentos(self, obj):
        return obj.get_total_medicamentos()
    
    def get_prescrito_por_name(self, obj):
        return obj.prescrito_por.get_full_name() if obj.prescrito_por else None

class RecetaCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear recetas"""
    
    detalles = DetalleRecetaSerializer(many=True, write_only=True)
    
    class Meta:
        model = Receta
        fields = [
            'paciente', 'tipo_receta', 'prioridad', 'servicio_solicitante',
            'diagnostico', 'indicaciones_generales', 'fecha_vencimiento',
            'observaciones', 'detalles'
        ]
    
    def validate_detalles(self, value):
        """Validar que la receta tenga al menos un medicamento"""
        if not value:
            raise serializers.ValidationError(
                "La receta debe tener al menos un medicamento"
            )
        return value
    
    def create(self, validated_data):
        """Crear receta con sus detalles"""
        detalles_data = validated_data.pop('detalles')
        request = self.context.get('request')
        
        # Asignar usuario que prescribe
        if request and request.user:
            validated_data['prescrito_por'] = request.user
        
        # Crear la receta
        receta = Receta.objects.create(**validated_data)
        
        # Crear los detalles
        for detalle_data in detalles_data:
            DetalleReceta.objects.create(receta=receta, **detalle_data)
        
        return receta

class RecetaEstadoSerializer(serializers.ModelSerializer):
    """Serializador para actualizar el estado de una receta"""
    
    class Meta:
        model = Receta
        fields = ['estado', 'observaciones']
    
    def validate_estado(self, value):
        """Validar transiciones de estado permitidas"""
        if not self.instance:
            return value
        
        current_state = self.instance.estado
        user = self.context.get('request').user if self.context.get('request') else None
        
        # Validar transiciones permitidas
        if current_state == 'PENDIENTE' and value == 'VALIDADA':
            if user and not user.can_validate_prescriptions():
                raise serializers.ValidationError(
                    "No tiene permisos para validar recetas"
                )
        elif current_state == 'VALIDADA' and value == 'SURTIDA':
            # Verificar que el usuario pueda dispensar según el tipo de receta
            if user and self.instance.tipo_receta == 'FARMACIA':
                if not user.can_dispense_pharmacy():
                    raise serializers.ValidationError(
                        "No tiene permisos para dispensar medicamentos de farmacia"
                    )
            elif user and self.instance.tipo_receta == 'CMI':
                if not user.can_dispense_cmi():
                    raise serializers.ValidationError(
                        "No tiene permisos para dispensar mezclas del CMI"
                    )
        elif value == 'CANCELADA':
            # Solo ciertos roles pueden cancelar
            if user and user.role not in ['ADMIN', 'ATENCION_USUARIO']:
                raise serializers.ValidationError(
                    "No tiene permisos para cancelar recetas"
                )
        else:
            raise serializers.ValidationError(
                f"Transición de estado inválida: {current_state} -> {value}"
            )
        
        return value
    
    def update(self, instance, validated_data):
        """Actualizar estado y fechas correspondientes"""
        nuevo_estado = validated_data.get('estado')
        request = self.context.get('request')
        user = request.user if request else None
        
        if nuevo_estado == 'VALIDADA':
            from django.utils import timezone
            validated_data['fecha_validacion'] = timezone.now()
            if user:
                validated_data['validado_por'] = user
        
        elif nuevo_estado == 'SURTIDA':
            from django.utils import timezone
            validated_data['fecha_dispensacion'] = timezone.now()
            if user:
                validated_data['dispensado_por'] = user
        
        return super().update(instance, validated_data)

class DetalleRecetaDispensacionSerializer(serializers.ModelSerializer):
    """Serializador para dispensar medicamentos"""
    
    class Meta:
        model = DetalleReceta
        fields = [
            'cantidad_surtida', 'lote', 'fecha_caducidad',
            'observaciones_dispensacion'
        ]
    
    def validate_cantidad_surtida(self, value):
        """Validar cantidad surtida"""
        if value < 0:
            raise serializers.ValidationError(
                "La cantidad surtida debe ser mayor o igual a 0"
            )
        
        if value > self.instance.cantidad_prescrita:
            raise serializers.ValidationError(
                "La cantidad surtida no puede ser mayor a la cantidad prescrita"
            )
        
        return value
