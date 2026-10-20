from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views
from .views_publicas import FichaPublica

router = SimpleRouter()
router.register("piezas", views.PiezaViewSet, basename="pieza")

urlpatterns = [
    path("media/<int:foto_id>/", views.media, name="media"),
    path("public/piezas/<str:codigo>/", FichaPublica.as_view(), name="ficha-publica"),
    *router.urls,
]
