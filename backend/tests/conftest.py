import pytest

from tests.factories import CapaFactory, PiezaFactory, UsuarioFactory


@pytest.fixture
def investigador(db):
    return UsuarioFactory(rol="investigador")


@pytest.fixture
def administrador(db):
    return UsuarioFactory(rol="administrador")


@pytest.fixture
def capa(db):
    return CapaFactory()


@pytest.fixture
def pieza(db):
    return PiezaFactory()
