from io import BytesIO

import qrcode
from django.db import transaction
from django.http import HttpResponse
from django.urls import reverse
from qrcode.constants import ERROR_CORRECT_M
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from apps.nucleo.negociacion import IgnorarAccept
from apps.nucleo.vistas_base import EliminacionLogicaMixin, RegistraUsuarioMixin

from .filters import PiezaFilter
from .imagenes import procesar_fotografia
from .models import Fotografia, Pieza
from .serializers import FotografiaSerializer, HistorialPiezaSerializer, PiezaSerializer


class PiezaViewSet(RegistraUsuarioMixin, EliminacionLogicaMixin, viewsets.ModelViewSet):
    serializer_class = PiezaSerializer
    filterset_class = PiezaFilter
    search_fields = ("codigo", "nombre", "descripcion", "material")

    def get_queryset(self):
        return (
            Pieza.objects.visibles()
            .select_related("tipo_pieza", "periodo_cultural", "etiqueta", "capa__yacimiento")
            .prefetch_related("fotografias")
        )

    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

    @action(detail=True, methods=["get"], filterset_class=None, search_fields=())
    def historial(self, request, pk=None):
        """Cambios de la pieza, solo lectura. Lo llenan las señales, nunca esta vista."""
        cambios = self.get_object().historial.select_related("usuario")
        pagina = self.paginate_queryset(cambios)
        return self.get_paginated_response(HistorialPiezaSerializer(pagina, many=True).data)

    @action(
        detail=True,
        methods=["get", "post"],
        parser_classes=[MultiPartParser],
        filterset_class=None,
        search_fields=(),
    )
    def fotos(self, request, pk=None):
        """GET lista las fotos de la pieza; POST sube una (multipart, campo `archivo`)."""
        pieza = self.get_object()
        if request.method == "GET":
            fotos = pieza.fotografias.order_by("-principal", "id")
            datos = FotografiaSerializer(fotos, many=True, context={"request": request}).data
            return Response(datos)

        serializador = FotografiaSerializer(data=request.data, context={"request": request})
        serializador.is_valid(raise_exception=True)
        foto, miniatura = procesar_fotografia(serializador.validated_data["archivo"])
        with transaction.atomic():
            # La primera foto de la pieza queda como principal.
            es_primera = not pieza.fotografias.select_for_update().exists()
            creada = Fotografia.objects.create(
                pieza=pieza, archivo=foto, miniatura=miniatura, principal=es_primera
            )
        datos = FotografiaSerializer(creada, context={"request": request}).data
        return Response(datos, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["get"],
        content_negotiation_class=IgnorarAccept,
        filterset_class=None,
        search_fields=(),
    )
    def qr(self, request, pk=None):
        """PNG con el QR que apunta a la ficha pública de la pieza."""
        pieza = self.get_object()
        url = request.build_absolute_uri(reverse("ficha-publica", args=[pieza.codigo]))
        imagen = qrcode.make(url, error_correction=ERROR_CORRECT_M, box_size=10, border=2)
        salida = BytesIO()
        imagen.save(salida)
        return HttpResponse(salida.getvalue(), content_type="image/png")
