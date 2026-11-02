from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.usuarios.models import Usuario

ROLES_DE_CAMPO = {Usuario.Rol.ADMINISTRADOR, Usuario.Rol.INVESTIGADOR}


class EsPersonalAutorizado(BasePermission):
    """Administrador o investigador; DELETE solo para el administrador."""

    message = "No tiene permiso para realizar esta acción."

    def has_permission(self, request, view):
        usuario = request.user
        if not (usuario and usuario.is_authenticated and usuario.is_active):
            return False
        if usuario.rol not in ROLES_DE_CAMPO:
            return False
        if request.method == "DELETE":
            return usuario.rol == Usuario.Rol.ADMINISTRADOR
        return True


class SoloLectura(EsPersonalAutorizado):
    """Catálogos: la app solo consulta; se editan desde el panel admin."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS and super().has_permission(request, view)
