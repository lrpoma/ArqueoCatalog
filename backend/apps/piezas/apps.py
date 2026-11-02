from django.apps import AppConfig


class PiezasConfig(AppConfig):
    name = "apps.piezas"

    def ready(self):
        from . import signals  # noqa: F401
