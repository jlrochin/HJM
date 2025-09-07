from django.urls import path
from . import views

app_name = 'mobile_api'

urlpatterns = [
    # Configuración de la app móvil
    path('config/', views.mobile_app_config, name='mobile_app_config'),
    
    # Dashboard móvil  
    path('dashboard/', views.mobile_dashboard, name='mobile_dashboard'),
    
    # Placeholder para futuras rutas móviles
    # Las demás rutas se implementarán gradualmente
]
