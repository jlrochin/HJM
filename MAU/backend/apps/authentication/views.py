from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, LoginSerializer, UserCreateSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Endpoint para autenticación de usuarios con validación reCAPTCHA"""
    serializer = LoginSerializer(data=request.data, request=request)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Endpoint para renovar el token de acceso"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Token de renovación requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Token de renovación inválido'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Endpoint para obtener el perfil del usuario actual"""
    return Response(UserSerializer(request.user).data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Endpoint para actualizar el perfil del usuario actual"""
    serializer = UserSerializer(
        request.user,
        data=request.data,
        partial=request.method == 'PATCH'
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear usuarios (solo para admins)"""
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserCreateSerializer
    
    def get_queryset(self):
        # Solo admins pueden ver todos los usuarios
        try:
            if hasattr(self.request.user, 'role'):
                user_role = self.request.user.role
            else:
                # Para TokenUser de JWT, obtener el usuario real
                user = User.objects.get(id=self.request.user.id)
                user_role = user.role
        except:
            return User.objects.filter(id=self.request.user.id)
        
        if user_role == 'ADMIN':
            return User.objects.all()
        # Otros usuarios solo ven su propio perfil
        return User.objects.filter(id=self.request.user.id)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para ver, actualizar y eliminar usuarios específicos"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo admins pueden acceder a cualquier usuario
        try:
            if hasattr(self.request.user, 'role'):
                user_role = self.request.user.role
            else:
                # Para TokenUser de JWT, obtener el usuario real
                user = User.objects.get(id=self.request.user.id)
                user_role = user.role
        except:
            return User.objects.filter(id=self.request.user.id)
        
        if user_role == 'ADMIN':
            return User.objects.all()
        # Otros usuarios solo pueden acceder a su propio perfil
        return User.objects.filter(id=self.request.user.id)
