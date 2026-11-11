from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.piezas.models import Fotografia
from tests.factories import PiezaFactory

pytestmark = pytest.mark.django_db

TAG_GPS = 0x8825
TAG_MARCA = 0x010F


@pytest.fixture(autouse=True)
def media_temporal(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def anonimo():
    """Cliente sin sesión (el fixture `api` queda autenticado al usar `api_investigador`)."""
    return APIClient()


def imagen(formato="JPEG", tamano=(800, 600), con_exif=False, modo="RGB"):
    """Archivo de imagen en memoria, opcionalmente con EXIF que incluye coordenadas GPS."""
    buffer = BytesIO()
    img = Image.new(modo, tamano, (180, 60, 40) if modo == "RGB" else None)
    opciones = {}
    if con_exif:
        exif = Image.Exif()
        exif[TAG_MARCA] = "CamaraSecreta"
        exif[TAG_GPS] = {1: "S", 2: (16.0, 29.0, 30.0), 3: "W", 4: (68.0, 8.0, 15.0)}
        opciones["exif"] = exif
    img.save(buffer, format=formato, **opciones)
    extension = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}.get(formato, formato.lower())
    return SimpleUploadedFile(
        f"foto.{extension}", buffer.getvalue(), content_type=f"image/{extension}"
    )


def subir(api, pieza, archivo):
    return api.post(f"/api/v1/piezas/{pieza.id}/fotos/", {"archivo": archivo}, format="multipart")


def abrir_guardada(foto, miniatura=False):
    campo = foto.miniatura if miniatura else foto.archivo
    campo.open("rb")
    try:
        return Image.open(BytesIO(campo.read()))
    finally:
        campo.close()


# --- Subida y validación -------------------------------------------------------------


def test_subir_foto_crea_registro_con_miniatura(api_investigador, pieza):
    respuesta = subir(api_investigador, pieza, imagen())
    assert respuesta.status_code == 201
    foto = Fotografia.objects.get(pk=respuesta.data["id"])
    assert foto.pieza == pieza
    assert respuesta.data["url"].endswith(f"/api/v1/media/{foto.id}/")
    assert respuesta.data["miniatura_url"].endswith("?miniatura=1")
    assert "archivo" not in respuesta.data  # la ruta física no se expone
    miniatura = abrir_guardada(foto, miniatura=True)
    assert max(miniatura.size) <= 400


def test_la_primera_foto_es_principal_y_las_siguientes_no(api_investigador, pieza):
    primera = subir(api_investigador, pieza, imagen()).data
    segunda = subir(api_investigador, pieza, imagen()).data
    assert primera["principal"] is True
    assert segunda["principal"] is False
    detalle = api_investigador.get(f"/api/v1/piezas/{pieza.id}/").data
    assert detalle["foto_principal"] == primera["id"]


def test_pieza_sin_fotos_no_tiene_foto_principal(api_investigador, pieza):
    assert api_investigador.get(f"/api/v1/piezas/{pieza.id}/").data["foto_principal"] is None


@pytest.mark.parametrize("formato", ["JPEG", "PNG", "WEBP"])
def test_formatos_permitidos(api_investigador, pieza, formato):
    assert subir(api_investigador, pieza, imagen(formato)).status_code == 201


def test_rechaza_formato_no_permitido(api_investigador, pieza):
    assert subir(api_investigador, pieza, imagen("GIF")).status_code == 400
    assert subir(api_investigador, pieza, imagen("BMP")).status_code == 400
    assert Fotografia.objects.count() == 0


def test_rechaza_archivo_que_no_es_imagen(api_investigador, pieza):
    falso = SimpleUploadedFile("foto.jpg", b"%PDF-1.4 no soy una imagen", content_type="image/jpeg")
    respuesta = subir(api_investigador, pieza, falso)
    assert respuesta.status_code == 400
    assert "archivo" in respuesta.data


def test_rechaza_imagen_mayor_al_limite(api_investigador, pieza, monkeypatch):
    monkeypatch.setattr("apps.piezas.imagenes.TAMANO_MAXIMO", 1024)
    respuesta = subir(api_investigador, pieza, imagen(tamano=(400, 400)))
    assert respuesta.status_code == 400
    assert "máximo" in str(respuesta.data["archivo"])


def test_sin_archivo_400(api_investigador, pieza):
    respuesta = api_investigador.post(f"/api/v1/piezas/{pieza.id}/fotos/", {}, format="multipart")
    assert respuesta.status_code == 400


def test_imagen_grande_se_reduce(api_investigador, pieza):
    respuesta = subir(api_investigador, pieza, imagen(tamano=(4000, 3000)))
    foto = Fotografia.objects.get(pk=respuesta.data["id"])
    assert max(abrir_guardada(foto).size) <= 2048


# --- EXIF / GPS ---------------------------------------------------------------------


def test_la_imagen_de_prueba_si_trae_exif_y_gps():
    """Control de la prueba siguiente: sin esto, 'sin EXIF' no probaría nada."""
    archivo = imagen(con_exif=True)
    exif = Image.open(BytesIO(archivo.read())).getexif()
    assert exif.get(TAG_MARCA) == "CamaraSecreta"
    assert exif.get_ifd(TAG_GPS)


@pytest.mark.parametrize("formato", ["JPEG", "WEBP"])
def test_se_elimina_el_exif_incluido_el_gps(api_investigador, pieza, formato):
    respuesta = subir(api_investigador, pieza, imagen(formato, con_exif=True))
    assert respuesta.status_code == 201
    foto = Fotografia.objects.get(pk=respuesta.data["id"])
    for miniatura in (False, True):
        guardada = abrir_guardada(foto, miniatura=miniatura)
        exif = guardada.getexif()
        assert TAG_MARCA not in exif
        assert not exif.get_ifd(TAG_GPS)
        assert len(exif) == 0


