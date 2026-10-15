from django.urls import path

from .views_publicas import FichaPublica

urlpatterns = [
    path("public/piezas/<str:codigo>/", FichaPublica.as_view(), name="ficha-publica"),
]
