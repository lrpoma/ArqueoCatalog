import re

import pytest
from django.db import IntegrityError
from django.utils import timezone

from apps.piezas.models import Pieza
from tests.factories import CapaFactory, EtiquetaFactory, PiezaFactory, UsuarioFactory

pytestmark = pytest.mark.django_db


def test_codigo_autogenerado_con_formato():
    pieza = PiezaFactory()
    assert re.fullmatch(rf"ARQ-{timezone.now().year}-0001", pieza.codigo)


def test_codigo_secuencial_y_unico():
    codigos = [PiezaFactory().codigo for _ in range(3)]
    assert [c.rsplit("-", 1)[1] for c in codigos] == ["0001", "0002", "0003"]


def test_codigo_no_cambia_al_editar():
    pieza = PiezaFactory()
    codigo = pieza.codigo
    pieza.nombre = "Otro nombre"
    pieza.save()
    assert Pieza.objects.get(pk=pieza.pk).codigo == codigo


def test_procedencia_por_capa_sin_columna_yacimiento():
    pieza = PiezaFactory()
    assert pieza.capa.yacimiento is not None
    assert "yacimiento" not in {f.name for f in Pieza._meta.get_fields()}


def test_etiqueta_es_opcional():
    assert PiezaFactory(etiqueta=None).etiqueta is None
    assert PiezaFactory(etiqueta=EtiquetaFactory()).etiqueta is not None


def test_codigo_de_capa_unico_por_yacimiento():
    capa = CapaFactory(codigo="C-01")
    with pytest.raises(IntegrityError):
        CapaFactory(yacimiento=capa.yacimiento, codigo="C-01")


def test_rol_define_acceso_al_admin():
    assert UsuarioFactory(rol="administrador").is_staff is True
    assert UsuarioFactory(rol="investigador").is_staff is False


def test_superusuario_nace_administrador():
    from apps.usuarios.models import Usuario

    su = Usuario.objects.create_superuser("root", password="x-12345678")
    assert su.rol == Usuario.Rol.ADMINISTRADOR


def test_health(client):
    respuesta = client.get("/api/v1/health/")
    assert respuesta.status_code == 200
    assert respuesta.json() == {"estado": "ok"}
