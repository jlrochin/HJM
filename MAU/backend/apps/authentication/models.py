from django.contrib.auth.models import AbstractUser
from django.db import models
from .models_security import (
    PasswordPolicy,
    SecuritySettings,
    UserSecurityProfile,
    TwoFactorSecret,
    IPWhitelist,
    IPBlacklist,
    SecurityLog,
    ActiveSession,
)

class User(AbstractUser):
    """Modelo de usuario personalizado con roles del sistema hospitalario"""
    
    ROLE_CHOICES = [
        ('ATENCION_USUARIO', 'Atención al Usuario'),
        ('FARMACIA', 'Farmacia'),
        ('CMI', 'Centro de Mezclas (CMI)'),
        ('MEDICO', 'Médico'),
        ('ADMIN', 'Administrador'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='MEDICO',
        verbose_name='Rol'
    )
    
    cedula_profesional = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Cédula Profesional'
    )
    
    departamento = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Departamento'
    )
    
    telefono = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        verbose_name='Teléfono'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de actualización'
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        db_table = 'auth_user'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def can_create_patients(self):
        """Atención al Usuario y Admin pueden crear pacientes"""
        return self.role in ['ATENCION_USUARIO', 'ADMIN']
    
    def can_edit_patients(self):
        """Atención al Usuario y Admin pueden editar pacientes"""
        return self.role in ['ATENCION_USUARIO', 'ADMIN']
    
    def can_validate_prescriptions(self):
        """Atención al Usuario y Admin pueden validar recetas"""
        return self.role in ['ATENCION_USUARIO', 'ADMIN']
    
    def can_dispense_pharmacy(self):
        """Farmacia y Admin pueden dispensar medicamentos de farmacia"""
        return self.role in ['FARMACIA', 'ADMIN']
    
    def can_dispense_cmi(self):
        """CMI y Admin pueden dispensar mezclas"""
        return self.role in ['CMI', 'ADMIN']
    
    def can_create_prescriptions(self):
        """Médicos, Atención al Usuario y Admins pueden crear recetas"""
        return self.role in ['MEDICO', 'ATENCION_USUARIO', 'ADMIN']
