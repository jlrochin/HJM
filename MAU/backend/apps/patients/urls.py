from django.urls import path
from . import views

app_name = 'patients'

urlpatterns = [
    # Endpoints de pacientes
    path('', views.PacienteListCreateView.as_view(), name='paciente_list_create'),
    path('buscar/', views.buscar_paciente, name='buscar_paciente'),
    path('verificar-duplicados/', views.verificar_duplicados, name='verificar_duplicados'),
    path('estadisticas/', views.estadisticas_pacientes, name='estadisticas_pacientes'),
    path('<str:expediente>/', views.PacienteDetailView.as_view(), name='paciente_detail'),
    path('<str:expediente>/historial/', views.paciente_historial, name='paciente_historial'),
    
    # Endpoints de CIE-10 México
    path('cie10/', views.CIE10MexicoListView.as_view(), name='cie10_list'),
    path('cie10/buscar/', views.buscar_cie10, name='buscar_cie10'),
    path('cie10/<str:codigo>/', views.obtener_cie10_completo, name='cie10_detail'),
    path('cie10/estadisticas/', views.estadisticas_cie10, name='estadisticas_cie10'),
    path('<str:expediente>/cie10-aplicables/', views.cie10_para_paciente, name='cie10_para_paciente'),
    
    # Nuevos endpoints para gestionar múltiples códigos CIE-10 por paciente
    path('<str:expediente>/cie10/', views.obtener_cie10_paciente, name='obtener_cie10_paciente'),
    path('<str:expediente>/cie10/agregar/', views.agregar_cie10_paciente, name='agregar_cie10_paciente'),
    path('<str:expediente>/cie10/<int:cie10_id>/', views.actualizar_cie10_paciente, name='actualizar_cie10_paciente'),
    path('<str:expediente>/cie10/<int:cie10_id>/eliminar/', views.eliminar_cie10_paciente, name='eliminar_cie10_paciente'),
    path('<str:expediente>/cie10/<int:cie10_id>/principal/', views.marcar_diagnostico_principal, name='marcar_diagnostico_principal'),
    path('cie10/estadisticas-pacientes/', views.estadisticas_cie10_pacientes, name='estadisticas_cie10_pacientes'),
]
