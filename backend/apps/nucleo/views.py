from django.conf import settings
from django.db import connection
from django.http import FileResponse, Http404, JsonResponse


def health(request):
    """Estado del servicio, incluida la conexión a la base de datos."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"estado": "ok"})


def descargar_apk(request):
    """Instalador de la app (anónimo). 404 si aún no se subió el archivo al volumen."""
    ruta = settings.APK_PATH
    if not ruta.is_file():
        raise Http404("El instalador aún no está disponible.")
    return FileResponse(
        ruta.open("rb"),
        as_attachment=True,
        filename="ArqueoCatalog.apk",
        content_type="application/vnd.android.package-archive",
    )
