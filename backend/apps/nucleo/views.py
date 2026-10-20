from django.conf import settings
from django.db import connection
from django.http import FileResponse, Http404, JsonResponse


def health(request):
    """Estado del servicio, incluida la conexión a la base de datos."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"estado": "ok"})


def descargar_apk(request):
    """Instalador de la app para la demo. El .apk se copia a APK_PATH (volumen), no va al repo."""
    ruta = settings.APK_PATH
    if not ruta.is_file():
        raise Http404
    return FileResponse(
        ruta.open("rb"),
        as_attachment=True,
        filename="arqueocatalog.apk",
        content_type="application/vnd.android.package-archive",
    )
