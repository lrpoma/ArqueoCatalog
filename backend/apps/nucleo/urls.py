from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("app/descargar.apk", views.descargar_apk, name="descargar-apk"),
]
