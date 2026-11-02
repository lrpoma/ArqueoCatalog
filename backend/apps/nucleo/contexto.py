"""Usuario que realiza la petición actual, accesible desde las señales.

El middleware crea un contenedor por petición; la autenticación JWT de DRF ocurre
dentro de la vista, así que `RegistraUsuarioMixin` lo actualiza una vez autenticado.
"""

from contextvars import ContextVar

_contenedor: ContextVar[dict | None] = ContextVar("contenedor_usuario", default=None)


def iniciar():
    contenedor = {"usuario": None}
    return _contenedor.set(contenedor), contenedor


def terminar(token):
    _contenedor.reset(token)


def fijar_usuario(usuario):
    contenedor = _contenedor.get()
    if contenedor is not None and getattr(usuario, "is_authenticated", False):
        contenedor["usuario"] = usuario


def usuario_actual():
    contenedor = _contenedor.get()
    return contenedor["usuario"] if contenedor else None