def test_no_se_conserva_el_nombre_original(api_investigador, pieza):
    respuesta = subir(api_investigador, pieza, imagen())
    foto = Fotografia.objects.get(pk=respuesta.data["id"])
    assert "foto" not in foto.archivo.name
    assert foto.archivo.name.endswith(".jpg")


# --- Permisos y estado de la pieza ----------------------------------------------------


def test_subir_foto_requiere_autenticacion(anonimo, pieza):
    assert subir(anonimo, pieza, imagen()).status_code == 401


def test_pieza_inactiva_no_recibe_fotos(api_investigador):
    inactiva = PiezaFactory(activo=False)
    assert subir(api_investigador, inactiva, imagen()).status_code == 404


def test_listar_fotos_de_la_pieza(api_investigador, pieza):
    subir(api_investigador, pieza, imagen())
    subir(api_investigador, pieza, imagen())
    respuesta = api_investigador.get(f"/api/v1/piezas/{pieza.id}/fotos/")
    assert respuesta.status_code == 200
    assert len(respuesta.data) == 2
    assert respuesta.data[0]["principal"] is True


# --- /media/{id}/: control de visibilidad ---------------------------------------------


@pytest.fixture
def foto_de(api_investigador):
    def _crear(**campos):
        pieza = PiezaFactory(**campos)
        return Fotografia.objects.get(pk=subir(api_investigador, pieza, imagen()).data["id"])

    return _crear


def test_media_exige_sesion_si_la_pieza_no_es_publica(anonimo, api_investigador, foto_de):
    foto = foto_de(publica=False)
    assert anonimo.get(f"/api/v1/media/{foto.id}/").status_code == 404
    respuesta = api_investigador.get(f"/api/v1/media/{foto.id}/")
    assert respuesta.status_code == 200
    assert respuesta["Content-Type"] == "image/jpeg"
    assert Image.open(BytesIO(b"".join(respuesta.streaming_content))).format == "JPEG"


def test_media_de_pieza_publica_es_accesible_sin_sesion(anonimo, foto_de):
    foto = foto_de(publica=True)
    assert anonimo.get(f"/api/v1/media/{foto.id}/").status_code == 200


def test_media_de_pieza_inactiva_es_404_para_todos(api_admin, anonimo, foto_de):
    foto = foto_de(publica=True)
    foto.pieza.activo = False
    foto.pieza.save()
    assert anonimo.get(f"/api/v1/media/{foto.id}/").status_code == 404
    assert api_admin.get(f"/api/v1/media/{foto.id}/").status_code == 404


def test_media_inexistente_404(api_investigador):
    assert api_investigador.get("/api/v1/media/99999/").status_code == 404


def test_media_entrega_la_miniatura(api_investigador, foto_de):
    foto = foto_de()
    completa = api_investigador.get(f"/api/v1/media/{foto.id}/")
    chica = api_investigador.get(f"/api/v1/media/{foto.id}/?miniatura=1")
    assert chica.status_code == 200
    assert len(b"".join(chica.streaming_content)) < len(b"".join(completa.streaming_content))


def test_media_ignora_la_cabecera_accept(api_investigador, foto_de):
    foto = foto_de()
    respuesta = api_investigador.get(f"/api/v1/media/{foto.id}/", HTTP_ACCEPT="image/webp,*/*")
    assert respuesta.status_code == 200


def test_ficha_publica_muestra_la_foto_solo_si_es_publica(anonimo, foto_de):
    foto = foto_de(publica=True)
    html = anonimo.get(f"/api/v1/public/piezas/{foto.pieza.codigo}/").content.decode()
    assert f"/api/v1/media/{foto.id}/" in html

    restringida = foto_de(publica=False)
    respuesta = anonimo.get(f"/api/v1/public/piezas/{restringida.pieza.codigo}/")
    assert respuesta.status_code == 403
    assert "media" not in respuesta.content.decode()


# --- QR -------------------------------------------------------------------------------


def test_qr_devuelve_png(api_investigador, pieza):
    respuesta = api_investigador.get(f"/api/v1/piezas/{pieza.id}/qr/")
    assert respuesta.status_code == 200
    assert respuesta["Content-Type"] == "image/png"
    assert Image.open(BytesIO(respuesta.content)).format == "PNG"


def test_qr_ignora_accept_de_imagen(api_investigador, pieza):
    respuesta = api_investigador.get(f"/api/v1/piezas/{pieza.id}/qr/", HTTP_ACCEPT="image/png")
    assert respuesta.status_code == 200


def test_qr_apunta_a_la_ficha_publica(api_investigador, pieza, monkeypatch):
    capturado = {}
    import qrcode

    original = qrcode.make

    def espia(datos, **opciones):
        capturado["datos"] = datos
        return original(datos, **opciones)

    monkeypatch.setattr("apps.piezas.views.qrcode.make", espia)
    api_investigador.get(f"/api/v1/piezas/{pieza.id}/qr/")
    assert capturado["datos"].endswith(f"/api/v1/public/piezas/{pieza.codigo}/")


def test_qr_requiere_autenticacion_y_pieza_activa(anonimo, api_investigador):
    pieza = PiezaFactory()
    assert anonimo.get(f"/api/v1/piezas/{pieza.id}/qr/").status_code == 401
    inactiva = PiezaFactory(activo=False)
    assert api_investigador.get(f"/api/v1/piezas/{inactiva.id}/qr/").status_code == 404
