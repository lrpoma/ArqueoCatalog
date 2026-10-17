from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from .models import LogAcceso


def ip_del_cliente(request):
    if request is None:
        return None
    reenviada = request.META.get("HTTP_X_FORWARDED_FOR")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


@receiver(user_logged_in)
def registrar_acceso(sender, request, user, **kwargs):
    """Solo inicios de sesión exitosos; los fallidos no se registran."""
    LogAcceso.objects.create(usuario=user, ip=ip_del_cliente(request))
