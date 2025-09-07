from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Receta, DetalleReceta, LoteDetalleReceta, CatalogoMedicamentos
from .serializers import (
    RecetaSerializer, RecetaListSerializer, RecetaCreateSerializer,
    RecetaEstadoSerializer, DetalleRecetaSerializer, DetalleRecetaDispensacionSerializer,
    LoteDetalleRecetaSerializer, LoteDetalleRecetaCreateSerializer
)
from apps.inventory.models import MedicamentoStock

class RecetaListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear recetas"""
    
    queryset = Receta.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'tipo_receta', 'prioridad', 'servicio_solicitante']
    search_fields = ['folio_receta', 'paciente__expediente', 'paciente__nombre', 'diagnostico']
    ordering_fields = ['folio_receta', 'fecha_creacion', 'prioridad']
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecetaCreateSerializer
        return RecetaListSerializer
    
    def get_queryset(self):
        """Filtros específicos según el rol del usuario"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtros según parámetros de URL
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        tipo_receta = self.request.query_params.get('tipo')
        if tipo_receta:
            queryset = queryset.filter(tipo_receta=tipo_receta)
        
        # Filtros según rol de usuario
        if user.role == 'FARMACIA':
            # Solo recetas de farmacia validadas
            queryset = queryset.filter(tipo_receta='FARMACIA', estado='VALIDADA')
        elif user.role == 'CMI':
            # Solo recetas de CMI validadas
            queryset = queryset.filter(tipo_receta='CMI', estado='VALIDADA')
        elif user.role in ['ATENCION_USUARIO', 'ADMIN']:
            # Todas las recetas pendientes para validación
            estado_param = self.request.query_params.get('estado')
            if not estado_param:
                queryset = queryset.filter(estado='PENDIENTE')
        
        return queryset
    
    def perform_create(self, serializer):
        """Solo usuarios autorizados pueden crear recetas"""
        if not self.request.user.can_create_prescriptions():
            raise PermissionError("No tiene permisos para crear recetas")
        
        serializer.save()

class RecetaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para ver, actualizar y eliminar recetas específicas"""
    
    queryset = Receta.objects.all()
    lookup_field = 'folio_receta'
    permission_classes = [IsAuthenticated]
    serializer_class = RecetaSerializer
    
    def perform_destroy(self, instance):
        """Solo admins pueden eliminar recetas"""
        # Obtener el usuario real para acceder al role
        try:
            if hasattr(self.request.user, 'role'):
                user_role = self.request.user.role
            else:
                # Para TokenUser de JWT, obtener el usuario real
                from apps.authentication.models import User
                user = User.objects.get(id=self.request.user.id)
                user_role = user.role
        except:
            raise PermissionError("No tiene permisos para eliminar recetas")
        
        if user_role != 'ADMIN':
            raise PermissionError("No tiene permisos para eliminar recetas")
        
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def actualizar_estado_receta(request, folio_receta):
    """Endpoint para actualizar el estado de una receta"""
    try:
        receta = Receta.objects.get(folio_receta=folio_receta)
    except Receta.DoesNotExist:
        return Response({
            'error': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RecetaEstadoSerializer(
        receta,
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        
        # Responder con la receta actualizada
        receta_serializer = RecetaSerializer(receta)
        return Response(receta_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cola_validacion(request):
    """Endpoint para obtener recetas pendientes de validación"""
    if not request.user.can_validate_prescriptions():
        return Response({
            'error': 'No tiene permisos para validar recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    recetas = Receta.objects.filter(estado='PENDIENTE').order_by('-fecha_creacion')
    
    # Filtros opcionales
    servicio = request.GET.get('servicio')
    if servicio:
        recetas = recetas.filter(servicio_solicitante__icontains=servicio)
    
    prioridad = request.GET.get('prioridad')
    if prioridad:
        recetas = recetas.filter(prioridad=prioridad)
    
    serializer = RecetaListSerializer(recetas, many=True)
    
    return Response({
        'recetas': serializer.data,
        'total': recetas.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cola_dispensacion_farmacia(request):
    """Endpoint para obtener recetas de farmacia listas para dispensar"""
    if not request.user.can_dispense_pharmacy():
        return Response({
            'error': 'No tiene permisos para dispensar medicamentos de farmacia'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Filtro base
    recetas = Receta.objects.filter(
        tipo_receta='FARMACIA',
        estado__in=['VALIDADA', 'PARCIALMENTE_SURTIDA']
    )
    
    # Filtros opcionales
    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        recetas = recetas.filter(
            Q(folio_receta__icontains=search) |
            Q(paciente__expediente__icontains=search) |
            Q(paciente__nombre__icontains=search) |
            Q(paciente__apellido_paterno__icontains=search) |
            Q(paciente__apellido_materno__icontains=search) |
            Q(servicio_solicitante__icontains=search)
        )
    
    prioridad = request.query_params.get('prioridad')
    if prioridad:
        recetas = recetas.filter(prioridad=prioridad)
    
    # Ordenamiento
    sort_by = request.query_params.get('sort_by', 'prioridad')
    if sort_by == 'fecha_validacion':
        recetas = recetas.order_by('fecha_validacion')
    elif sort_by == 'fecha_vencimiento':
        recetas = recetas.order_by('fecha_vencimiento', 'prioridad')
    else:  # prioridad por defecto
        # Orden personalizado por prioridad
        from django.db.models import Case, When, IntegerField
        prioridad_order = Case(
            When(prioridad='URGENTE', then=0),
            When(prioridad='ALTA', then=1),
            When(prioridad='MEDIA', then=2),
            When(prioridad='BAJA', then=3),
            default=4,
            output_field=IntegerField(),
        )
        recetas = recetas.annotate(prioridad_order=prioridad_order).order_by('prioridad_order', 'fecha_validacion')
    
    serializer = RecetaListSerializer(recetas, many=True)
    
    return Response({
        'recetas': serializer.data,
        'total': recetas.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cola_dispensacion_cmi(request):
    """Endpoint para obtener recetas de CMI listas para dispensar"""
    if not request.user.can_dispense_cmi():
        return Response({
            'error': 'No tiene permisos para dispensar mezclas del CMI'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Filtro base
    recetas = Receta.objects.filter(
        tipo_receta='CMI',
        estado__in=['VALIDADA', 'PARCIALMENTE_SURTIDA']
    )
    
    # Filtros opcionales
    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        recetas = recetas.filter(
            Q(folio_receta__icontains=search) |
            Q(paciente__expediente__icontains=search) |
            Q(paciente__nombre__icontains=search) |
            Q(paciente__apellido_paterno__icontains=search) |
            Q(paciente__apellido_materno__icontains=search) |
            Q(servicio_solicitante__icontains=search)
        )
    
    prioridad = request.query_params.get('prioridad')
    if prioridad:
        recetas = recetas.filter(prioridad=prioridad)
    
    # Ordenamiento
    sort_by = request.query_params.get('sort_by', 'prioridad')
    if sort_by == 'fecha_validacion':
        recetas = recetas.order_by('fecha_validacion')
    elif sort_by == 'fecha_vencimiento':
        recetas = recetas.order_by('fecha_vencimiento', 'prioridad')
    else:  # prioridad por defecto
        # Orden personalizado por prioridad
        from django.db.models import Case, When, IntegerField
        prioridad_order = Case(
            When(prioridad='URGENTE', then=0),
            When(prioridad='ALTA', then=1),
            When(prioridad='MEDIA', then=2),
            When(prioridad='BAJA', then=3),
            default=4,
            output_field=IntegerField(),
        )
        recetas = recetas.annotate(prioridad_order=prioridad_order).order_by('prioridad_order', 'fecha_validacion')
    
    serializer = RecetaListSerializer(recetas, many=True)
    
    return Response({
        'recetas': serializer.data,
        'total': recetas.count()
    })

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def detalle_medicamento(request, detalle_id):
    """Endpoint para ver y actualizar detalles de medicamentos"""
    try:
        detalle = DetalleReceta.objects.get(id=detalle_id)
    except DetalleReceta.DoesNotExist:
        return Response({
            'error': 'Detalle de medicamento no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = DetalleRecetaSerializer(detalle)
        return Response(serializer.data)
    
    # Verificar si el medicamento ya está completamente dispensado
    if detalle.is_completely_dispensed():
        return Response({
            'error': 'Este medicamento ya está completamente dispensado y no se puede modificar'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar permisos para actualizar
    receta = detalle.receta
    user = request.user
    
    if receta.tipo_receta == 'FARMACIA' and not user.can_dispense_pharmacy():
        return Response({
            'error': 'No tiene permisos para dispensar medicamentos de farmacia'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if receta.tipo_receta == 'CMI' and not user.can_dispense_cmi():
        return Response({
            'error': 'No tiene permisos para dispensar mezclas del CMI'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = DetalleRecetaDispensacionSerializer(
        detalle,
        data=request.data,
        partial=request.method == 'PATCH'
    )
    
    if serializer.is_valid():
        # Obtener la cantidad anterior antes de guardar
        cantidad_anterior = detalle.cantidad_surtida
        
        serializer.save()
        
        # Calcular la cantidad que se dispensó en esta actualización
        cantidad_actual = detalle.cantidad_surtida
        cantidad_dispensada = cantidad_actual - cantidad_anterior
        
        # Actualizar el inventario si se dispensó alguna cantidad
        if cantidad_dispensada > 0 and detalle.medicamento_catalogo:
            try:
                # Buscar el registro de stock del medicamento
                stock = MedicamentoStock.objects.filter(
                    medicamento_catalogo=detalle.medicamento_catalogo
                ).first()
                
                if stock:
                    # Verificar que hay suficiente stock
                    available_stock = max(0, stock.current_stock - stock.reserved_stock)
                    if cantidad_dispensada <= available_stock:
                        # Descontar del inventario
                        stock.current_stock = max(0, stock.current_stock - cantidad_dispensada)
                        stock.last_movement_date = timezone.now()
                        stock.save()
                        
                        print(f"✅ Descontado del inventario: {cantidad_dispensada} unidades de {detalle.medicamento_catalogo.nombre}")
                    else:
                        print(f"⚠️  Stock insuficiente para {detalle.medicamento_catalogo.nombre}: disponible {available_stock}, solicitado {cantidad_dispensada}")
                else:
                    print(f"⚠️  No se encontró registro de stock para {detalle.medicamento_catalogo.nombre}")
                    
            except Exception as e:
                print(f"❌ Error actualizando inventario: {e}")
                # No fallar la dispensación por errores de inventario
                pass
        
        # Verificar el estado de dispensación de la receta
        receta = detalle.receta
        
        if receta.is_completely_dispensed():
            # Todos los medicamentos están completamente surtidos
            receta.estado = 'SURTIDA'
            receta.fecha_dispensacion = timezone.now()
            receta.dispensado_por = user
            receta.save()
        elif receta.is_partially_dispensed():
            # Algunos medicamentos están surtidos, otros no
            if receta.estado != 'PARCIALMENTE_SURTIDA':
                # Solo actualizar la fecha la primera vez que cambia a parcialmente surtida
                receta.fecha_dispensacion_parcial = timezone.now()
            receta.estado = 'PARCIALMENTE_SURTIDA'
            # No establecer fecha_dispensacion hasta que esté completamente surtida
            if receta.dispensado_por is None:
                receta.dispensado_por = user  # Marcar quién inició la dispensación
            receta.save()
        
        return Response(DetalleRecetaSerializer(detalle).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_recetas(request):
    """Endpoint para obtener estadísticas de recetas"""
    stats = {
        'total_recetas': Receta.objects.count(),
        'pendientes': Receta.objects.filter(estado='PENDIENTE').count(),
        'validadas': Receta.objects.filter(estado='VALIDADA').count(),
        'surtidas': Receta.objects.filter(estado='SURTIDA').count(),
        'canceladas': Receta.objects.filter(estado='CANCELADA').count(),
        'farmacia': Receta.objects.filter(tipo_receta='FARMACIA').count(),
        'cmi': Receta.objects.filter(tipo_receta='CMI').count(),
    }
    
    # Estadísticas por prioridad
    stats['por_prioridad'] = {
        'urgente': Receta.objects.filter(prioridad='URGENTE').count(),
        'alta': Receta.objects.filter(prioridad='ALTA').count(),
        'media': Receta.objects.filter(prioridad='MEDIA').count(),
        'baja': Receta.objects.filter(prioridad='BAJA').count(),
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_lote_medicamento(request, receta_id, detalle_id):
    """
    Agregar un nuevo lote para un medicamento específico
    """
    try:
        # Verificar que la receta existe y puede ser dispensada
        receta = Receta.objects.get(folio_receta=receta_id)
        if not receta.can_be_dispensed():
            return Response(
                {'error': 'La receta no puede ser dispensada en su estado actual'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el detalle existe
        detalle = DetalleReceta.objects.get(id=detalle_id, receta=receta)
        
        # Verificar si el medicamento ya está completamente dispensado
        if detalle.is_completely_dispensed():
            return Response(
                {'error': 'Este medicamento ya está completamente dispensado y no se puede modificar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar permisos según el tipo de receta
        # Obtener el usuario real para acceder al role
        try:
            if hasattr(request.user, 'role'):
                user_role = request.user.role
            else:
                # Para TokenUser de JWT, obtener el usuario real
                from apps.authentication.models import User
                user = User.objects.get(id=request.user.id)
                user_role = user.role
        except:
            user_role = None
        
        # Permitir acceso a ADMIN siempre
        if user_role not in ['ADMIN', 'FARMACIA', 'CMI']:
            return Response(
                {'error': 'No tienes permisos para dispensar medicamentos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar permisos específicos (excepto para ADMIN)
        if user_role != 'ADMIN':
            if receta.tipo_receta == 'FARMACIA' and user_role != 'FARMACIA':
                return Response(
                    {'error': 'No tienes permisos para dispensar medicamentos de farmacia'},
                    status=status.HTTP_403_FORBIDDEN
                )
            elif receta.tipo_receta == 'CMI' and user_role != 'CMI':
                return Response(
                    {'error': 'No tienes permisos para dispensar medicamentos de CMI'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Crear el serializador con contexto
        serializer = LoteDetalleRecetaCreateSerializer(
            data=request.data,
            context={
                'detalle_receta': detalle,
                'request': request
            }
        )
        
        if serializer.is_valid():
            # Usar transacción para asegurar consistencia entre dispensación e inventario
            from django.db import transaction
            from apps.inventory.models import MedicamentoStock
            
            with transaction.atomic():
                # Crear el lote
                lote = serializer.save()
                
                # Actualizar inventario
                try:
                    medicamento_stock = MedicamentoStock.objects.get(
                        medicamento_catalogo=detalle.medicamento
                    )
                    
                    # Reducir stock
                    medicamento_stock.current_stock -= lote.cantidad_dispensada
                    medicamento_stock.last_movement_date = timezone.now()
                    medicamento_stock.save()
                    
                    # Crear registro de movimiento (opcional - para auditoría)
                    # Se podría agregar un modelo de MovimientoInventario específico para MedicamentoStock
                    
                except MedicamentoStock.DoesNotExist:
                    # Si no existe stock, se podría crear uno con stock 0 o manejar el error
                    pass
                
                # Actualizar la cantidad surtida total del medicamento
                total_lotes = detalle.get_total_lotes_dispensados()
                detalle.cantidad_surtida = total_lotes
                detalle.save()
                
                # Actualizar estado de la receta si es necesario
                if receta.is_completely_dispensed():
                    receta.estado = 'SURTIDA'
                    receta.fecha_dispensacion = timezone.now()
                    receta.dispensado_por = request.user
                    receta.save()
                elif receta.is_partially_dispensed():
                    if receta.estado != 'PARCIALMENTE_SURTIDA':
                        receta.fecha_dispensacion_parcial = timezone.now()
                    receta.estado = 'PARCIALMENTE_SURTIDA'
                    if receta.dispensado_por is None:
                        receta.dispensado_por = request.user
                    receta.save()
            
            return Response(LoteDetalleRecetaSerializer(lote).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Receta.DoesNotExist:
        return Response({'error': 'Receta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except DetalleReceta.DoesNotExist:
        return Response({'error': 'Medicamento no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_lotes_medicamento(request, receta_id, detalle_id):
    """
    Obtener todos los lotes de un medicamento específico
    """
    try:
        # Verificar que la receta y detalle existen
        receta = Receta.objects.get(folio_receta=receta_id)
        detalle = DetalleReceta.objects.get(id=detalle_id, receta=receta)
        
        # Obtener todos los lotes del medicamento
        lotes = LoteDetalleReceta.objects.filter(detalle_receta=detalle).order_by('-fecha_dispensacion')
        
        serializer = LoteDetalleRecetaSerializer(lotes, many=True)
        return Response(serializer.data)
        
    except Receta.DoesNotExist:
        return Response({'error': 'Receta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except DetalleReceta.DoesNotExist:
        return Response({'error': 'Medicamento no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recetas_completadas(request):
    """Vista para obtener recetas completadas con filtros por rol de usuario"""
    
    # Obtener el usuario real para acceder al role
    try:
        if hasattr(request.user, 'role'):
            user_role = request.user.role
        else:
            # Para TokenUser de JWT, obtener el usuario real
            from apps.authentication.models import User
            user = User.objects.get(id=request.user.id)
            user_role = user.role
    except:
        return Response({'error': 'No tienes permisos para ver recetas completadas'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filtro base: solo recetas completamente dispensadas
    queryset = Receta.objects.filter(estado='SURTIDA').select_related('paciente', 'prescrito_por', 'validado_por', 'dispensado_por')
    
    # Aplicar filtros según el rol del usuario
    if user_role == 'FARMACIA':
        # Farmacia solo ve sus recetas de tipo FARMACIA
        queryset = queryset.filter(tipo_receta='FARMACIA')
    elif user_role == 'CMI':
        # CMI solo ve sus recetas de tipo CMI
        queryset = queryset.filter(tipo_receta='CMI')
    elif user_role in ['ATENCION_USUARIO', 'ADMIN']:
        # Atención al Usuario y Admin pueden ver todas las recetas completadas
        pass  # No aplicar filtro adicional
    else:
        # Otros roles no tienen acceso
        return Response({'error': 'No tienes permisos para ver recetas completadas'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filtros adicionales por parámetros de query
    paciente_expediente = request.GET.get('expediente')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    tipo_receta = request.GET.get('tipo_receta')
    
    if paciente_expediente:
        queryset = queryset.filter(paciente__expediente__icontains=paciente_expediente)
    
    if fecha_desde:
        queryset = queryset.filter(fecha_dispensacion__date__gte=fecha_desde)
    
    if fecha_hasta:
        queryset = queryset.filter(fecha_dispensacion__date__lte=fecha_hasta)
    
    if tipo_receta and user_role in ['ATENCION_USUARIO', 'ADMIN']:
        # Solo Atención al Usuario y Admin pueden filtrar por tipo
        queryset = queryset.filter(tipo_receta=tipo_receta)
    
    # Ordenar por fecha de dispensación más reciente
    queryset = queryset.order_by('-fecha_dispensacion')
    
    # Serializar los datos
    serializer = RecetaListSerializer(queryset, many=True)
    
    return Response({
        'count': queryset.count(),
        'user_role': user_role,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_stock_medicamento(request, codigo_medicamento):
    """
    Verificar el stock disponible de un medicamento específico
    """
    try:
        # Buscar el stock del medicamento
        stock = MedicamentoStock.objects.filter(
            codigo_medicamento=codigo_medicamento,
            cantidad_disponible__gt=0
        ).first()
        
        if stock:
            return Response({
                'medicamento': stock.nombre_medicamento,
                'codigo': stock.codigo_medicamento,
                'cantidad_disponible': stock.cantidad_disponible,
                'unidad_medida': stock.unidad_medida,
                'lote': stock.lote,
                'fecha_vencimiento': stock.fecha_vencimiento,
                'disponible': True
            })
        else:
            return Response({
                'codigo': codigo_medicamento,
                'cantidad_disponible': 0,
                'disponible': False,
                'mensaje': 'Medicamento no disponible en inventario'
            })
            
    except Exception as e:
        return Response({
            'error': f'Error al verificar stock: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_inventario_disponible(request):
    """
    Obtener lista de todos los medicamentos disponibles en inventario
    """
    try:
        # Obtener todos los medicamentos con stock disponible
        stocks = MedicamentoStock.objects.filter(cantidad_disponible__gt=0).order_by('nombre_medicamento')
        
        inventario = []
        for stock in stocks:
            inventario.append({
                'codigo': stock.codigo_medicamento,
                'nombre': stock.nombre_medicamento,
                'cantidad_disponible': stock.cantidad_disponible,
                'unidad_medida': stock.unidad_medida,
                'lote': stock.lote,
                'fecha_vencimiento': stock.fecha_vencimiento,
                'precio_unitario': stock.precio_unitario
            })
        
        return Response({
            'inventario': inventario,
            'total_items': len(inventario)
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al obtener inventario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)