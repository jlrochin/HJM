from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from .models import SystemMovement
import json
import logging

logger = logging.getLogger(__name__)


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware para capturar automáticamente solo acciones importantes del sistema
    """
    
    def process_request(self, request):
        """Capturar información de la petición entrante"""
        request.audit_start_time = timezone.now()
        
        # Obtener el usuario correcto de forma simplificada
        user = None
        
        # Para el login, intentar obtener el usuario del body de la petición
        if request.method == 'POST' and 'login' in request.path.lower():
            try:
                # Intentar obtener el usuario del body de la petición
                if hasattr(request, 'body') and request.body:
                    import json
                    body_data = json.loads(request.body.decode('utf-8'))
                    username = body_data.get('username')
                    if username:
                        from apps.authentication.models import User
                        try:
                            user = User.objects.get(username=username)
                            logger.info(f'Usuario detectado en login: {username}')
                        except User.DoesNotExist:
                            logger.warning(f'Usuario no encontrado: {username}')
            except Exception as e:
                logger.warning(f'Error al procesar body del login: {e}')
        
        # Si no se pudo obtener del body, usar el usuario de la sesión
        if not user and hasattr(request, 'user') and request.user.is_authenticated:
            # Si es un TokenUser de JWT, obtener el usuario real
            if hasattr(request.user, 'id') and hasattr(request.user, '_token'):
                try:
                    from apps.authentication.models import User
                    user = User.objects.get(id=request.user.id)
                    logger.info(f'Usuario detectado por ID: {user.username}')
                except Exception as e:
                    logger.warning(f'Error al obtener usuario por ID: {e}')
                    user = request.user
            else:
                user = request.user
                logger.info(f'Usuario directo: {getattr(user, "username", "N/A")}')
        
        request.audit_data = {
            'method': request.method,
            'path': request.path,
            'user': user,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'session_id': request.session.session_key if hasattr(request, 'session') else None,
        }
        
        # Debug: Log del usuario encontrado
        if user:
            logger.info(f'Usuario final en middleware: {getattr(user, "username", "N/A")}')
        else:
            logger.warning('No se pudo detectar usuario en middleware')
    
    def process_response(self, request, response):
        """Capturar información de la respuesta solo para acciones importantes"""
        if hasattr(request, 'audit_start_time'):
            # Solo auditar si es una acción importante
            if self.should_audit_request(request, response):
                execution_time = (timezone.now() - request.audit_start_time).total_seconds() * 1000
                
                # Determinar el tipo de acción de forma simplificada
                action_type = self.get_simple_action_type(request.method, request.path)
                
                # Determinar el módulo de forma simplificada
                module = self.get_simple_module(request.path)
                
                # Determinar si fue exitoso
                is_successful = 200 <= response.status_code < 400
                
                # Crear descripción simple y clara
                description = self.get_simple_description(request.method, request.path, request.audit_data.get('user'))
                
                try:
                    # Crear el registro de auditoría simplificado
                    SystemMovement.objects.create(
                        action_type=action_type,
                        entity_type='SISTEMA',
                        entity_id=None,
                        object_id=None,
                        description=description,
                        user=request.audit_data.get('user'),
                        ip_address=request.audit_data.get('ip_address'),
                        user_agent=request.audit_data.get('user_agent'),
                        session_id=request.audit_data.get('session_id'),
                        module=module,
                        function_name=action_type.lower(),
                        timestamp=request.audit_start_time,
                        execution_time=execution_time,
                        is_successful=is_successful,
                        priority='MEDIUM',
                        tags={
                            'simple': True,
                            'method': request.method,
                            'status': response.status_code
                        }
                    )
                    
                    # Log de confirmación
                    user_info = "Usuario no identificado"
                    if request.audit_data.get('user'):
                        user_info = getattr(request.audit_data.get('user'), 'username', 'N/A')
                    logger.info(f'Registro de auditoría creado: {action_type} por {user_info}')
                    
                except Exception as e:
                    logger.error(f'Error al crear registro de auditoría: {str(e)}')
        
        return response
    
    def process_exception(self, request, exception):
        """Capturar excepciones de forma simplificada"""
        if hasattr(request, 'audit_start_time'):
            execution_time = (timezone.now() - request.audit_start_time).total_seconds() * 1000
            
            try:
                SystemMovement.objects.create(
                    action_type='ERROR',
                    entity_type='SISTEMA',
                    entity_id=None,
                    object_id=None,
                    description=f"Error en {request.path}",
                    user=request.audit_data.get('user'),
                    ip_address=request.audit_data.get('ip_address'),
                    user_agent=request.audit_data.get('user_agent'),
                    session_id=request.audit_data.get('session_id'),
                    module='SISTEMA',
                    function_name='error',
                    timestamp=request.audit_start_time,
                    execution_time=execution_time,
                    is_successful=False,
                    priority='HIGH',
                    error_message=str(exception),
                    tags={
                        'simple': True,
                        'error': True
                    }
                )
            except Exception as e:
                logger.error(f'Error al crear registro de auditoría de excepción: {str(e)}')
    
    def should_audit_request(self, request, response):
        """
        Determinar si la petición debe ser auditada - versión simplificada
        """
        path = request.path.lower()
        method = request.method
        
        # Solo auditar acciones importantes
        if method == 'POST' and 'login' in path:
            return True
        elif method == 'POST' and 'logout' in path:
            return True
        elif method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # Solo si no es navegación rutinaria
            if not any(routine in path for routine in ['dashboard', 'estadisticas', 'list', 'search']):
                return True
        
        # Auditar errores
        if hasattr(response, 'status_code') and response.status_code >= 400:
            return True
        
        return False
    
    def get_simple_action_type(self, method, path):
        """Determinar el tipo de acción de forma simple"""
        if 'login' in path.lower():
            return 'LOGIN'
        elif 'logout' in path.lower():
            return 'LOGOUT'
        elif method == 'POST':
            return 'CREAR'
        elif method == 'PUT':
            return 'ACTUALIZAR'
        elif method == 'DELETE':
            return 'ELIMINAR'
        else:
            return 'ACCESO'
    
    def get_simple_module(self, path):
        """Determinar el módulo de forma simple"""
        if 'auth' in path.lower():
            return 'AUTENTICACIÓN'
        elif 'patients' in path.lower():
            return 'PACIENTES'
        elif 'prescriptions' in path.lower():
            return 'RECETAS'
        elif 'inventory' in path.lower():
            return 'INVENTARIO'
        elif 'admin' in path.lower():
            return 'ADMINISTRACIÓN'
        else:
            return 'SISTEMA'
    
    def get_simple_description(self, method, path, user):
        """Crear descripción simple y clara"""
        user_info = "Usuario no identificado"
        if user:
            if hasattr(user, 'username'):
                user_info = user.username
            elif hasattr(user, 'first_name'):
                user_info = f"{user.first_name}"
            elif hasattr(user, 'id'):
                user_info = f"Usuario {user.id}"
        
        if 'login' in path.lower():
            return f"Inicio de sesión - {user_info}"
        elif 'logout' in path.lower():
            return f"Cierre de sesión - {user_info}"
        elif method == 'POST':
            return f"Creación de datos - {user_info}"
        elif method == 'PUT':
            return f"Actualización de datos - {user_info}"
        elif method == 'DELETE':
            return f"Eliminación de datos - {user_info}"
        else:
            return f"Acceso al sistema - {user_info}"
    
    def get_client_ip(self, request):
        """Obtener la IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
