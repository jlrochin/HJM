from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Plantillas de reportes
    path('templates/', views.ReportTemplateListCreateView.as_view(), name='report_templates'),
    path('templates/<int:pk>/', views.ReportTemplateDetailView.as_view(), name='report_template_detail'),
    
    # Reportes generados
    path('generated/', views.GeneratedReportListView.as_view(), name='generated_reports'),
    
    # Dashboard y estadísticas
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('metrics/real-time/', views.real_time_metrics, name='real_time_metrics'),
    
    # Reportes específicos
    path('performance/', views.generate_performance_report, name='performance_report'),
    path('inventory/', views.inventory_report, name='inventory_report'),
    path('custom/', views.generate_custom_report, name='custom_report'),
    
    # Auditoría
    path('audit/', views.audit_logs, name='audit_logs'),
    
    # Sistema
    path('health/', views.system_health, name='system_health'),
]
