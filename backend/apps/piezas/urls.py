from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views
from .views_publicas import FichaPublica

router = SimpleRouter()
router.register("piezas", views.PiezaViewSet, basename="pieza")

urlpatterns = [
    path("public/piezas/<str:codigo>/", FichaPublica.as_view(), name="ficha-publica"),
    *router.urls,
]
