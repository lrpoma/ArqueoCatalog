from django.conf import settings
from django.db import IntegrityError, models, transaction
from django.utils import timezone

MAX_REINTENTOS_CODIGO = 5


class Pieza(models.Model):
    codigo = models.CharField(max_length=20, unique=True, editable=False)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    tipo_pieza = models.ForeignKey(
        "catalogos.TipoPieza", on_delete=models.PROTECT, related_name="piezas"
    )
    material = models.CharField(max_length=100, blank=True)
    periodo_cultural = models.ForeignKey(
        "catalogos.PeriodoCultural", on_delete=models.PROTECT, related_name="piezas"
    )
    etiqueta = models.ForeignKey(
        "catalogos.Etiqueta",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="piezas",
    )
    capa = models.ForeignKey(
        "yacimientos.CapaEstratigrafica", on_delete=models.PROTECT, related_name="piezas"
    )
    publica = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    usuario_registro = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="piezas_registradas"
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha_registro"]

    def __str__(self):
        return f"{self.codigo} · {self.nombre}"

    def save(self, *args, **kwargs):
        if self.codigo:
            return super().save(*args, **kwargs)
        # Reintenta si dos altas simultáneas calculan el mismo código.
        for intento in range(MAX_REINTENTOS_CODIGO):
            self.codigo = self._siguiente_codigo()
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                if intento == MAX_REINTENTOS_CODIGO - 1:
                    raise
                self.codigo = ""

    @classmethod
    def _siguiente_codigo(cls):
        anio = timezone.now().year
        prefijo = f"ARQ-{anio}-"
        ultimo = cls.objects.filter(codigo__startswith=prefijo).order_by("-codigo").first()
        secuencia = int(ultimo.codigo.rsplit("-", 1)[1]) + 1 if ultimo else 1
        return f"{prefijo}{secuencia:04d}"


class Fotografia(models.Model):
    pieza = models.ForeignKey(Pieza, on_delete=models.PROTECT, related_name="fotografias")
    archivo = models.ImageField(upload_to="piezas/")
    miniatura = models.ImageField(upload_to="piezas/miniaturas/", blank=True)
    principal = models.BooleanField(default=False)

    class Meta:
        verbose_name = "fotografía"
        verbose_name_plural = "fotografías"

    def __str__(self):
        return f"Foto de {self.pieza.codigo}"


class HistorialPieza(models.Model):
    """Se llena solo con señales (Sprint 2); nunca desde las vistas."""

    pieza = models.ForeignKey(Pieza, on_delete=models.PROTECT, related_name="historial")
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT, related_name="cambios"
    )
    campo_modificado = models.CharField(max_length=50)
    valor_anterior = models.TextField(blank=True)
    valor_nuevo = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "historial de pieza"
        verbose_name_plural = "historial de piezas"
        ordering = ["-fecha"]

    def __str__(self):
        return f"{self.pieza.codigo} · {self.campo_modificado}"
