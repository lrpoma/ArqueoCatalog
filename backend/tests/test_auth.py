import pytest

from apps.usuarios.models import LogAcceso
from tests.factories import UsuarioFactory

pytestmark = pytest.mark.django_db
CLAVE = "clave-segura-123"


def crear(rol="investigador", **extra):
    usuario = UsuarioFactory(rol=rol, **extra)
    usuario.set_password(CLAVE)
    usuario.save()
    return usuario


def test_login_devuelve_tokens_y_perfil(api):
    usuario = crear()
    r = api.post("/api/v1/auth/login/", {"username": usuario.username, "password": CLAVE})
    assert r.status_code == 200
    assert {"access", "refresh"} <= set(r.data)
    assert r.data["usuario"]["rol"] == "investigador"
    assert r.data["usuario"]["institucion"]["nombre"] == usuario.institucion.nombre


def test_me_con_bearer(api):
    usuario = crear("administrador")
    token = api.post("/api/v1/auth/login/", {"username": usuario.username, "password": CLAVE}).data[
        "access"
    ]
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    r = api.get("/api/v1/auth/me/")
    assert r.status_code == 200
    assert r.data["username"] == usuario.username
    assert r.data["rol"] == "administrador"


def test_me_sin_token_401(api):
    assert api.get("/api/v1/auth/me/").status_code == 401


def test_refresh_entrega_nuevo_access(api):
    usuario = crear()
    refresh = api.post(
        "/api/v1/auth/login/", {"username": usuario.username, "password": CLAVE}
    ).data["refresh"]
    r = api.post("/api/v1/auth/refresh/", {"refresh": refresh})
    assert r.status_code == 200
    assert "access" in r.data


def test_login_exitoso_registra_acceso_con_ip(api):
    usuario = crear()
    api.post(
        "/api/v1/auth/login/",
        {"username": usuario.username, "password": CLAVE},
        REMOTE_ADDR="10.1.2.3",
    )
    acceso = LogAcceso.objects.get()
    assert acceso.usuario == usuario
    assert acceso.ip == "10.1.2.3"


def test_login_fallido_no_registra_acceso(api):
    usuario = crear()
    r = api.post("/api/v1/auth/login/", {"username": usuario.username, "password": "mala"})
    assert r.status_code == 401
    assert LogAcceso.objects.count() == 0


def test_login_en_admin_tambien_registra_acceso(client):
    usuario = crear("administrador")
    assert client.login(username=usuario.username, password=CLAVE)
    assert LogAcceso.objects.filter(usuario=usuario).count() == 1


def test_usuario_inactivo_no_entra(api):
    usuario = crear(is_active=False)
    r = api.post("/api/v1/auth/login/", {"username": usuario.username, "password": CLAVE})
    assert r.status_code == 401


def test_login_con_throttling(api):
    for _ in range(10):
        api.post("/api/v1/auth/login/", {"username": "x", "password": "y"})
    assert api.post("/api/v1/auth/login/", {"username": "x", "password": "y"}).status_code == 429
