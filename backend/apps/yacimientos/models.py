from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Yacimiento(models.Model):
    class Estado(models.TextChoices):
        EN_EXPLORACION = "en_exploracion", "En exploración"
        EN_EXCAVACION = "en_excavacion", "En excavación"
        EN_ESTUDIO = "en_estudio", "En estudio"
        CERRADO = "cerrado", "Cerrado"

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    latitud = models.FloatField(validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitud = models.FloatField(validators=[MinValueValidator(-180), MaxValueValidator(180)])
    periodo_cultural = models.ForeignKey(
        "catalogos.PeriodoCultural", on_delete=models.PROTECT, related_name="yacimientos"
    )
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_EXPLORACION)
    investigador_responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="yacimientos"
    )
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class CapaEstratigrafica(models.Model):
    yacimiento = models.ForeignKey(Yacimiento, on_delete=models.PROTECT, related_name="capas")
    codigo = models.CharField(max_length=50)
    profundidad_desde = models.FloatField(help_text="Metros")
    profundidad_hasta = models.FloatField(help_text="Metros")
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "capa estratigráfica"
        verbose_name_plural = "capas estratigráficas"
        ordering = ["yacimiento", "profundidad_desde"]
        constraints = [
            models.UniqueConstraint(fields=["yacimiento", "codigo"], name="capa_codigo_unico"),
            models.CheckConstraint(
                condition=models.Q(profundidad_hasta__gte=models.F("profundidad_desde")),
                name="capa_profundidad_valida",
            ),
        ]

    def __str__(self):
        return f"{self.yacimiento} · {self.codigo}"
