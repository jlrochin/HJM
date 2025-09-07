import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class RecaptchaValidator:
    """Validador para Google reCAPTCHA"""
    
    VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
    
    @classmethod
    def validate_token(cls, token, user_ip=None):
        """
        Valida un token de reCAPTCHA con Google
        
        Args:
            token (str): Token de reCAPTCHA del frontend
            user_ip (str, optional): IP del usuario para validación adicional
            
        Returns:
            dict: Resultado de la validación con success, error_codes, etc.
        """
        if not token:
            return {
                'success': False,
                'error': 'Token de reCAPTCHA requerido'
            }
        
        # En desarrollo/testing, permitir tokens fallback
        if token == 'fallback-token' and settings.DEBUG:
            logger.info("Usando token fallback en modo desarrollo")
            return {
                'success': True,
                'fallback': True
            }
        
        # Obtener la clave secreta
        secret_key = getattr(settings, 'RECAPTCHA_SECRET_KEY', None)
        if not secret_key:
            logger.error("RECAPTCHA_SECRET_KEY no configurada")
            return {
                'success': False,
                'error': 'Configuración de reCAPTCHA no disponible'
            }
        
        # Preparar datos para la validación
        data = {
            'secret': secret_key,
            'response': token,
        }
        
        if user_ip:
            data['remoteip'] = user_ip
        
        try:
            # Hacer petición a Google
            response = requests.post(
                cls.VERIFY_URL,
                data=data,
                timeout=10
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Log para debugging
            logger.info(f"reCAPTCHA validation result: {result}")
            
            return {
                'success': result.get('success', False),
                'challenge_ts': result.get('challenge_ts'),
                'hostname': result.get('hostname'),
                'error_codes': result.get('error-codes', []),
                'score': result.get('score'),  # Para reCAPTCHA v3
                'action': result.get('action')  # Para reCAPTCHA v3
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error validating reCAPTCHA: {e}")
            return {
                'success': False,
                'error': 'Error de conexión con el servicio de validación'
            }
        except Exception as e:
            logger.error(f"Unexpected error validating reCAPTCHA: {e}")
            return {
                'success': False,
                'error': 'Error inesperado en la validación'
            }
    
    @classmethod
    def get_client_ip(cls, request):
        """
        Obtiene la IP real del cliente considerando proxies
        
        Args:
            request: Request de Django
            
        Returns:
            str: IP del cliente
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
