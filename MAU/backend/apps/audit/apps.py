from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.audit'
    verbose_name = 'Auditoría del Sistema'
    
    def ready(self):
        """Registrar señales cuando la app esté lista"""
        try:
            from . import signals
            from .signals import register_all_models_for_audit
            
            # Registrar señales para todos los modelos
            register_all_models_for_audit()
        except Exception as e:
            # Log del error pero no fallar la aplicación
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f'No se pudieron registrar las señales de auditoría: {str(e)}')
