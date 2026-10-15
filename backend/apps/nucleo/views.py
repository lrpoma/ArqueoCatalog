from django.db import connection
from django.http import JsonResponse


def health(request):
    """Estado del servicio, incluida la conexión a la base de datos."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"estado": "ok"})
