from . import contexto


class UsuarioActualMiddleware:
    """Disponibiliza el usuario de sesión (p. ej. el admin) para las señales de historial."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token, _ = contexto.iniciar()
        try:
            contexto.fijar_usuario(getattr(request, "user", None))
            return self.get_response(request)
        finally:
            contexto.terminar(token)
