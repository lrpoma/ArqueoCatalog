from . import contexto


class RegistraUsuarioMixin:
    """Informa a las señales quién hace el cambio (ya autenticado por JWT)."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        contexto.fijar_usuario(request.user)


class EliminacionLogicaMixin:
    """DELETE desactiva el registro (`activo=False`); nada se borra físicamente."""

    def perform_destroy(self, instance):
        instance.activo = False
        instance.save()
