from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.nucleo.permisos import SoloLectura

from .models import Etiqueta, PeriodoCultural, TipoPieza
from .serializers import EtiquetaSerializer, PeriodoCulturalSerializer, TipoPiezaSerializer


class CatalogoViewSet(ReadOnlyModelViewSet):
    """Listas pequeñas para los selectores de la app: sin paginar, solo lectura."""

    permission_classes = [SoloLectura]
    pagination_class = None


class PeriodoViewSet(CatalogoViewSet):
    queryset = PeriodoCultural.objects.all()
    serializer_class = PeriodoCulturalSerializer


class TipoPiezaViewSet(CatalogoViewSet):
    queryset = TipoPieza.objects.all()
    serializer_class = TipoPiezaSerializer


class EtiquetaViewSet(CatalogoViewSet):
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
