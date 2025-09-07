from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    path('medicamentos/', views.inventory_list, name='inventory_list'),
    path('medicamentos/<int:medicamento_id>/decrease-stock/', views.decrease_stock, name='decrease_stock'),
]
