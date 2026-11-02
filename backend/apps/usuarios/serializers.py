from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Institucion, Usuario


class InstitucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = ("id", "nombre", "tipo", "ciudad")


class UsuarioSerializer(serializers.ModelSerializer):
    institucion = InstitucionSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ("id", "username", "first_name", "last_name", "email", "rol", "institucion")


class LoginSerializer(TokenObtainPairSerializer):
    """Devuelve los tokens junto con el perfil del usuario."""

    def validate(self, attrs):
        datos = super().validate(attrs)
        datos["usuario"] = UsuarioSerializer(self.user).data
        return datos
