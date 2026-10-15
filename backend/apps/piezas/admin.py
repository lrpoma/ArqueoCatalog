from django.contrib import admin

from .models import Fotografia, HistorialPieza, Pieza


class FotografiaInline(admin.TabularInline):
    model = Fotografia
    extra = 0


@admin.register(Pieza)
class PiezaAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "tipo_pieza", "periodo_cultural", "publica", "activo")
    list_filter = ("activo", "publica", "tipo_pieza", "periodo_cultural", "etiqueta")
    search_fields = ("codigo", "nombre")
    inlines = [FotografiaInline]


@admin.register(HistorialPieza)
class HistorialPiezaAdmin(admin.ModelAdmin):
    list_display = (
        "pieza",
        "campo_modificado",
        "valor_anterior",
        "valor_nuevo",
        "usuario",
        "fecha",
    )
    list_filter = ("campo_modificado",)
    search_fields = ("pieza__codigo",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
