from django.contrib import admin

from .models import Etiqueta, PeriodoCultural, TipoPieza


@admin.register(PeriodoCultural)
class PeriodoCulturalAdmin(admin.ModelAdmin):
    list_display = ("nombre", "anio_inicio", "anio_fin")
    search_fields = ("nombre",)


@admin.register(TipoPieza)
class TipoPiezaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)


@admin.register(Etiqueta)
class EtiquetaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)
