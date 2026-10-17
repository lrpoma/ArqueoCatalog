import pytest

from apps.piezas.models import HistorialPieza
from tests.factories import (
    CapaFactory,
    EtiquetaFactory,
    PeriodoFactory,
    PiezaFactory,
    TipoPiezaFactory,
)

pytestmark = pytest.mark.django_db


def test_crear_pieza_no_genera_historial():
    PiezaFactory()
    assert HistorialPieza.objects.count() == 0


def test_cambio_de_tipo_periodo_etiqueta_capa_y_activo(investigador):
    pieza = PiezaFactory(etiqueta=None)
    nuevo_tipo, nuevo_periodo = TipoPiezaFactory(), PeriodoFactory()
    etiqueta, capa = EtiquetaFactory(), CapaFactory()
    pieza.tipo_pieza, pieza.periodo_cultural = nuevo_tipo, nuevo_periodo
    pieza.etiqueta, pieza.capa, pieza.activo = etiqueta, capa, False
    pieza.save()

    cambios = {h.campo_modificado: h for h in HistorialPieza.objects.all()}
    assert set(cambios) == {"tipo_pieza", "periodo_cultural", "etiqueta", "capa", "activo"}
    assert cambios["etiqueta"].valor_anterior == ""
    assert cambios["etiqueta"].valor_nuevo == str(etiqueta)
    assert cambios["activo"].valor_anterior == "Sí"
    assert cambios["activo"].valor_nuevo == "No"


def test_guardar_sin_cambios_no_registra():
    pieza = PiezaFactory()
    pieza.save()
    assert HistorialPieza.objects.count() == 0


def test_solo_registra_los_campos_modificados():
    pieza = PiezaFactory(nombre="Antes")
    pieza.nombre = "Después"
    pieza.save()
    h = HistorialPieza.objects.get()
    assert (h.campo_modificado, h.valor_anterior, h.valor_nuevo) == ("nombre", "Antes", "Después")


def test_api_patch_registra_usuario_autenticado(api_investigador, investigador):
    pieza = PiezaFactory()
    nuevo = TipoPiezaFactory()
    r = api_investigador.patch(f"/api/v1/piezas/{pieza.id}/", {"tipo_pieza": nuevo.id})
    assert r.status_code == 200
    h = HistorialPieza.objects.get()
    assert h.usuario == investigador
    assert h.campo_modificado == "tipo_pieza"


def test_no_se_filtra_usuario_entre_peticiones(api_investigador, administrador):
    # Un cambio hecho fuera de una petición HTTP no hereda el usuario de otra anterior.
    pieza = PiezaFactory(nombre="A")
    api_investigador.patch(f"/api/v1/piezas/{pieza.id}/", {"nombre": "B"})
    pieza.refresh_from_db()
    pieza.nombre = "C"
    pieza.save()
    ultimo = HistorialPieza.objects.order_by("-id").first()
    assert ultimo.valor_nuevo == "C" and ultimo.usuario is None


def test_delete_logico_registra_activo(api_admin, administrador):
    pieza = PiezaFactory()
    api_admin.delete(f"/api/v1/piezas/{pieza.id}/")
    h = HistorialPieza.objects.get()
    assert (h.campo_modificado, h.valor_nuevo, h.usuario) == ("activo", "No", administrador)


def test_historial_endpoint_solo_lectura(api_investigador, investigador):
    pieza = PiezaFactory(nombre="Antes")
    api_investigador.patch(f"/api/v1/piezas/{pieza.id}/", {"nombre": "Después"})
    r = api_investigador.get(f"/api/v1/piezas/{pieza.id}/historial/")
    assert r.status_code == 200
    assert r.data["count"] == 1
    assert r.data["results"][0]["usuario"] == investigador.username
    assert api_investigador.post(f"/api/v1/piezas/{pieza.id}/historial/", {}).status_code == 405


def test_admin_django_registra_usuario_de_sesion(client, administrador):
    pieza = PiezaFactory(nombre="Antes")
    administrador.set_password("clave-segura-123")
    administrador.save()
    client.login(username=administrador.username, password="clave-segura-123")
    from apps.nucleo import contexto
    from apps.nucleo.middleware import UsuarioActualMiddleware

    def vista(request):
        pieza.nombre = "Desde admin"
        pieza.save()
        return None

    peticion = type("R", (), {"user": administrador})()
    UsuarioActualMiddleware(vista)(peticion)
    assert HistorialPieza.objects.get().usuario == administrador
    assert contexto.usuario_actual() is None
