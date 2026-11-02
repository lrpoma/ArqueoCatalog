import django_filters

from .models import Pieza


class PiezaFilter(django_filters.FilterSet):
    yacimiento = django_filters.NumberFilter(field_name="capa__yacimiento")

    class Meta:
        model = Pieza
        fields = ("periodo_cultural", "tipo_pieza", "etiqueta", "capa", "yacimiento", "publica")
