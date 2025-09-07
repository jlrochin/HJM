from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.utils import timezone
import json

from apps.prescriptions.models import CatalogoMedicamentos
from .models import MedicamentoStock


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_list(request):
    """
    Lista todos los medicamentos del catálogo con su stock actual.
    Automáticamente crea registros de stock con 100 piezas si no existen.
    """
    try:
        # Obtener todos los medicamentos del catálogo
        medicamentos = CatalogoMedicamentos.objects.filter(activo=True).order_by('nombre')
        
        # Filtros opcionales
        search = request.GET.get('search', '').strip()
        categoria = request.GET.get('categoria', '').strip()
        stock_filter = request.GET.get('stock_filter', '').strip()
        
        if search:
            medicamentos = medicamentos.filter(
                models.Q(nombre__icontains=search) | 
                models.Q(clave__icontains=search) |
                models.Q(principio_activo__icontains=search)
            )
        
        if categoria:
            medicamentos = medicamentos.filter(categoria=categoria)
        
        inventory_data = []
        
        for medicamento in medicamentos:
            # Obtener o crear el stock del medicamento
            try:
                stock = MedicamentoStock.objects.filter(
                    medicamento_catalogo=medicamento
                ).first()
                
                if not stock:
                    # Crear nuevo registro de stock con 100 piezas
                    stock = MedicamentoStock.objects.create(
                        medicamento_catalogo=medicamento,
                        current_stock=100,
                        reserved_stock=0,
                        average_cost=Decimal('50.00'),
                        last_purchase_price=Decimal('50.00'),
                        storage_location='Farmacia General',
                        storage_conditions='ROOM_TEMP'
                    )
                    created = True
                else:
                    created = False
                
            except Exception as e:
                # Si hay error, usar valores por defecto
                stock = type('Stock', (), {
                    'current_stock': 100,
                    'reserved_stock': 0,
                    'average_cost': Decimal('50.00'),
                    'last_purchase_price': Decimal('50.00'),
                    'storage_location': 'Farmacia General',
                    'storage_conditions': 'ROOM_TEMP',
                    'updated_at': timezone.now()
                })()
                created = True
            
            # Calcular stock disponible
            available_stock = max(0, stock.current_stock - stock.reserved_stock)
            
            # Determinar estado del stock
            if available_stock == 0:
                stock_status = 'agotado'
                stock_status_label = 'Sin Stock'
                stock_status_class = 'bg-red-100 text-red-800'
            elif available_stock <= 20:  # Stock mínimo por defecto
                stock_status = 'bajo'
                stock_status_label = 'Stock Bajo'
                stock_status_class = 'bg-yellow-100 text-yellow-800'
            else:
                stock_status = 'normal'
                stock_status_label = 'Normal'
                stock_status_class = 'bg-green-100 text-green-800'
            
            # Aplicar filtro de stock si se especifica
            if stock_filter:
                if stock_filter == 'agotado' and stock_status != 'agotado':
                    continue
                elif stock_filter == 'bajo' and stock_status != 'bajo':
                    continue
                elif stock_filter == 'normal' and stock_status != 'normal':
                    continue
            
            medicamento_data = {
                'id': medicamento.id,
                'code': medicamento.clave,
                'name': medicamento.nombre,
                'active_ingredient': medicamento.principio_activo,
                'concentration': medicamento.concentracion,
                'pharmaceutical_form': medicamento.forma_farmaceutica,
                'category': medicamento.categoria,
                'prescription_type': medicamento.tipo_receta_permitido,
                'current_stock': stock.current_stock,
                'reserved_stock': stock.reserved_stock,
                'available_stock': available_stock,
                'minimum_stock': 20,  # Stock mínimo por defecto
                'average_cost': float(stock.average_cost),
                'last_purchase_price': float(stock.last_purchase_price),
                'storage_location': stock.storage_location,
                'storage_conditions': getattr(stock, 'get_storage_conditions_display', lambda: stock.storage_conditions)(),
                'stock_status': stock_status,
                'stock_status_label': stock_status_label,
                'stock_status_class': stock_status_class,
                'is_low_stock': available_stock <= 20,  # Stock mínimo por defecto
                'is_out_of_stock': available_stock == 0,
                'last_updated': getattr(stock, 'updated_at', None),
                'created_stock_record': created
            }
            
            inventory_data.append(medicamento_data)
        
        # Estadísticas del inventario
        total_medicamentos = len(inventory_data)
        medicamentos_en_stock = len([m for m in inventory_data if m['available_stock'] > 0])
        medicamentos_stock_bajo = len([m for m in inventory_data if m['is_low_stock'] and m['available_stock'] > 0])
        medicamentos_agotados = len([m for m in inventory_data if m['is_out_of_stock']])
        
        response_data = {
            'medicamentos': inventory_data,
            'estadisticas': {
                'total_medicamentos': total_medicamentos,
                'medicamentos_en_stock': medicamentos_en_stock,
                'medicamentos_stock_bajo': medicamentos_stock_bajo,
                'medicamentos_agotados': medicamentos_agotados,
            },
            'filtros_aplicados': {
                'search': search,
                'categoria': categoria,
                'stock_filter': stock_filter,
            }
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': f'Error al cargar inventario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decrease_stock(request, medicamento_id):
    """
    Disminuye el stock de un medicamento (usado al dispensar recetas).
    """
    try:
        with transaction.atomic():
            medicamento = CatalogoMedicamentos.objects.get(id=medicamento_id, activo=True)
            
            # Obtener el registro de stock
            stock = MedicamentoStock.objects.filter(medicamento_catalogo=medicamento).first()
            
            if not stock:
                return Response(
                    {'error': 'No se encontró registro de stock para este medicamento'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener cantidad a disminuir
            cantidad = int(request.data.get('cantidad', 0))
            if cantidad <= 0:
                return Response(
                    {'error': 'La cantidad debe ser mayor a 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar que hay suficiente stock disponible
            available_stock = max(0, stock.current_stock - stock.reserved_stock)
            if cantidad > available_stock:
                return Response(
                    {
                        'error': f'Stock insuficiente. Disponible: {available_stock}, Solicitado: {cantidad}',
                        'available_stock': available_stock,
                        'requested_amount': cantidad
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Disminuir el stock
            stock.current_stock = max(0, stock.current_stock - cantidad)
            stock.save()
            
            # Calcular nuevo stock disponible
            new_available_stock = max(0, stock.current_stock - stock.reserved_stock)
            
            response_data = {
                'id': medicamento.id,
                'code': medicamento.clave,
                'name': medicamento.nombre,
                'cantidad_dispensada': cantidad,
                'stock_anterior': stock.current_stock + cantidad,
                'stock_actual': stock.current_stock,
                'stock_disponible': new_available_stock,
                'stock_minimo': 20,  # Stock mínimo por defecto
                'is_low_stock': new_available_stock <= 20,  # Stock mínimo por defecto
                'is_out_of_stock': new_available_stock == 0,
                'updated_at': stock.updated_at.isoformat()
            }
            
            return Response(response_data)
            
    except CatalogoMedicamentos.DoesNotExist:
        return Response(
            {'error': 'Medicamento no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError:
        return Response(
            {'error': 'Cantidad inválida'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Error al disminuir stock: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
