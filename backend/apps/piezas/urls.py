from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views
from .views_media import MediaFoto
from .views_publicas import FichaPublica

router = SimpleRouter()
router.register("piezas", views.PiezaViewSet, basename="pieza")

urlpatterns = [
    path("media/<int:foto_id>/", MediaFoto.as_view(), name="media-foto"),
    path("public/piezas/<str:codigo>/", FichaPublica.as_view(), name="ficha-publica"),
    *router.urls,
]
