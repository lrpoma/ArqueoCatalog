from rest_framework import serializers

from .models import Etiqueta, PeriodoCultural, TipoPieza


class PeriodoCulturalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoCultural
        fields = ("id", "nombre", "anio_inicio", "anio_fin")


class TipoPiezaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPieza
        fields = ("id", "nombre", "descripcion")


class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ("id", "nombre")
