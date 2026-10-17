import pytest
from rest_framework.test import APIClient

from tests.factories import CapaFactory, PiezaFactory, UsuarioFactory, YacimientoFactory

pytestmark = pytest.mark.django_db

RUTAS_LISTA = [
    "/api/v1/yacimientos/",
    "/api/v1/piezas/",
    "/api/v1/catalogos/periodos/",
    "/api/v1/catalogos/tipos/",
    "/api/v1/catalogos/etiquetas/",
]


@pytest.mark.parametrize("ruta", RUTAS_LISTA)
def test_sin_token_401(api, ruta):
    assert api.get(ruta).status_code == 401


def test_investigador_no_elimina(api_investigador):
    yac, pieza = YacimientoFactory(), PiezaFactory()
    capa = CapaFactory(yacimiento=yac)
    assert api_investigador.delete(f"/api/v1/yacimientos/{yac.id}/").status_code == 403
    assert (
        api_investigador.delete(f"/api/v1/yacimientos/{yac.id}/capas/{capa.id}/").status_code == 403
    )
    assert api_investigador.delete(f"/api/v1/piezas/{pieza.id}/").status_code == 403


def test_administrador_elimina_logicamente(api_admin):
    yac, pieza = YacimientoFactory(), PiezaFactory()
    capa = CapaFactory(yacimiento=yac)
    assert api_admin.delete(f"/api/v1/yacimientos/{yac.id}/capas/{capa.id}/").status_code == 204
    assert api_admin.delete(f"/api/v1/piezas/{pieza.id}/").status_code == 204
    assert api_admin.delete(f"/api/v1/yacimientos/{yac.id}/").status_code == 204
    for obj in (yac, capa, pieza):
        obj.refresh_from_db()
        assert obj.activo is False  # sigue en la base, solo desactivado


def test_registros_inactivos_no_se_listan_ni_consultan(api_investigador):
    yac = YacimientoFactory(activo=False)
    pieza = PiezaFactory(activo=False)
    capa = CapaFactory(activo=False)
    ids = [y["id"] for y in api_investigador.get("/api/v1/yacimientos/").data["results"]]
    assert yac.id not in ids
    assert api_investigador.get(f"/api/v1/yacimientos/{yac.id}/").status_code == 404
    assert api_investigador.get(f"/api/v1/piezas/{pieza.id}/").status_code == 404
    assert (
        api_investigador.get(f"/api/v1/yacimientos/{capa.yacimiento_id}/capas/").data["count"] == 0
    )
    assert api_investigador.get(f"/api/v1/yacimientos/{yac.id}/capas/").status_code == 404


@pytest.mark.parametrize("ruta", ["periodos", "tipos", "etiquetas"])
def test_catalogos_solo_lectura(api_admin, ruta):
    assert api_admin.get(f"/api/v1/catalogos/{ruta}/").status_code == 200
    assert api_admin.post(f"/api/v1/catalogos/{ruta}/", {"nombre": "X"}).status_code == 403
    assert api_admin.put(f"/api/v1/catalogos/{ruta}/1/", {"nombre": "X"}).status_code == 403
    assert api_admin.delete(f"/api/v1/catalogos/{ruta}/1/").status_code == 403


def test_catalogos_devuelven_listas(api_investigador, pieza):
    r = api_investigador.get("/api/v1/catalogos/periodos/")
    assert r.status_code == 200 and isinstance(r.data, list) and r.data


def test_usuario_con_rol_desconocido_sin_acceso():
    usuario = UsuarioFactory(rol="asistente")
    cliente = APIClient()
    cliente.force_authenticate(usuario)
    assert cliente.get("/api/v1/piezas/").status_code == 403


def test_admin_django_solo_para_administradores(client, administrador, investigador):
    for u in (administrador, investigador):
        u.set_password("clave-segura-123")
        u.save()
    client.login(username=investigador.username, password="clave-segura-123")
    assert client.get("/admin/", follow=False).status_code == 302  # redirige al login
    client.logout()
    client.login(username=administrador.username, password="clave-segura-123")
    assert client.get("/admin/", follow=False).status_code == 200
