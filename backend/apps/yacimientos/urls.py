from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register("yacimientos", views.YacimientoViewSet, basename="yacimiento")

capas = views.CapaViewSet.as_view({"get": "list", "post": "create"})
capa = views.CapaViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("yacimientos/<int:yacimiento_pk>/capas/", capas, name="capa-list"),
    path("yacimientos/<int:yacimiento_pk>/capas/<int:pk>/", capa, name="capa-detail"),
    *router.urls,
]
