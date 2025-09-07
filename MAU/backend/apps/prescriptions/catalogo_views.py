from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import CatalogoMedicamentos
from .serializers import CatalogoMedicamentosSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_medicamentos(request):
    """
    Busca medicamentos en el catálogo de la base de datos
    Parámetros:
    - q: término de búsqueda
    - tipo_receta: FARMACIA, CMI o AMBOS
    - categoria: categoría del medicamento
    """
    query = request.GET.get('q', '').strip()
    tipo_receta = request.GET.get('tipo_receta', '')
    categoria = request.GET.get('categoria', '')
    
    # Consulta base: solo medicamentos activos
    medicamentos = CatalogoMedicamentos.objects.filter(activo=True)
    
    # Filtrar por búsqueda de texto
    if query:
        medicamentos = medicamentos.filter(
            Q(nombre__icontains=query) |
            Q(clave__icontains=query) |
            Q(principio_activo__icontains=query)
        )
    
    # Filtrar por tipo de receta
    if tipo_receta and tipo_receta in ['FARMACIA', 'CMI']:
        medicamentos = medicamentos.filter(
            Q(tipo_receta_permitido='AMBOS') |
            Q(tipo_receta_permitido=tipo_receta)
        )
    
    # Filtrar por categoría
    if categoria:
        medicamentos = medicamentos.filter(categoria=categoria)
    
    # Limitar resultados para autocompletado
    limit = int(request.GET.get('limit', 20))
    medicamentos = medicamentos[:limit]
    
    # Serializar los resultados
    serializer = CatalogoMedicamentosSerializer(medicamentos, many=True)
    
    return Response({
        'results': serializer.data,
        'count': len(serializer.data)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_medicamento(request, medicamento_id):
    """Obtiene los detalles de un medicamento específico"""
    try:
        medicamento = CatalogoMedicamentos.objects.get(id=medicamento_id, activo=True)
        serializer = CatalogoMedicamentosSerializer(medicamento)
        return Response(serializer.data)
    
    except CatalogoMedicamentos.DoesNotExist:
        return Response(
            {'error': 'Medicamento no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al obtener medicamento: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_categorias(request):
    """Obtiene la lista de categorías disponibles"""
    categorias = [
        {'value': choice[0], 'label': choice[1]}
        for choice in CatalogoMedicamentos.CATEGORIA_CHOICES
    ]
    
    return Response(categorias)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def autocompletar_medicamentos(request):
    """
    Autocompletado rápido para medicamentos
    Retorna solo los campos esenciales para el dropdown
    """
    query = request.GET.get('q', '').strip()
    tipo_receta = request.GET.get('tipo_receta', '')
    
    if len(query) < 2:
        return Response({'results': []})
    
    # Consulta base: solo medicamentos activos
    medicamentos = CatalogoMedicamentos.objects.filter(activo=True)
    
    # Filtrar por búsqueda de texto
    medicamentos = medicamentos.filter(
        Q(nombre__icontains=query) |
        Q(clave__icontains=query) |
        Q(principio_activo__icontains=query)
    )
    
    # Filtrar por tipo de receta
    if tipo_receta and tipo_receta in ['FARMACIA', 'CMI']:
        medicamentos = medicamentos.filter(
            Q(tipo_receta_permitido='AMBOS') |
            Q(tipo_receta_permitido=tipo_receta)
        )
    
    # Limitar a 10 resultados y ordenar por nombre
    medicamentos = medicamentos.order_by('nombre')[:10]
    
    # Retornar solo campos esenciales
    results = []
    for med in medicamentos:
        results.append({
            'id': med.id,
            'clave': med.clave,
            'nombre': med.nombre,
            'forma_farmaceutica': med.forma_farmaceutica,
            'concentracion': med.concentracion,
            'dosis_sugerida': med.dosis_sugerida,
            'categoria': med.categoria
        })
    
    return Response({'results': results})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_medicamento(request):
    """Permite agregar un nuevo medicamento al catálogo"""
    serializer = CatalogoMedicamentosSerializer(data=request.data)
    
    if serializer.is_valid():
        # Verificar que la clave no exista
        clave = serializer.validated_data['clave']
        if CatalogoMedicamentos.objects.filter(clave=clave).exists():
            return Response(
                {'error': f'Ya existe un medicamento con la clave {clave}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        medicamento = serializer.save()
        return Response(
            CatalogoMedicamentosSerializer(medicamento).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_medicamento(request, medicamento_id):
    """Permite actualizar un medicamento existente"""
    try:
        medicamento = CatalogoMedicamentos.objects.get(id=medicamento_id)
        serializer = CatalogoMedicamentosSerializer(medicamento, data=request.data, partial=True)
        
        if serializer.is_valid():
            medicamento = serializer.save()
            return Response(CatalogoMedicamentosSerializer(medicamento).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except CatalogoMedicamentos.DoesNotExist:
        return Response(
            {'error': 'Medicamento no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_medicamento(request, medicamento_id):
    """Marca un medicamento como inactivo (soft delete)"""
    try:
        medicamento = CatalogoMedicamentos.objects.get(id=medicamento_id)
        medicamento.activo = False
        medicamento.save()
        
        return Response(
            {'message': f'Medicamento {medicamento.nombre} marcado como inactivo'},
            status=status.HTTP_200_OK
        )
    
    except CatalogoMedicamentos.DoesNotExist:
        return Response(
            {'error': 'Medicamento no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_todos_medicamentos(request):
    """Lista todos los medicamentos del catálogo con paginación"""
    activos_solo = request.GET.get('activos_solo', 'true').lower() == 'true'
    
    medicamentos = CatalogoMedicamentos.objects.all()
    
    if activos_solo:
        medicamentos = medicamentos.filter(activo=True)
    
    medicamentos = medicamentos.order_by('categoria', 'nombre')
    
    serializer = CatalogoMedicamentosSerializer(medicamentos, many=True)
    
    return Response({
        'results': serializer.data,
        'count': len(serializer.data)
    })