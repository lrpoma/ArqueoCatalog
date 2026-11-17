from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from apps.nucleo.red import ip_del_cliente

from .models import LogAcceso


@receiver(user_logged_in)
def registrar_acceso(sender, request, user, **kwargs):
    """Solo inicios de sesión exitosos; los fallidos no se registran."""
    LogAcceso.objects.create(usuario=user, ip=ip_del_cliente(request))
