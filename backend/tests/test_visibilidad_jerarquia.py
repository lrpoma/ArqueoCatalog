"""Una pieza solo es visible si ella, su capa y su yacimiento están activos."""

import pytest
from rest_framework.test import APIClient

from apps.piezas.models import Fotografia, Pieza
from tests.factories import CapaFactory, PiezaFactory, YacimientoFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def anonimo():
    return APIClient()


@pytest.fixture(params=["yacimiento", "capa"])
def pieza_oculta(request):
    """Pieza pública y activa cuyo yacimiento (o capa) fue desactivado."""
    pieza = PiezaFactory(publica=True)
    if request.param == "yacimiento":
        yacimiento = pieza.capa.yacimiento
        yacimiento.activo = False
        yacimiento.save()
    else:
        pieza.capa.activo = False
        pieza.capa.save()
    return pieza


def rutas_de_la_pieza(pieza):
    base = f"/api/v1/piezas/{pieza.id}"
    return [f"{base}/", f"{base}/fotos/", f"{base}/qr/", f"{base}/historial/"]


def test_la_pieza_oculta_no_aparece_en_el_listado(api_investigador, pieza_oculta):
    visible = PiezaFactory()
    ids = [p["id"] for p in api_investigador.get("/api/v1/piezas/").data["results"]]
    assert visible.id in ids
    assert pieza_oculta.id not in ids


def test_la_pieza_oculta_responde_404_en_todas_sus_rutas(api_investigador, api_admin, pieza_oculta):
    for cliente in (api_investigador, api_admin):
        for ruta in rutas_de_la_pieza(pieza_oculta):
            assert cliente.get(ruta).status_code == 404, ruta
        editar = cliente.patch(f"/api/v1/piezas/{pieza_oculta.id}/", {"nombre": "x"})
        assert editar.status_code == 404


def test_la_busqueda_tampoco_la_encuentra(api_investigador, pieza_oculta):
    respuesta = api_investigador.get("/api/v1/piezas/", {"search": pieza_oculta.codigo})
    assert respuesta.data["count"] == 0


def test_ficha_publica_de_pieza_oculta_es_restringida_sin_datos(anonimo, pieza_oculta):
    respuesta = anonimo.get(f"/api/v1/public/piezas/{pieza_oculta.codigo}/")
    assert respuesta.status_code == 403
    assert pieza_oculta.nombre not in respuesta.content.decode()


def test_la_foto_de_una_pieza_oculta_no_se_entrega_ni_con_sesion(
    anonimo, api_investigador, pieza_oculta
):
    foto = Fotografia.objects.create(pieza=pieza_oculta, archivo="piezas/inexistente.jpg")
    assert anonimo.get(f"/api/v1/media/{foto.id}/").status_code == 404
    assert api_investigador.get(f"/api/v1/media/{foto.id}/").status_code == 404


def test_al_reactivar_la_pieza_vuelve_a_verse(api_investigador, anonimo, pieza_oculta):
    capa = pieza_oculta.capa
    capa.activo = True
    capa.save()
    capa.yacimiento.activo = True
    capa.yacimiento.save()
    assert api_investigador.get(f"/api/v1/piezas/{pieza_oculta.id}/").status_code == 200
    assert anonimo.get(f"/api/v1/public/piezas/{pieza_oculta.codigo}/").status_code == 200


def test_no_se_borra_nada_fisicamente(pieza_oculta):
    assert Pieza.objects.filter(pk=pieza_oculta.pk).exists()
    assert not Pieza.objects.visibles().filter(pk=pieza_oculta.pk).exists()
    assert pieza_oculta.activo is True  # la pieza en sí no cambia: solo se oculta por su padre


def test_desactivar_el_yacimiento_por_api_oculta_sus_piezas(api_admin, api_investigador):
    yacimiento = YacimientoFactory()
    pieza = PiezaFactory(capa=CapaFactory(yacimiento=yacimiento))
    assert api_investigador.get(f"/api/v1/piezas/{pieza.id}/").status_code == 200
    assert api_admin.delete(f"/api/v1/yacimientos/{yacimiento.id}/").status_code == 204
    assert api_investigador.get(f"/api/v1/piezas/{pieza.id}/").status_code == 404


def test_pieza_con_padres_activos_sigue_visible(api_investigador):
    pieza = PiezaFactory()
    for ruta in rutas_de_la_pieza(pieza):
        assert api_investigador.get(ruta).status_code == 200, ruta
