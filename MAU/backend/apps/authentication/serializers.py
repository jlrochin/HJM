from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from .models import User
from .recaptcha import RecaptchaValidator

class UserSerializer(serializers.ModelSerializer):
    """Serializador para el modelo de Usuario"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'cedula_profesional', 'departamento', 'telefono',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class LoginSerializer(serializers.Serializer):
    """Serializador para el login de usuarios con validación reCAPTCHA"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    recaptcha_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
    
    def validate_recaptcha_token(self, value):
        """Valida el token de reCAPTCHA"""
        # En modo desarrollo, permitir tokens vacíos o fallback
        if settings.DEBUG and (not value or value == 'fallback-token'):
            return value
            
        if not value:
            raise serializers.ValidationError(
                'Token de verificación reCAPTCHA requerido.'
            )
        
        # Obtener IP del cliente
        user_ip = None
        if self.request:
            user_ip = RecaptchaValidator.get_client_ip(self.request)
        
        # Validar con Google
        result = RecaptchaValidator.validate_token(value, user_ip)
        
        if not result.get('success', False):
            error_codes = result.get('error_codes', [])
            if 'timeout-or-duplicate' in error_codes:
                raise serializers.ValidationError(
                    'La verificación ha expirado. Por favor, inténtalo de nuevo.'
                )
            elif 'invalid-input-response' in error_codes:
                raise serializers.ValidationError(
                    'Verificación inválida. Por favor, inténtalo de nuevo.'
                )
            else:
                raise serializers.ValidationError(
                    'Error en la verificación de seguridad. Por favor, inténtalo de nuevo.'
                )
        
        return value
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        recaptcha_token = attrs.get('recaptcha_token')
        
        # Validar reCAPTCHA si está presente
        if recaptcha_token:
            self.validate_recaptcha_token(recaptcha_token)
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Esta cuenta está desactivada.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Debe proporcionar usuario y contraseña.'
            )

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear usuarios"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'role', 'cedula_profesional',
            'departamento', 'telefono'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                "Las contraseñas no coinciden."
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user
