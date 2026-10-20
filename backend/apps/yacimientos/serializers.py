from rest_framework import serializers

from .models import CapaEstratigrafica, Yacimiento


class YacimientoSerializer(serializers.ModelSerializer):
    investigador_responsable = serializers.PrimaryKeyRelatedField(read_only=True)
    investigador_nombre = serializers.CharField(
        source="investigador_responsable.username", read_only=True
    )

    class Meta:
        model = Yacimiento
        fields = (
            "id",
            "nombre",
            "descripcion",
            "latitud",
            "longitud",
            "periodo_cultural",
            "estado",
            "investigador_responsable",
            "investigador_nombre",
            "activo",
            "fecha_registro",
        )
        read_only_fields = ("activo", "fecha_registro")


class CapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapaEstratigrafica
        fields = (
            "id",
            "yacimiento",
            "codigo",
            "profundidad_desde",
            "profundidad_hasta",
            "descripcion",
            "activo",
        )
        read_only_fields = ("yacimiento", "activo")

    def validate(self, datos):
        desde = datos.get("profundidad_desde", getattr(self.instance, "profundidad_desde", None))
        hasta = datos.get("profundidad_hasta", getattr(self.instance, "profundidad_hasta", None))
        if desde is not None and hasta is not None and hasta < desde:
            raise serializers.ValidationError(
                {"profundidad_hasta": "Debe ser mayor o igual a la profundidad inicial."}
            )
        yacimiento = self.context["yacimiento"]
        codigo = datos.get("codigo")
        if codigo is not None:
            repetidas = CapaEstratigrafica.objects.filter(yacimiento=yacimiento, codigo=codigo)
            if self.instance:
                repetidas = repetidas.exclude(pk=self.instance.pk)
            if repetidas.exists():
                raise serializers.ValidationError(
                    {"codigo": "Ya existe una capa con este código en el yacimiento."}
                )
        return datos
