from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.nucleo.negociacion import IgnorarAccept
from apps.nucleo.permisos import ROLES_DE_CAMPO

from .models import Fotografia
from .views_publicas import FichaPublicaThrottle


class MediaFoto(APIView):
    """Entrega la imagen solo si el solicitante puede verla.

    Personal autenticado: cualquier foto de una pieza activa. Anónimo (ficha pública):
    solo si la pieza es pública. En cualquier otro caso responde 404, sin revelar nada.
    """

    permission_classes = [AllowAny]
    throttle_classes = [FichaPublicaThrottle]  # solo limita a anónimos
    content_negotiation_class = IgnorarAccept

    def get(self, request, foto_id):
        foto = get_object_or_404(
            Fotografia.objects.select_related("pieza"),
            pk=foto_id,
            pieza__activo=True,
            pieza__capa__activo=True,
            pieza__capa__yacimiento__activo=True,
        )
        usuario = request.user
        es_personal = (
            usuario.is_authenticated and usuario.is_active and usuario.rol in ROLES_DE_CAMPO
        )
        if not (es_personal or foto.pieza.publica):
            raise Http404

        archivo = foto.archivo
        if request.query_params.get("miniatura") == "1" and foto.miniatura:
            archivo = foto.miniatura
        respuesta = FileResponse(archivo.open("rb"), content_type="image/jpeg")
        respuesta["Cache-Control"] = "private, max-age=300"
        return respuesta
