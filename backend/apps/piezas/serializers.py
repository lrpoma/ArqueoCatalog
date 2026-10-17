from rest_framework import serializers

from .models import HistorialPieza, Pieza


class PiezaSerializer(serializers.ModelSerializer):
    yacimiento = serializers.IntegerField(source="capa.yacimiento_id", read_only=True)
    yacimiento_nombre = serializers.CharField(source="capa.yacimiento.nombre", read_only=True)
    capa_codigo = serializers.CharField(source="capa.codigo", read_only=True)

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
