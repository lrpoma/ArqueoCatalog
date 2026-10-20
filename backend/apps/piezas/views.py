import io

import qrcode
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.urls import reverse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.nucleo.vistas_base import EliminacionLogicaMixin, RegistraUsuarioMixin

from .filters import PiezaFilter
from .models import Fotografia, Pieza
from .serializers import FotografiaSerializer, HistorialPiezaSerializer, PiezaSerializer


class PiezaViewSet(RegistraUsuarioMixin, EliminacionLogicaMixin, viewsets.ModelViewSet):
    serializer_class = PiezaSerializer
    filterset_class = PiezaFilter
    search_fields = ("codigo", "nombre", "descripcion", "material")

    def get_queryset(self):
        return (
            Pieza.objects.filter(activo=True)
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
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
        filterset_class=None,
        search_fields=(),
    )
    def fotos(self, request, pk=None):
        """Sube una foto: se valida, se le quita el EXIF y se genera su miniatura."""
        serializer = FotografiaSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(pieza=self.get_object())
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], filterset_class=None, search_fields=())
    def qr(self, request, pk=None):
        """PNG del QR que apunta a la ficha pública de la pieza."""
        pieza = self.get_object()
        ruta = reverse("ficha-publica", kwargs={"codigo": pieza.codigo})
        base = getattr(settings, "URL_PUBLICA", "").rstrip("/")
        destino = f"{base}{ruta}" if base else request.build_absolute_uri(ruta)
        buffer = io.BytesIO()
        qrcode.make(destino, box_size=10, border=2).save(buffer, format="PNG")
        return HttpResponse(buffer.getvalue(), content_type="image/png")


def media(request, foto_id):
    """Sirve una foto. Personal autenticado: siempre; anónimo: solo de piezas públicas y activas."""
    foto = Fotografia.objects.select_related("pieza").filter(pk=foto_id).first()
    if foto is None:
        raise Http404
    if not _puede_ver(request, foto.pieza):
        raise Http404
    archivo = foto.miniatura if request.GET.get("miniatura") and foto.miniatura else foto.archivo
    return FileResponse(archivo.open("rb"))


def _puede_ver(request, pieza):
    try:
        autenticado = JWTAuthentication().authenticate(request)
    except Exception:
        autenticado = None
    if autenticado:
        return pieza.activo
    return pieza.publica and pieza.activo
