from io import BytesIO

import pytest
from django.test import RequestFactory
from django.urls import reverse
from PIL import Image

from apps.nucleo.red import ip_del_cliente, url_absoluta
from tests.factories import PiezaFactory


def test_descargar_apk_sin_archivo_es_404(api, settings, tmp_path):
    settings.APK_PATH = tmp_path / "no-existe.apk"
    assert api.get(reverse("descargar-apk")).status_code == 404


def test_descargar_apk_es_anonimo_y_entrega_el_archivo(api, settings, tmp_path):
    apk = tmp_path / "app.apk"
    apk.write_bytes(b"PK\x03\x04contenido")
    settings.APK_PATH = apk
    respuesta = api.get(reverse("descargar-apk"))
    assert respuesta.status_code == 200
    assert respuesta["Content-Type"] == "application/vnd.android.package-archive"
    assert "attachment" in respuesta["Content-Disposition"]
    assert b"".join(respuesta.streaming_content) == b"PK\x03\x04contenido"


def test_url_absoluta_usa_public_base_url(settings):
    peticion = RequestFactory().get("/", HTTP_HOST="localhost:8000")
    settings.PUBLIC_BASE_URL = ""
    assert url_absoluta(peticion, "/x/") == "http://localhost:8000/x/"
    settings.PUBLIC_BASE_URL = "https://arqueo.ejemplo.org/"
    assert url_absoluta(peticion, "/x/") == "https://arqueo.ejemplo.org/x/"


def test_ip_del_cliente_prefiere_la_cabecera_configurada(settings):
    peticion = RequestFactory().get(
        "/",
        REMOTE_ADDR="172.18.0.5",
        HTTP_X_FORWARDED_FOR="172.18.0.9",
        HTTP_CF_CONNECTING_IP="190.1.2.3",
    )
    settings.IP_CLIENTE_HEADER = ""
    assert ip_del_cliente(peticion) == "172.18.0.9"
    settings.IP_CLIENTE_HEADER = "CF-Connecting-IP"
    assert ip_del_cliente(peticion) == "190.1.2.3"


@pytest.mark.django_db
def test_qr_y_urls_de_foto_usan_la_url_publica(api_investigador, settings):
    settings.PUBLIC_BASE_URL = "https://arqueo.ejemplo.org"
    pieza = PiezaFactory()
    assert api_investigador.get(f"/api/v1/piezas/{pieza.id}/qr/").status_code == 200
    imagen = BytesIO()
    Image.new("RGB", (20, 20), "red").save(imagen, "PNG")
    imagen.name = "f.png"
    imagen.seek(0)
    subida = api_investigador.post(
        f"/api/v1/piezas/{pieza.id}/fotos/", {"archivo": imagen}, format="multipart"
    )
    assert subida.status_code == 201
    assert subida.json()["url"].startswith("https://arqueo.ejemplo.org/api/v1/media/")
