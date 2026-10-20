from rest_framework import serializers

from . import fotos
from .models import Fotografia, HistorialPieza, Pieza


class FotografiaSerializer(serializers.ModelSerializer):
    archivo = serializers.ImageField(write_only=True, validators=[fotos.validar_imagen])
    url = serializers.SerializerMethodField()
    url_miniatura = serializers.SerializerMethodField()

    class Meta:
        model = Fotografia
        fields = ("id", "archivo", "url", "url_miniatura", "principal")
        read_only_fields = ("principal",)

    def get_url(self, foto):
        return f"/api/v1/media/{foto.id}/"

    def get_url_miniatura(self, foto):
        return f"/api/v1/media/{foto.id}/?miniatura=1"

    def create(self, datos):
        original, miniatura = fotos.procesar_imagen(datos["archivo"])
        pieza = datos["pieza"]
        return Fotografia.objects.create(
            pieza=pieza,
            archivo=original,
            miniatura=miniatura,
            principal=not pieza.fotografias.exists(),
        )


class PiezaSerializer(serializers.ModelSerializer):
    yacimiento = serializers.IntegerField(source="capa.yacimiento_id", read_only=True)
    yacimiento_nombre = serializers.CharField(source="capa.yacimiento.nombre", read_only=True)
    capa_codigo = serializers.CharField(source="capa.codigo", read_only=True)
    fotografias = FotografiaSerializer(many=True, read_only=True)

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
            "publica",
            "fotografias",
            "activo",
            "usuario_registro",
            "fecha_registro",
        )
        read_only_fields = ("codigo", "activo", "usuario_registro", "fecha_registro")

    def validate_capa(self, capa):
        if not (capa.activo and capa.yacimiento.activo):
            raise serializers.ValidationError("La capa no está disponible.")
        return capa


class HistorialPiezaSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(source="usuario.username", default=None, read_only=True)

    class Meta:
        model = HistorialPieza
        fields = ("id", "campo_modificado", "valor_anterior", "valor_nuevo", "usuario", "fecha")
