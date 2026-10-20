import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from apps.piezas.models import Fotografia
from tests.factories import PiezaFactory

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def media_temporal(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


def imagen_con_gps(formato="JPEG", tamano=(60, 40)):
    imagen = Image.new("RGB", tamano, "red")
    exif = Image.Exif()
    exif[0x010F] = "CamaraFalsa"
    exif[0x8825] = {1: "S", 2: (16.0, 30.0, 0.0), 3: "W", 4: (68.0, 10.0, 0.0)}  # GPS IFD
    buffer = io.BytesIO()
    imagen.save(buffer, format=formato, exif=exif) if formato == "JPEG" else imagen.save(
        buffer, format=formato
    )
    return SimpleUploadedFile(
        f"foto.{formato.lower()}", buffer.getvalue(), content_type=f"image/{formato.lower()}"
    )


def subir(api, pieza, archivo):
    return api.post(f"/api/v1/piezas/{pieza.id}/fotos/", {"archivo": archivo}, format="multipart")


def test_subir_foto_quita_exif_y_genera_miniatura(api_investigador):
    pieza = PiezaFactory()
    r = subir(api_investigador, pieza, imagen_con_gps())
    assert r.status_code == 201
    foto = Fotografia.objects.get(pk=r.data["id"])
    assert foto.principal is True
    assert foto.miniatura
    for campo in (foto.archivo, foto.miniatura):
        with Image.open(campo.path) as guardada:
            assert not guardada.getexif()
            assert "exif" not in guardada.info


def test_solo_la_primera_foto_es_principal(api_investigador):
    pieza = PiezaFactory()
    subir(api_investigador, pieza, imagen_con_gps())
    r = subir(api_investigador, pieza, imagen_con_gps("PNG"))
    assert r.status_code == 201
    assert pieza.fotografias.filter(principal=True).count() == 1


def test_foto_rechaza_archivo_que_no_es_imagen(api_investigador):
    falso = SimpleUploadedFile("foto.jpg", b"no soy una imagen", content_type="image/jpeg")
    assert subir(api_investigador, PiezaFactory(), falso).status_code == 400


def test_foto_rechaza_formato_no_permitido(api_investigador):
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10)).save(buffer, format="GIF")
    gif = SimpleUploadedFile("foto.gif", buffer.getvalue(), content_type="image/gif")
    assert subir(api_investigador, PiezaFactory(), gif).status_code == 400


def test_foto_rechaza_archivo_muy_grande(api_investigador, monkeypatch):
    monkeypatch.setattr("apps.piezas.fotos.TAMANO_MAXIMO", 100)
    assert subir(api_investigador, PiezaFactory(), imagen_con_gps()).status_code == 400


def test_subir_foto_requiere_autenticacion(api):
    assert subir(api, PiezaFactory(), imagen_con_gps()).status_code == 401


def test_pieza_lista_sus_fotos(api_investigador):
    pieza = PiezaFactory()
    subir(api_investigador, pieza, imagen_con_gps())
    r = api_investigador.get(f"/api/v1/piezas/{pieza.id}/")
    assert len(r.data["fotografias"]) == 1
    assert r.data["fotografias"][0]["url"].startswith("/api/v1/media/")


def test_qr_es_png_para_personal(api_investigador):
    pieza = PiezaFactory()
    r = api_investigador.get(f"/api/v1/piezas/{pieza.id}/qr/")
    assert r.status_code == 200
    assert r["Content-Type"] == "image/png"
    assert r.content.startswith(b"\x89PNG")


def test_qr_requiere_autenticacion(api):
    assert api.get(f"/api/v1/piezas/{PiezaFactory().id}/qr/").status_code == 401


def test_media_publica_visible_para_anonimos(api_investigador, client):
    pieza = PiezaFactory(publica=True)
    foto_id = subir(api_investigador, pieza, imagen_con_gps()).data["id"]
    assert client.get(f"/api/v1/media/{foto_id}/").status_code == 200
    assert client.get(f"/api/v1/media/{foto_id}/?miniatura=1").status_code == 200


def test_media_no_publica_oculta_a_anonimos_pero_visible_con_token(api_investigador, client):
    pieza = PiezaFactory(publica=False)
    foto_id = subir(api_investigador, pieza, imagen_con_gps()).data["id"]
    assert client.get(f"/api/v1/media/{foto_id}/").status_code == 404
    from rest_framework_simplejwt.tokens import AccessToken

    token = AccessToken.for_user(pieza.usuario_registro)
    r = client.get(f"/api/v1/media/{foto_id}/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert r.status_code == 200


def test_media_inexistente_404(client):
    assert client.get("/api/v1/media/9999/").status_code == 404


def test_ficha_publica_muestra_foto_principal(api_investigador, client):
    pieza = PiezaFactory(publica=True)
    foto_id = subir(api_investigador, pieza, imagen_con_gps()).data["id"]
    html = client.get(f"/api/v1/public/piezas/{pieza.codigo}/").content.decode()
    assert f"/api/v1/media/{foto_id}/" in html
