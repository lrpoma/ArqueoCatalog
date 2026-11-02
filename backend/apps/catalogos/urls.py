from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register("catalogos/periodos", views.PeriodoViewSet, basename="periodo")
router.register("catalogos/tipos", views.TipoPiezaViewSet, basename="tipo")
router.register("catalogos/etiquetas", views.EtiquetaViewSet, basename="etiqueta")

urlpatterns = router.urls
