from django.urls import path

from . import views

urlpatterns = [
    path("app/descargar.apk", views.descargar_apk, name="descargar-apk"),
    path("health/", views.health, name="health"),
]
