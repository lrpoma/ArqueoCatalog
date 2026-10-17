from rest_framework import viewsets
from rest_framework.decorators import action

from apps.nucleo.vistas_base import EliminacionLogicaMixin, RegistraUsuarioMixin

from .filters import PiezaFilter
from .models import Pieza
from .serializers import HistorialPiezaSerializer, PiezaSerializer


class PiezaViewSet(RegistraUsuarioMixin, EliminacionLogicaMixin, viewsets.ModelViewSet):
    serializer_class = PiezaSerializer
    filterset_class = PiezaFilter
    search_fields = ("codigo", "nombre", "descripcion", "material")

    def get_queryset(self):
        return Pieza.objects.filter(activo=True).select_related(
            "tipo_pieza", "periodo_cultural", "etiqueta", "capa__yacimiento"
        )

    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

    @action(detail=True, methods=["get"], filterset_class=None, search_fields=())
    def historial(self, request, pk=None):
        """Cambios de la pieza, solo lectura. Lo llenan las señales, nunca esta vista."""
        cambios = self.get_object().historial.select_related("usuario")
        pagina = self.paginate_queryset(cambios)
        return self.get_paginated_response(HistorialPiezaSerializer(pagina, many=True).data)
