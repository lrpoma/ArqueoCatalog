from django.urls import reverse
from rest_framework import serializers

from .models import Fotografia, HistorialPieza, Pieza


class PiezaSerializer(serializers.ModelSerializer):
    yacimiento = serializers.IntegerField(source="capa.yacimiento_id", read_only=True)
    yacimiento_nombre = serializers.CharField(source="capa.yacimiento.nombre", read_only=True)
    capa_codigo = serializers.CharField(source="capa.codigo", read_only=True)
    foto_principal = serializers.SerializerMethodField()

    class Meta:
        model = Pieza
        fields = (
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "tipo_pieza",
            "material",
            "periodo_cultural",
            "etiqueta",
            "capa",
            "capa_codigo",
            "yacimiento",
            "yacimiento_nombre",
            "foto_principal",
            "publica",
            "activo",
            "usuario_registro",
            "fecha_registro",
        )
        read_only_fields = ("codigo", "activo", "usuario_registro", "fecha_registro")

    def get_foto_principal(self, pieza):
        """Id de la foto principal (o la primera); la app arma la URL con /media/{id}/."""
        fotos = list(pieza.fotografias.all())  # prefetch en la vista: sin consultas extra
        elegida = next((f for f in fotos if f.principal), fotos[0] if fotos else None)
        return elegida.id if elegida else None

    def validate_capa(self, capa):
        if not (capa.activo and capa.yacimiento.activo):
            raise serializers.ValidationError("La capa no está disponible.")
        return capa


class HistorialPiezaSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(source="usuario.username", default=None, read_only=True)

    class Meta:
        model = HistorialPieza
        fields = ("id", "campo_modificado", "valor_anterior", "valor_nuevo", "usuario", "fecha")


class FotografiaSerializer(serializers.ModelSerializer):
    """`archivo` solo se escribe; se lee por `url`, que pasa por el control de visibilidad."""

    archivo = serializers.FileField(write_only=True)
    url = serializers.SerializerMethodField()
    miniatura_url = serializers.SerializerMethodField()

    class Meta:
        model = Fotografia
        fields = ("id", "pieza", "principal", "archivo", "url", "miniatura_url")
        read_only_fields = ("pieza", "principal")

    def _ruta(self, foto, miniatura=False):
        ruta = reverse("media-foto", args=[foto.id])
        if miniatura:
            ruta += "?miniatura=1"
        return self.context["request"].build_absolute_uri(ruta)

    def get_url(self, foto):
        return self._ruta(foto)

    def get_miniatura_url(self, foto):
        return self._ruta(foto, miniatura=True)
