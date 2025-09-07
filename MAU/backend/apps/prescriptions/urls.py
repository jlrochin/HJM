from django.urls import path
from . import views, catalogo_views

app_name = 'prescriptions'

urlpatterns = [
    # Recetas principales
    path('', views.RecetaListCreateView.as_view(), name='receta_list_create'),
    path('<int:folio_receta>/', views.RecetaDetailView.as_view(), name='receta_detail'),
    path('<int:folio_receta>/actualizar-estado/', views.actualizar_estado_receta, name='actualizar_estado_receta'),
    
    # Colas de trabajo
    path('cola-validacion/', views.cola_validacion, name='cola_validacion'),
    path('cola-dispensacion-farmacia/', views.cola_dispensacion_farmacia, name='cola_dispensacion_farmacia'),
    path('cola-dispensacion-cmi/', views.cola_dispensacion_cmi, name='cola_dispensacion_cmi'),
    
    # Detalles de medicamentos
    path('detalles/<int:detalle_id>/', views.detalle_medicamento, name='detalle_medicamento'),
    
    # Gestión de lotes
    path('<int:receta_id>/detalles/<int:detalle_id>/lotes/', views.agregar_lote_medicamento, name='agregar_lote'),
    path('<int:receta_id>/detalles/<int:detalle_id>/lotes/list/', views.obtener_lotes_medicamento, name='obtener_lotes'),
    
    # Verificación de stock
    path('stock/<str:codigo_medicamento>/', views.verificar_stock_medicamento, name='verificar_stock'),
    path('inventario/', views.obtener_inventario_disponible, name='inventario_disponible'),
    
    # Recetas completadas
    path('completadas/', views.recetas_completadas, name='recetas_completadas'),
    
    # Estadísticas
    path('estadisticas/', views.estadisticas_recetas, name='estadisticas_recetas'),
    
    # Catálogo de medicamentos
    path('catalogo/', catalogo_views.listar_todos_medicamentos, name='listar_medicamentos'),
    path('catalogo/buscar/', catalogo_views.buscar_medicamentos, name='buscar_medicamentos'),
    path('catalogo/autocompletar/', catalogo_views.autocompletar_medicamentos, name='autocompletar_medicamentos'),
    path('catalogo/categorias/', catalogo_views.obtener_categorias, name='obtener_categorias'),
    path('catalogo/agregar/', catalogo_views.agregar_medicamento, name='agregar_medicamento'),
    path('catalogo/<int:medicamento_id>/', catalogo_views.obtener_medicamento, name='obtener_medicamento'),
    path('catalogo/<int:medicamento_id>/actualizar/', catalogo_views.actualizar_medicamento, name='actualizar_medicamento'),
    path('catalogo/<int:medicamento_id>/eliminar/', catalogo_views.eliminar_medicamento, name='eliminar_medicamento'),
]
