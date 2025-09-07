from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Paciente, CIE10Mexico, PacienteCIE10
from .serializers import (
    PacienteSerializer, PacienteBusquedaSerializer,
    PacienteCreateSerializer, PacienteUpdateSerializer, PacienteDetailSerializer,
    CIE10MexicoSerializer, CIE10MexicoBusquedaSerializer,
    PacienteCIE10Serializer, PacienteCIE10CreateSerializer
)

class PacienteListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear pacientes"""
    
    queryset = Paciente.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['genero', 'tipo_sangre', 'institucion_seguro']
    search_fields = ['expediente', 'nombre', 'apellido_paterno', 'apellido_materno', 'curp']
    ordering_fields = ['expediente', 'apellido_paterno', 'fecha_nacimiento', 'created_at']
    ordering = ['apellido_paterno', 'apellido_materno', 'nombre']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PacienteCreateSerializer
        elif self.request.GET.get('simple') == 'true':
            return PacienteBusquedaSerializer
        return PacienteSerializer
    
    def get_queryset(self):
        """Filtros adicionales para búsqueda"""
        queryset = super().get_queryset()
        
        # Búsqueda por expediente específico
        expediente = self.request.query_params.get('expediente')
        if expediente:
            queryset = queryset.filter(expediente__icontains=expediente)
        
        # Búsqueda por CURP específica
        curp = self.request.query_params.get('curp')
        if curp:
            queryset = queryset.filter(curp__icontains=curp)
        
        # Búsqueda por rango de edad
        edad_min = self.request.query_params.get('edad_min')
        edad_max = self.request.query_params.get('edad_max')
        if edad_min or edad_max:
            from datetime import date, timedelta
            today = date.today()
            
            if edad_min:
                fecha_max = today - timedelta(days=int(edad_min) * 365)
                queryset = queryset.filter(fecha_nacimiento__lte=fecha_max)
            
            if edad_max:
                fecha_min = today - timedelta(days=(int(edad_max) + 1) * 365)
                queryset = queryset.filter(fecha_nacimiento__gte=fecha_min)
        
        return queryset
    
    def perform_create(self, serializer):
        """Solo usuarios con rol 'ATENCION_USUARIO' pueden crear pacientes"""
        if not self.request.user.can_create_patients():
            raise PermissionError("No tiene permisos para crear pacientes")
        
        serializer.save()

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para ver, actualizar y eliminar pacientes específicos"""
    
    queryset = Paciente.objects.all()
    lookup_field = 'expediente'
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PacienteUpdateSerializer
        return PacienteSerializer
    
    def perform_update(self, serializer):
        """Solo usuarios con rol 'ATENCION_USUARIO' pueden editar pacientes"""
        if not self.request.user.can_edit_patients():
            raise PermissionError("No tiene permisos para editar pacientes")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Eliminación lógica (marcar como inactivo)"""
        if not self.request.user.can_edit_patients():
            raise PermissionError("No tiene permisos para eliminar pacientes")
        
        instance.is_active = False
        instance.updated_by = self.request.user
        instance.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_paciente(request):
    """Endpoint especializado para búsqueda rápida de pacientes"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response({
            'error': 'Parámetro de búsqueda requerido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Buscar por expediente, CURP o nombre
    pacientes = Paciente.objects.filter(
        Q(expediente__icontains=query) |
        Q(curp__icontains=query) |
        Q(nombre__icontains=query) |
        Q(apellido_paterno__icontains=query) |
        Q(apellido_materno__icontains=query),
        is_active=True
    ).order_by('apellido_paterno', 'apellido_materno', 'nombre')[:10]
    
    serializer = PacienteBusquedaSerializer(pacientes, many=True)
    
    return Response({
        'results': serializer.data,
        'total': pacientes.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_duplicados(request):
    """Endpoint para verificar si existen duplicados antes de crear un paciente"""
    expediente = request.GET.get('expediente', '').strip().upper()
    curp = request.GET.get('curp', '').strip().upper()
    
    if not expediente and not curp:
        return Response({
            'error': 'Se requiere expediente o CURP para verificar'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    duplicados = []
    
    if expediente:
        paciente_expediente = Paciente.objects.filter(expediente=expediente).first()
        if paciente_expediente:
            duplicados.append({
                'tipo': 'expediente',
                'campo': 'expediente',
                'valor': expediente,
                'paciente': PacienteBusquedaSerializer(paciente_expediente).data
            })
    
    if curp:
        paciente_curp = Paciente.objects.filter(curp=curp).first()
        if paciente_curp:
            duplicados.append({
                'tipo': 'curp',
                'campo': 'curp',
                'valor': curp,
                'paciente': PacienteBusquedaSerializer(paciente_curp).data
            })
    
    return Response({
        'duplicados_encontrados': len(duplicados) > 0,
        'duplicados': duplicados
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def paciente_historial(request, expediente):
    """Endpoint para obtener el historial completo de un paciente"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Información del paciente
    paciente_data = PacienteSerializer(paciente).data
    
    # Historial de recetas
    from apps.prescriptions.serializers import RecetaListSerializer
    recetas = paciente.recetas.all().order_by('-fecha_creacion')
    recetas_data = RecetaListSerializer(recetas, many=True).data
    
    return Response({
        'paciente': paciente_data,
        'recetas': recetas_data,
        'total_recetas': recetas.count(),
        'recetas_pendientes': recetas.filter(estado='PENDIENTE').count(),
        'recetas_validadas': recetas.filter(estado='VALIDADA').count(),
        'recetas_surtidas': recetas.filter(estado='SURTIDA').count()
    })


class CIE10MexicoListView(generics.ListAPIView):
    """Vista para listar códigos CIE-10 México"""
    
    queryset = CIE10Mexico.objects.filter(activo=True)
    serializer_class = CIE10MexicoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['capitulo', 'categoria', 'tipo', 'genero_aplicable']
    search_fields = ['codigo', 'descripcion', 'descripcion_corta']
    ordering_fields = ['codigo', 'capitulo', 'categoria']
    ordering = ['codigo']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_cie10(request):
    """Búsqueda simple de códigos CIE-10 por código o nombre"""
    try:
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response({
                'error': 'Parámetro de búsqueda requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Búsqueda por código primero (más específica)
        codigos_por_codigo = CIE10Mexico.objects.filter(
            codigo__icontains=query,
            activo=True
        ).order_by('codigo')[:10]
        
        # Búsqueda por nombre/descripción
        codigos_por_nombre = CIE10Mexico.objects.filter(
            descripcion__icontains=query,
            activo=True
        ).exclude(codigo__in=[c.codigo for c in codigos_por_codigo]).order_by('codigo')[:10]
        
        # Combinar resultados
        todos_codigos = list(codigos_por_codigo) + list(codigos_por_nombre)
        
        # Serializar
        serializer = CIE10MexicoBusquedaSerializer(todos_codigos, many=True)
        
        return Response({
            'results': serializer.data,
            'total': len(todos_codigos),
            'por_codigo': len(codigos_por_codigo),
            'por_nombre': len(codigos_por_nombre),
            'query': query,
            'mensaje': f'Encontrados {len(todos_codigos)} códigos CIE-10 para "{query}"'
        })
        
    except Exception as e:
        # Error en buscar_cie10
        return Response({
            'error': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_cie10_completo(request, codigo):
    """Endpoint para obtener información completa de un código CIE-10 específico"""
    try:
        cie10 = CIE10Mexico.objects.get(codigo=codigo, activo=True)
        serializer = CIE10MexicoSerializer(cie10)
        return Response(serializer.data)
    except CIE10Mexico.DoesNotExist:
        return Response({
            'error': f'Código CIE-10 {codigo} no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cie10_para_paciente(request, expediente):
    """Endpoint para obtener códigos CIE-10 aplicables a un paciente específico"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Filtrar códigos aplicables para el paciente
    codigos_aplicables = []
    todos_codigos = CIE10Mexico.objects.filter(activo=True)
    
    for codigo in todos_codigos:
        if codigo.is_aplicable_for_patient(paciente):
            codigos_aplicables.append(codigo)
    
    serializer = CIE10MexicoBusquedaSerializer(codigos_aplicables, many=True)
    
    return Response({
        'paciente': PacienteBusquedaSerializer(paciente).data,
        'codigos_aplicables': serializer.data,
        'total': len(codigos_aplicables)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_cie10(request):
    """Endpoint para obtener estadísticas del catálogo CIE-10"""
    total_codigos = CIE10Mexico.objects.filter(activo=True).count()
    
    # Estadísticas por capítulo
    capitulos = CIE10Mexico.objects.filter(activo=True).values('capitulo').distinct()
    stats_capitulos = []
    
    for cap in capitulos:
        capitulo = cap['capitulo']
        count = CIE10Mexico.objects.filter(capitulo=capitulo, activo=True).count()
        stats_capitulos.append({
            'capitulo': capitulo,
            'total_codigos': count
        })
    
    # Estadísticas por tipo
    tipos = CIE10Mexico.objects.filter(activo=True).values('tipo').distinct()
    stats_tipos = []
    
    for tipo in tipos:
        tipo_codigo = tipo['tipo']
        count = CIE10Mexico.objects.filter(tipo=tipo_codigo, activo=True).count()
        stats_tipos.append({
            'tipo': tipo_codigo,
            'total_codigos': count
        })
    
    return Response({
        'total_codigos': total_codigos,
        'estadisticas_capitulos': sorted(stats_capitulos, key=lambda x: x['capitulo']),
        'estadisticas_tipos': stats_tipos,
        'codigos_mortalidad': CIE10Mexico.objects.filter(es_mortalidad=True, activo=True).count(),
        'codigos_morbilidad': CIE10Mexico.objects.filter(es_morbilidad=True, activo=True).count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_pacientes(request):
    """Endpoint para obtener estadísticas generales de pacientes"""
    from datetime import date, timedelta
    from django.db.models import Count, Q
    
    today = date.today()
    
    # Total de pacientes activos
    total_pacientes = Paciente.objects.filter(is_active=True).count()
    
    # Pacientes registrados hoy
    pacientes_hoy = Paciente.objects.filter(
        created_at__date=today,
        is_active=True
    ).count()
    
    # Pacientes con recetas pendientes (esto requiere una relación con recetas)
    try:
        from apps.prescriptions.models import Receta
        pacientes_pendientes = Paciente.objects.filter(
            is_active=True,
            recetas__estado='PENDIENTE'
        ).distinct().count()
    except:
        # Si no hay modelo de recetas, usar un valor por defecto
        pacientes_pendientes = 0
    
    # Estadísticas por género
    stats_genero = Paciente.objects.filter(is_active=True).values('genero').annotate(
        count=Count('genero')
    )
    
    # Estadísticas por tipo de sangre
    stats_tipo_sangre = Paciente.objects.filter(is_active=True).values('tipo_sangre').annotate(
        count=Count('tipo_sangre')
    )
    
    # Pacientes por rango de edad
    edad_ranges = [
        {'min': 0, 'max': 17, 'label': '0-17 años'},
        {'min': 18, 'max': 64, 'label': '18-64 años'},
        {'min': 65, 'max': 120, 'label': '65+ años'}
    ]
    
    stats_edad = []
    for rango in edad_ranges:
        fecha_max = today - timedelta(days=rango['min'] * 365)
        fecha_min = today - timedelta(days=(rango['max'] + 1) * 365)
        
        count = Paciente.objects.filter(
            fecha_nacimiento__lte=fecha_max,
            fecha_nacimiento__gte=fecha_min,
            is_active=True
        ).count()
        
        stats_edad.append({
            'rango': rango['label'],
            'count': count
        })
    
    return Response({
        'total': total_pacientes,
        'nuevosHoy': pacientes_hoy,
        'pendientes': pacientes_pendientes,
        'estadisticas_genero': list(stats_genero),
        'estadisticas_tipo_sangre': list(stats_tipo_sangre),
        'estadisticas_edad': stats_edad,
        'fecha_consulta': today.isoformat()
    })


# Nuevas vistas para gestionar múltiples códigos CIE-10 por paciente

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_cie10_paciente(request, expediente):
    """Endpoint para obtener todos los códigos CIE-10 de un paciente específico"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener todos los códigos CIE-10 del paciente
    cie10_codes = PacienteCIE10.objects.filter(paciente=paciente).order_by('-es_principal', '-fecha_diagnostico')
    
    serializer = PacienteCIE10Serializer(cie10_codes, many=True)
    
    return Response({
        'paciente': PacienteBusquedaSerializer(paciente).data,
        'cie10_codes': serializer.data,
        'total_codigos': cie10_codes.count(),
        'diagnostico_principal': cie10_codes.filter(es_principal=True).first()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_cie10_paciente(request, expediente):
    """Endpoint para agregar un nuevo código CIE-10 a un paciente"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar permisos
    if not request.user.can_edit_patients():
        return Response({
            'error': 'No tiene permisos para editar pacientes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Crear serializer con contexto del paciente
    serializer = PacienteCIE10CreateSerializer(
        data=request.data,
        context={'paciente': paciente}
    )
    
    if serializer.is_valid():
        # Crear el nuevo código CIE-10
        cie10_paciente = serializer.save(paciente=paciente)
        
        # Si este es el diagnóstico principal, desmarcar otros
        if cie10_paciente.es_principal:
            PacienteCIE10.objects.filter(
                paciente=paciente,
                es_principal=True
            ).exclude(id=cie10_paciente.id).update(es_principal=False)
        
        # Actualizar el campo cie10 del paciente con el código principal
        if cie10_paciente.es_principal:
            paciente.cie10 = cie10_paciente.cie10.codigo
            paciente.fecha_diagnostico = cie10_paciente.fecha_diagnostico
            paciente.updated_by = request.user
            paciente.save()
        
        return Response({
            'mensaje': 'Código CIE-10 agregado exitosamente',
            'cie10_paciente': PacienteCIE10Serializer(cie10_paciente).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_cie10_paciente(request, expediente, cie10_id):
    """Endpoint para actualizar un código CIE-10 específico de un paciente"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
        cie10_paciente = PacienteCIE10.objects.get(id=cie10_id, paciente=paciente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except PacienteCIE10.DoesNotExist:
        return Response({
            'error': 'Código CIE-10 no encontrado para este paciente'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar permisos
    if not request.user.can_edit_patients():
        return Response({
            'error': 'No tiene permisos para editar pacientes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Crear serializer con contexto del paciente
    serializer = PacienteCIE10CreateSerializer(
        cie10_paciente,
        data=request.data,
        partial=True,
        context={'paciente': paciente}
    )
    
    if serializer.is_valid():
        # Actualizar el código CIE-10
        cie10_paciente = serializer.save()
        
        # Si este es el diagnóstico principal, desmarcar otros
        if cie10_paciente.es_principal:
            PacienteCIE10.objects.filter(
                paciente=paciente,
                es_principal=True
            ).exclude(id=cie10_paciente.id).update(es_principal=False)
        
        # Actualizar el campo cie10 del paciente con el código principal
        if cie10_paciente.es_principal:
            paciente.cie10 = cie10_paciente.cie10.codigo
            paciente.fecha_diagnostico = cie10_paciente.fecha_diagnostico
            paciente.updated_by = request.user
            paciente.save()
        
        return Response({
            'mensaje': 'Código CIE-10 actualizado exitosamente',
            'cie10_paciente': PacienteCIE10Serializer(cie10_paciente).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_cie10_paciente(request, expediente, cie10_id):
    """Endpoint para eliminar un código CIE-10 específico de un paciente"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
        cie10_paciente = PacienteCIE10.objects.get(id=cie10_id, paciente=paciente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except PacienteCIE10.DoesNotExist:
        return Response({
            'error': 'Código CIE-10 no encontrado para este paciente'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar permisos
    if not request.user.can_edit_patients():
        return Response({
            'error': 'No tiene permisos para editar pacientes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Verificar si es el diagnóstico principal
    era_principal = cie10_paciente.es_principal
    
    # Eliminar el código CIE-10
    cie10_paciente.delete()
    
    # Si era el diagnóstico principal, actualizar el paciente
    if era_principal:
        # Buscar otro diagnóstico para marcar como principal
        nuevo_principal = PacienteCIE10.objects.filter(paciente=paciente).order_by('-fecha_diagnostico').first()
        
        if nuevo_principal:
            nuevo_principal.es_principal = True
            nuevo_principal.save()
            
            # Actualizar el paciente
            paciente.cie10 = nuevo_principal.cie10.codigo
            paciente.fecha_diagnostico = nuevo_principal.fecha_diagnostico
        else:
            # No hay más códigos CIE-10, limpiar campos del paciente
            paciente.cie10 = ''
            paciente.fecha_diagnostico = None
        
        paciente.updated_by = request.user
        paciente.save()
    
    return Response({
        'mensaje': 'Código CIE-10 eliminado exitosamente'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_diagnostico_principal(request, expediente, cie10_id):
    """Endpoint para marcar un código CIE-10 como diagnóstico principal"""
    try:
        paciente = Paciente.objects.get(expediente=expediente)
        cie10_paciente = PacienteCIE10.objects.get(id=cie10_id, paciente=paciente)
    except Paciente.DoesNotExist:
        return Response({
            'error': 'Paciente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except PacienteCIE10.DoesNotExist:
        return Response({
            'error': 'Código CIE-10 no encontrado para este paciente'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar permisos
    if not request.user.can_edit_patients():
        return Response({
            'error': 'No tiene permisos para editar pacientes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Desmarcar todos los otros diagnósticos como principales
    PacienteCIE10.objects.filter(
        paciente=paciente,
        es_principal=True
    ).update(es_principal=False)
    
    # Marcar este como principal
    cie10_paciente.es_principal = True
    cie10_paciente.save()
    
    # Actualizar el paciente
    paciente.cie10 = cie10_paciente.cie10.codigo
    paciente.fecha_diagnostico = cie10_paciente.fecha_diagnostico
    paciente.updated_by = request.user
    paciente.save()
    
    return Response({
        'mensaje': 'Diagnóstico principal actualizado exitosamente',
        'cie10_paciente': PacienteCIE10Serializer(cie10_paciente).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_cie10_pacientes(request):
    """Endpoint para obtener estadísticas de códigos CIE-10 por paciente"""
    from django.db.models import Count, Q
    
    # Total de pacientes con códigos CIE-10
    total_pacientes_cie10 = Paciente.objects.filter(
        is_active=True,
        cie10_codes__isnull=False
    ).distinct().count()
    
    # Estadísticas por tipo de código
    stats_tipo = PacienteCIE10.objects.values(
        'cie10__tipo'
    ).annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Estadísticas por capítulo
    stats_capitulo = PacienteCIE10.objects.values(
        'cie10__capitulo'
    ).annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Códigos más frecuentes
    codigos_frecuentes = PacienteCIE10.objects.values(
        'cie10__codigo',
        'cie10__descripcion_corta'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return Response({
        'total_pacientes_cie10': total_pacientes_cie10,
        'total_codigos_asignados': PacienteCIE10.objects.count(),
        'estadisticas_tipo': list(stats_tipo),
        'estadisticas_capitulo': list(stats_capitulo),
        'codigos_frecuentes': list(codigos_frecuentes)
    })
