"""Utilidades para trabajar detrás de proxys (Traefik + Cloudflare Tunnel)."""

from django.conf import settings


def ip_del_cliente(request):
    """IP del cliente.

    Si `IP_CLIENTE_HEADER` está definido (p. ej. `CF-Connecting-IP` con Cloudflare Tunnel) se
    usa esa cabecera; solo es seguro cuando el backend únicamente es alcanzable por el túnel.
    Si no, se usa `X-Forwarded-For` y, en su defecto, `REMOTE_ADDR`.
    """
    if request is None:
        return None
    cabecera = settings.IP_CLIENTE_HEADER
    if cabecera:
        valor = request.META.get("HTTP_" + cabecera.upper().replace("-", "_"))
        if valor:
            return valor.split(",")[0].strip()
    reenviada = request.META.get("HTTP_X_FORWARDED_FOR")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def url_absoluta(request, ruta):
    """URL absoluta de `ruta`. Con `PUBLIC_BASE_URL` no depende de la cabecera Host/esquema.

    Con Cloudflare Tunnel el tráfico llega a Traefik por HTTP, así que `request.is_secure()`
    sería falso y el QR saldría con `http://`; `PUBLIC_BASE_URL` lo evita.
    """
    base = settings.PUBLIC_BASE_URL
    if base:
        return base.rstrip("/") + ruta
    return request.build_absolute_uri(ruta)


class IdentificarPorIPCliente:
    """Mixin para throttles de DRF: identifica al cliente con `ip_del_cliente`."""

    def get_ident(self, request):
        return ip_del_cliente(request)
