from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("", TemplateView.as_view(template_name="nucleo/inicio.html"), name="inicio"),
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.nucleo.urls")),
    path("api/v1/", include("apps.usuarios.urls")),
    path("api/v1/", include("apps.catalogos.urls")),
    path("api/v1/", include("apps.yacimientos.urls")),
    path("api/v1/", include("apps.piezas.urls")),
]
