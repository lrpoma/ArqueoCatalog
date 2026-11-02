import django_filters

from .models import Yacimiento


class YacimientoFilter(django_filters.FilterSet):
    class Meta:
        model = Yacimiento
        fields = ("periodo_cultural", "estado")
