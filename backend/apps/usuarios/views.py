from django.contrib.auth.signals import user_logged_in
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import LoginSerializer, UsuarioSerializer


class LoginThrottle(AnonRateThrottle):
    scope = "login"


class Login(TokenObtainPairView):
    """JWT. SimpleJWT no llama a `login()`, así que se emite `user_logged_in` aquí.

    La señal solo se emite con credenciales válidas: los intentos fallidos no se registran.
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_logged_in.send(sender=type(serializer.user), request=request, user=serializer.user)
        return Response(serializer.validated_data)


class PerfilActual(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)
