from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuración del admin para el modelo User personalizado"""
    
    list_display = [
        'username', 'email', 'first_name', 'last_name',
        'role', 'departamento', 'is_active', 'date_joined'
    ]
    
    list_filter = [
        'role', 'is_active', 'is_staff', 'is_superuser',
        'departamento', 'date_joined'
    ]
    
    search_fields = [
        'username', 'first_name', 'last_name', 'email',
        'cedula_profesional', 'departamento'
    ]
    
    ordering = ['username']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Hospitalaria', {
            'fields': ('role', 'cedula_profesional', 'departamento', 'telefono')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        ('Información Personal', {
            'fields': ('first_name', 'last_name', 'telefono')
        }),
        ('Información Hospitalaria', {
            'fields': ('role', 'cedula_profesional', 'departamento')
        }),
    )
