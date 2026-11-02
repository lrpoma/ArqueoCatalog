from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from apps.nucleo.vistas_base import EliminacionLogicaMixin, RegistraUsuarioMixin

from .filters import YacimientoFilter
from .models import CapaEstratigrafica, Yacimiento
from .serializers import CapaSerializer, YacimientoSerializer


class YacimientoViewSet(RegistraUsuarioMixin, EliminacionLogicaMixin, viewsets.ModelViewSet):
    serializer_class = YacimientoSerializer
    filterset_class = YacimientoFilter
    search_fields = ("nombre", "descripcion")

    def get_queryset(self):
        return Yacimiento.objects.filter(activo=True).select_related(
            "periodo_cultural", "investigador_responsable"
        )

    def perform_create(self, serializer):
        serializer.save(investigador_responsable=self.request.user)


class CapaViewSet(RegistraUsuarioMixin, EliminacionLogicaMixin, viewsets.ModelViewSet):
    """Capas de un yacimiento activo: /yacimientos/{yacimiento_pk}/capas/."""

    serializer_class = CapaSerializer
    search_fields = ("codigo", "descripcion")

    def get_yacimiento(self):
        return get_object_or_404(Yacimiento, pk=self.kwargs["yacimiento_pk"], activo=True)

    def get_queryset(self):
        return CapaEstratigrafica.objects.filter(
            yacimiento=self.get_yacimiento(), activo=True
        ).order_by("profundidad_desde", "codigo")

    def get_serializer_context(self):
        contexto = super().get_serializer_context()
        contexto["yacimiento"] = self.get_yacimiento()
        return contexto

    def perform_create(self, serializer):
        serializer.save(yacimiento=self.get_yacimiento())
