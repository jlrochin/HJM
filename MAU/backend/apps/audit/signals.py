from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.utils import timezone
from .models import SystemMovement
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def audit_user_changes(sender, instance, created, **kwargs):
    """Auditar cambios importantes en usuarios"""
    try:
        # Solo auditar cambios significativos
        if created:
            action_type = 'CREATE'
            description = f"Usuario creado: {instance.username}"
            priority = 'MEDIUM'
        else:
            # Solo auditar cambios importantes, no cada modificación menor
            if kwargs.get('update_fields'):
                # Si solo se actualizaron campos menores, no auditar
                minor_fields = {'last_login', 'date_joined', 'last_modified'}
                if set(kwargs['update_fields']).issubset(minor_fields):
                    return
                action_type = 'UPDATE'
                description = f"Usuario actualizado: {instance.username}"
                priority = 'LOW'
            else:
                action_type = 'UPDATE'
                description = f"Usuario actualizado: {instance.username}"
                priority = 'MEDIUM'
        
        SystemMovement.objects.create(
            action_type=action_type,
            entity_type='USER',
            entity_id=instance.id,
            object_id=instance.id,
            description=description,
            user=instance,
            module='AUTHENTICATION',
            function_name='user_save',
            timestamp=timezone.now(),
            priority=priority,
            is_successful=True,
            tags={
                'model': 'User',
                'username': instance.username,
                'email': instance.email,
                'is_active': instance.is_active,
                'is_staff': instance.is_staff,
                'is_superuser': instance.is_superuser,
                'created': created
            }
        )
    except Exception as e:
        logger.error(f'Error al auditar cambios de usuario: {str(e)}')


@receiver(post_delete, sender=User)
def audit_user_deletion(sender, instance, **kwargs):
    """Auditar eliminación de usuarios"""
    try:
        SystemMovement.objects.create(
            action_type='DELETE',
            entity_type='USER',
            entity_id=instance.id,
            object_id=instance.id,
            description=f"Usuario eliminado: {instance.username}",
            user=None,  # El usuario ya no existe
            module='AUTHENTICATION',
            function_name='user_delete',
            timestamp=timezone.now(),
            priority='HIGH',
            is_successful=True,
            tags={
                'model': 'User',
                'username': instance.username,
                'email': instance.email,
                'deleted': True
            }
        )
    except Exception as e:
        logger.error(f'Error al auditar eliminación de usuario: {str(e)}')


def create_model_audit_signal(model_class, entity_type, module_name):
    """
    Crear señales de auditoría para un modelo específico
    Solo captura cambios importantes, no modificaciones menores
    """
    
    @receiver(post_save, sender=model_class)
    def audit_model_changes(sender, instance, created, **kwargs):
        try:
            # Solo auditar si es creación o actualización significativa
            if created:
                action_type = 'CREATE'
                description = f"{entity_type} creado: {str(instance)}"
                priority = 'MEDIUM'
            else:
                # Solo auditar si se actualizaron campos importantes
                if kwargs.get('update_fields'):
                    # Definir campos menores que no requieren auditoría
                    minor_fields = {
                        'last_modified', 'updated_at', 'modified_at', 
                        'last_accessed', 'access_count', 'view_count',
                        'cache_timestamp', 'sync_status'
                    }
                    
                    # Si solo se actualizaron campos menores, no auditar
                    if set(kwargs['update_fields']).issubset(minor_fields):
                        return
                    
                    action_type = 'UPDATE'
                    description = f"{entity_type} actualizado: {str(instance)}"
                    priority = 'LOW'
                else:
                    action_type = 'UPDATE'
                    description = f"{entity_type} actualizado: {str(instance)}"
                    priority = 'MEDIUM'
            
            # Obtener el usuario que realizó la acción (si está disponible)
            user = getattr(instance, 'user', None)
            if not user and hasattr(instance, 'created_by'):
                user = instance.created_by
            elif not user and hasattr(instance, 'modified_by'):
                user = instance.modified_by
            
            SystemMovement.objects.create(
                action_type=action_type,
                entity_type=entity_type,
                entity_id=instance.id,
                object_id=instance.id,
                description=description,
                user=user,
                module=module_name,
                function_name=f'{entity_type.lower()}_save',
                timestamp=timezone.now(),
                priority=priority,
                is_successful=True,
                tags={
                    'model': model_class.__name__,
                    'created': created,
                    'instance_repr': str(instance),
                    'update_fields': list(kwargs.get('update_fields', []))
                }
            )
        except Exception as e:
            logger.error(f'Error al auditar cambios de {entity_type}: {str(e)}')
    
    @receiver(post_delete, sender=model_class)
    def audit_model_deletion(sender, instance, **kwargs):
        try:
            # Obtener el usuario que realizó la acción (si está disponible)
            user = getattr(instance, 'user', None)
            if not user and hasattr(instance, 'deleted_by'):
                user = instance.deleted_by
            
            SystemMovement.objects.create(
                action_type='DELETE',
                entity_type=entity_type,
                entity_id=instance.id,
                object_id=instance.id,
                description=f"{entity_type} eliminado: {str(instance)}",
                user=user,
                module=module_name,
                function_name=f'{entity_type.lower()}_delete',
                timestamp=timezone.now(),
                priority='HIGH',
                is_successful=True,
                tags={
                    'model': model_class.__name__,
                    'deleted': True,
                    'instance_repr': str(instance)
                }
            )
        except Exception as e:
            logger.error(f'Error al auditar eliminación de {entity_type}: {str(e)}')


# Función para registrar automáticamente todos los modelos para auditoría
def register_all_models_for_audit():
    """
    Registrar automáticamente todos los modelos para auditoría
    Esta función debe ser llamada después de que todos los modelos estén cargados
    """
    from django.apps import apps
    
    # Mapeo de modelos a tipos de entidad
    model_mapping = {
        'Patient': ('PATIENT', 'PATIENTS'),
        'Receta': ('PRESCRIPTION', 'PRESCRIPTIONS'),
        'Medicamento': ('MEDICATION', 'INVENTORY'),
        'Lote': ('BATCH', 'INVENTORY'),
        'SystemMovement': ('AUDIT_LOG', 'AUDIT'),
    }
    
    for model_name, (entity_type, module_name) in model_mapping.items():
        try:
            model_class = apps.get_model('patients', model_name)
            if model_class:
                create_model_audit_signal(model_class, entity_type, module_name)
                logger.info(f'Señal de auditoría registrada para {model_name}')
        except Exception as e:
            logger.warning(f'No se pudo registrar auditoría para {model_name}: {str(e)}')
        
        try:
            model_class = apps.get_model('prescriptions', model_name)
            if model_class:
                create_model_audit_signal(model_class, entity_type, module_name)
                logger.info(f'Señal de auditoría registrada para {model_name}')
        except Exception as e:
            logger.warning(f'No se pudo registrar auditoría para {model_name}: {str(e)}')
        
        try:
            model_class = apps.get_model('inventory', model_name)
            if model_class:
                create_model_audit_signal(model_class, entity_type, module_name)
                logger.info(f'Señal de auditoría registrada para {model_name}')
        except Exception as e:
            logger.warning(f'No se pudo registrar auditoría para {model_name}: {str(e)}')
