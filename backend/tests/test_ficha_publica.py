import pytest

from tests.factories import PiezaFactory

pytestmark = pytest.mark.django_db


def url(codigo):
    return f"/api/v1/public/piezas/{codigo}/"


def test_ficha_publica_200(client):
    pieza = PiezaFactory(publica=True, nombre="Vaso kero")
    r = client.get(url(pieza.codigo))
    assert r.status_code == 200
    assert "Vaso kero" in r.content.decode()


def test_ficha_no_publica_403_sin_datos(client):
    pieza = PiezaFactory(publica=False, nombre="Secreto", descripcion="Reservado")
    r = client.get(url(pieza.codigo))
    html = r.content.decode()
    assert r.status_code == 403
    assert "Ficha restringida por la institución" in html
    assert "Secreto" not in html and "Reservado" not in html


def test_ficha_codigo_inexistente_404(client):
    assert client.get(url("ARQ-1999-9999")).status_code == 404


def test_pieza_inactiva_no_visible(client):
    pieza = PiezaFactory(publica=True, activo=False, nombre="Baja")
    r = client.get(url(pieza.codigo))
    assert r.status_code == 403
    assert "Baja" not in r.content.decode()


def test_inicio(client):
    assert client.get("/").status_code == 200

