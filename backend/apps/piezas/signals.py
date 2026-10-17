from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.nucleo.contexto import usuario_actual

from .models import HistorialPieza, Pieza

CAMPOS_RASTREADOS = (
    "nombre",
    "descripcion",
    "tipo_pieza",
    "material",
    "periodo_cultural",
    "etiqueta",
    "capa",
    "publica",
    "activo",
)
RELACIONES = {"tipo_pieza", "periodo_cultural", "etiqueta", "capa"}


def _texto(pieza, campo):
    valor = getattr(pieza, campo)
    if valor is None:
        return ""
    if isinstance(valor, bool):
        return "Sí" if valor else "No"
    return str(valor)


@receiver(pre_save, sender=Pieza)
def guardar_valores_previos(sender, instance, raw=False, **kwargs):
    instance._previa = None
    if raw or instance.pk is None:
        return
    instance._previa = (
        Pieza.objects.select_related(*RELACIONES, "capa__yacimiento").filter(pk=instance.pk).first()
    )


@receiver(post_save, sender=Pieza)
def registrar_historial(sender, instance, created, raw=False, **kwargs):
    previa = getattr(instance, "_previa", None)
    if created or raw or previa is None:
        return
    usuario = usuario_actual()
    cambios = []
    for campo in CAMPOS_RASTREADOS:
        anterior, nuevo = _texto(previa, campo), _texto(instance, campo)
        if anterior != nuevo:
            cambios.append(
                HistorialPieza(
                    pieza=instance,
                    usuario=usuario,
                    campo_modificado=campo,
                    valor_anterior=anterior,
                    valor_nuevo=nuevo,
                )
            )
    HistorialPieza.objects.bulk_create(cambios)
    instance._previa = None
