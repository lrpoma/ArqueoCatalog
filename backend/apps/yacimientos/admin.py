from django.contrib import admin

from .models import CapaEstratigrafica, Yacimiento


class CapaInline(admin.TabularInline):
    model = CapaEstratigrafica
    extra = 0


@admin.register(Yacimiento)
class YacimientoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "periodo_cultural", "estado", "investigador_responsable", "activo")
    list_filter = ("estado", "periodo_cultural", "activo")
    search_fields = ("nombre",)
    inlines = [CapaInline]


@admin.register(CapaEstratigrafica)
class CapaEstratigraficaAdmin(admin.ModelAdmin):
    list_display = ("codigo", "yacimiento", "profundidad_desde", "profundidad_hasta", "activo")
    list_filter = ("activo", "yacimiento")
    search_fields = ("codigo", "yacimiento__nombre")
