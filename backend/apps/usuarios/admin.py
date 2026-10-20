from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

from .models import Institucion, LogAcceso, Usuario

# Los permisos se manejan con Usuario.rol; los grupos de Django no se usan.
admin.site.unregister(Group)


@admin.register(Institucion)
class InstitucionAdmin(admin.ModelAdmin):
    list_display = ("nombre", "tipo", "ciudad")
    list_filter = ("tipo",)
    search_fields = ("nombre", "ciudad")


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("username", "email", "rol", "institucion", "is_active")
    list_filter = ("rol", "institucion", "is_active")
    readonly_fields = ("is_staff",)
    fieldsets = UserAdmin.fieldsets + (("ArqueoCatalog", {"fields": ("rol", "institucion")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("ArqueoCatalog", {"fields": ("rol", "institucion")}),
    )

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        # is_staff se deriva del rol; se quita del formulario.
        return [
            (name, {**opts, "fields": tuple(f for f in opts["fields"] if f != "is_staff")})
            for name, opts in fieldsets
        ]


@admin.register(LogAcceso)
class LogAccesoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "fecha_hora", "ip")
    list_filter = ("fecha_hora",)
    search_fields = ("usuario__username", "ip")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
