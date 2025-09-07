from functools import wraps
from django.utils import timezone
from .models import SystemMovement
import logging

logger = logging.getLogger(__name__)


def audit_action(action_type, entity_type, description=None, priority='MEDIUM'):
    """
    Decorador para auditar acciones específicas en las vistas
    
    Uso:
    @audit_action('CREATE', 'PATIENT', 'Creación de paciente')
    def create_patient(request):
        # código de la vista
        pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            start_time = timezone.now()
            
            try:
                # Ejecutar la vista
                response = view_func(request, *args, **kwargs)
                
                # Determinar si fue exitoso
                is_successful = hasattr(response, 'status_code') and 200 <= response.status_code < 400
                
                # Obtener información de la entidad si está disponible
                entity_id = None
                object_id = None
                
                # Intentar obtener el ID de la entidad de los kwargs o del response
                if 'pk' in kwargs:
                    entity_id = kwargs['pk']
                elif 'id' in kwargs:
                    entity_id = kwargs['id']
                
                # Si es una respuesta de creación exitosa, intentar obtener el ID del objeto creado
                if is_successful and hasattr(response, 'data') and isinstance(response.data, dict):
                    if 'id' in response.data:
                        object_id = response.data['id']
                
                # Crear el registro de auditoría
                SystemMovement.objects.create(
                    action_type=action_type,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    object_id=object_id,
                    description=description or f"{action_type} en {entity_type}",
                    user=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    session_id=request.session.session_key if hasattr(request, 'session') else None,
                    module=entity_type.upper(),
                    function_name=view_func.__name__,
                    timestamp=start_time,
                    execution_time=(timezone.now() - start_time).total_seconds() * 1000,
                    is_successful=is_successful,
                    priority=priority,
                    tags={
                        'view_function': view_func.__name__,
                        'http_method': request.method,
                        'status_code': getattr(response, 'status_code', None),
                        'decorated': True
                    }
                )
                
                return response
                
            except Exception as e:
                # Capturar excepciones
                execution_time = (timezone.now() - start_time).total_seconds() * 1000
                
                try:
                    SystemMovement.objects.create(
                        action_type='ERROR',
                        entity_type=entity_type,
                        entity_id=entity_id if 'entity_id' in locals() else None,
                        object_id=object_id if 'object_id' in locals() else None,
                        description=f"Error en {action_type} de {entity_type}: {str(e)}",
                        user=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        session_id=request.session.session_key if hasattr(request, 'session') else None,
                        module=entity_type.upper(),
                        function_name=view_func.__name__,
                        timestamp=start_time,
                        execution_time=execution_time,
                        is_successful=False,
                        priority='CRITICAL',
                        error_message=str(e),
                        tags={
                            'view_function': view_func.__name__,
                            'http_method': request.method,
                            'exception_type': type(e).__name__,
                            'decorated': True,
                            'error': True
                        }
                    )
                except Exception as audit_error:
                    # Error al crear registro de auditoría
                    pass
                
                # Re-lanzar la excepción original
                raise
        
        return wrapper
    return decorator


def audit_model_action(action_type, entity_type, description=None, priority='MEDIUM'):
    """
    Decorador específico para acciones CRUD en modelos
    
    Uso:
    @audit_model_action('CREATE', 'PATIENT', 'Creación de paciente')
    def create_patient(request):
        # código de la vista
        pass
    """
    return audit_action(action_type, entity_type, description, priority)


def audit_login():
    """Decorador específico para acciones de login"""
    return audit_action('LOGIN', 'USER', 'Inicio de sesión', 'LOW')


def audit_logout():
    """Decorador específico para acciones de logout"""
    return audit_action('LOGOUT', 'USER', 'Cierre de sesión', 'LOW')


def audit_delete():
    """Decorador específico para acciones de eliminación"""
    return audit_action('DELETE', 'ENTITY', 'Eliminación de entidad', 'HIGH')


def audit_critical():
    """Decorador para acciones críticas del sistema"""
    return audit_action('CRITICAL', 'SYSTEM', 'Acción crítica del sistema', 'CRITICAL')
