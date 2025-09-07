from rest_framework import serializers
from .models import SystemMovement


class SystemMovementSerializer(serializers.ModelSerializer):
    """
    Serializer para movimientos del sistema
    """
    user = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    action = serializers.CharField(source='action_type')
    entity_id = serializers.SerializerMethodField()
    details = serializers.CharField(source='description')
    ip_address = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField()
    
    class Meta:
        model = SystemMovement
        fields = [
            'id', 'timestamp', 'user', 'user_role', 'action', 
            'entity_type', 'entity_id', 'details', 'ip_address', 
            'status', 'priority', 'module', 'function_name'
        ]
    
    def get_user(self, obj):
        """Obtener nombre del usuario"""
        if obj.user:
            if obj.user.first_name and obj.user.last_name:
                return f"{obj.user.first_name} {obj.user.last_name}"
            return obj.user.username
        return "Sistema"
    
    def get_user_role(self, obj):
        """Obtener rol del usuario"""
        if obj.user and hasattr(obj.user, 'role'):
            return obj.user.role
        return "Usuario"
    
    def get_entity_id(self, obj):
        """Obtener ID de la entidad"""
        if obj.entity_id:
            return obj.entity_id
        elif obj.object_id:
            return obj.object_id
        return None
    
    def get_ip_address(self, obj):
        """Obtener dirección IP"""
        return obj.ip_address or "N/A"
    
    def get_status(self, obj):
        """Obtener estado del movimiento"""
        if obj.is_successful:
            return 'SUCCESS'
        else:
            return 'ERROR'
