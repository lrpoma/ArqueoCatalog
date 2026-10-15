from django.db import models


class PeriodoCultural(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    anio_inicio = models.IntegerField(help_text="Año de inicio (negativo = a. C.)")
    anio_fin = models.IntegerField(help_text="Año de fin (negativo = a. C.)")

    class Meta:
        verbose_name = "periodo cultural"
        verbose_name_plural = "periodos culturales"
        ordering = ["anio_inicio"]

    def __str__(self):
        return self.nombre


class TipoPieza(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        verbose_name = "tipo de pieza"
        verbose_name_plural = "tipos de pieza"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Etiqueta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre
