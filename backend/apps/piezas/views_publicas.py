from django.http import Http404
from rest_framework.permissions import AllowAny
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import Pieza


class FichaPublicaThrottle(AnonRateThrottle):
    scope = "ficha_publica"


class FichaPublica(APIView):
    """Destino del QR. 200 si es pública y activa; 403 sin datos si no; 404 si no existe."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [FichaPublicaThrottle]
    renderer_classes = [TemplateHTMLRenderer]

    def get(self, request, codigo):
        pieza = (
            Pieza.objects.select_related(
                "tipo_pieza", "periodo_cultural", "etiqueta", "capa__yacimiento"
            )
            .filter(codigo=codigo)
            .first()
        )
        if pieza is None:
            raise Http404
        if not (pieza.publica and pieza.activo):
            return Response(template_name="piezas/ficha_restringida.html", status=403)
        return Response({"pieza": pieza}, template_name="piezas/ficha_publica.html")
