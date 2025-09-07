from django.utils import timezone
from .models import SystemMovement
import logging

logger = logging.getLogger(__name__)


def log_action(action_type, entity_type, description, user=None, entity_id=None, 
               object_id=None, module=None, function_name=None, priority='MEDIUM', 
               is_successful=True, error_message=None, tags=None, **kwargs):
    """
    Función de utilidad para registrar acciones de auditoría
    
    Uso:
    from apps.audit.utils import log_action
    
    log_action(
        action_type='CREATE',
        entity_type='PATIENT',
        description='Paciente creado exitosamente',
        user=request.user,
        entity_id=patient.id,
        module='PATIENTS',
        function_name='create_patient'
    )
    """
    try:
        # Preparar tags
        if tags is None:
            tags = {}
        
        # Agregar información adicional a los tags
        tags.update({
            'utility_function': True,
            'timestamp': timezone.now().isoformat(),
            **kwargs
        })
        
        # Crear el registro de auditoría
        SystemMovement.objects.create(
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            object_id=object_id,
            description=description,
            user=user,
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent'),
            session_id=kwargs.get('session_id'),
            module=module or entity_type.upper(),
            function_name=function_name or 'utility_log',
            timestamp=timezone.now(),
            execution_time=kwargs.get('execution_time'),
            is_successful=is_successful,
            priority=priority,
            error_message=error_message,
            tags=tags
        )
        
        return True
        
    except Exception as e:
        logger.error(f'Error al registrar acción de auditoría: {str(e)}')
        return False


def log_user_action(user, action_type, description, **kwargs):
    """
    Función específica para auditar acciones de usuario
    
    Uso:
    log_user_action(
        user=request.user,
        action_type='LOGIN',
        description='Usuario inició sesión'
    )
    """
    return log_action(
        action_type=action_type,
        entity_type='USER',
        description=description,
        user=user,
        module='AUTHENTICATION',
        **kwargs
    )


def log_model_action(action_type, model_instance, description, user=None, **kwargs):
    """
    Función específica para auditar acciones en modelos
    
    Uso:
    log_model_action(
        action_type='CREATE',
        model_instance=patient,
        description='Paciente creado',
        user=request.user
    )
    """
    # Obtener el nombre del modelo
    model_name = model_instance.__class__.__name__.upper()
    
    # Obtener el ID del modelo
    model_id = getattr(model_instance, 'id', None)
    
    # Obtener el módulo basado en el nombre de la app
    app_name = model_instance._meta.app_label.upper()
    
    return log_action(
        action_type=action_type,
        entity_type=model_name,
        description=description,
        user=user,
        entity_id=model_id,
        object_id=model_id,
        module=app_name,
        function_name=f'{action_type.lower()}_{model_name.lower()}',
        **kwargs
    )


def log_error(error, context=None, user=None, **kwargs):
    """
    Función específica para auditar errores del sistema
    
    Uso:
    log_error(
        error=exception,
        context='Vista de pacientes',
        user=request.user
    )
    """
    return log_action(
        action_type='ERROR',
        entity_type='SYSTEM',
        description=f"Error del sistema: {str(error)}",
        user=user,
        module=kwargs.get('module', 'SYSTEM'),
        function_name=kwargs.get('function_name', 'error_handler'),
        priority='CRITICAL',
        is_successful=False,
        error_message=str(error),
        tags={
            'error_type': type(error).__name__,
            'context': context,
            'error': True,
            **kwargs
        }
    )


def log_performance(operation_name, execution_time, user=None, **kwargs):
    """
    Función específica para auditar el rendimiento de operaciones
    
    Uso:
    log_performance(
        operation_name='Consulta de pacientes',
        execution_time=150.5,  # en milisegundos
        user=request.user
    )
    """
    # Determinar prioridad basada en el tiempo de ejecución
    if execution_time > 1000:  # Más de 1 segundo
        priority = 'HIGH'
    elif execution_time > 500:  # Más de 500ms
        priority = 'MEDIUM'
    else:
        priority = 'LOW'
    
    return log_action(
        action_type='PERFORMANCE',
        entity_type='SYSTEM',
        description=f"Operación: {operation_name}",
        user=user,
        module=kwargs.get('module', 'PERFORMANCE'),
        function_name=operation_name.lower().replace(' ', '_'),
        priority=priority,
        execution_time=execution_time,
        tags={
            'performance': True,
            'execution_time_ms': execution_time,
            'operation_name': operation_name,
            **kwargs
        }
    )


def log_security_event(event_type, description, user=None, ip_address=None, **kwargs):
    """
    Función específica para auditar eventos de seguridad
    
    Uso:
    log_security_event(
        event_type='LOGIN_ATTEMPT',
        description='Intento de inicio de sesión fallido',
        ip_address='192.168.1.100'
    )
    """
    return log_action(
        action_type='SECURITY',
        entity_type='SYSTEM',
        description=description,
        user=user,
        ip_address=ip_address,
        module='SECURITY',
        function_name=event_type.lower(),
        priority='HIGH',
        tags={
            'security': True,
            'event_type': event_type,
            'ip_address': ip_address,
            **kwargs
        }
    )


# Context manager para medir el tiempo de ejecución
class AuditTimer:
    """
    Context manager para medir y auditar el tiempo de ejecución de operaciones
    
    Uso:
    with AuditTimer('Consulta de pacientes', user=request.user) as timer:
        # código de la operación
        patients = Patient.objects.all()
    """
    
    def __init__(self, operation_name, user=None, **kwargs):
        self.operation_name = operation_name
        self.user = user
        self.kwargs = kwargs
        self.start_time = None
    
    def __enter__(self):
        self.start_time = timezone.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            execution_time = (timezone.now() - self.start_time).total_seconds() * 1000
            
            # Si hubo una excepción, logear como error
            if exc_type:
                log_error(
                    error=exc_val,
                    context=self.operation_name,
                    user=self.user,
                    execution_time=execution_time,
                    **self.kwargs
                )
            else:
                # Si fue exitoso, logear como performance
                log_performance(
                    operation_name=self.operation_name,
                    execution_time=execution_time,
                    user=self.user,
                    **self.kwargs
                )
