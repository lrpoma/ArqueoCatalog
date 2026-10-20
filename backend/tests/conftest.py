import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from tests.factories import CapaFactory, PiezaFactory, UsuarioFactory


@pytest.fixture(autouse=True)
def limpiar_throttling():
    cache.clear()


@pytest.fixture
def investigador(db):
    return UsuarioFactory(rol="investigador")


@pytest.fixture
def administrador(db):
    return UsuarioFactory(rol="administrador")


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def api_investigador(api, investigador):
    api.force_authenticate(investigador)
    return api


@pytest.fixture
def api_admin(administrador):
    cliente = APIClient()
    cliente.force_authenticate(administrador)
    return cliente


@pytest.fixture
def capa(db):
    return CapaFactory()


@pytest.fixture
def pieza(db):
    return PiezaFactory()
