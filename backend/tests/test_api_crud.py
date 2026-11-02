import pytest

from tests.factories import (
    CapaFactory,
    EtiquetaFactory,
    PeriodoFactory,
    PiezaFactory,
    TipoPiezaFactory,
    YacimientoFactory,
)

pytestmark = pytest.mark.django_db


def datos_yacimiento(**extra):
    return {
        "nombre": "Nuevo sitio",
        "latitud": -16.5,
        "longitud": -68.1,
        "periodo_cultural": PeriodoFactory().id,
        "estado": "en_exploracion",
        **extra,
    }


def test_crear_yacimiento_asigna_responsable(api_investigador, investigador):
    r = api_investigador.post("/api/v1/yacimientos/", datos_yacimiento())
    assert r.status_code == 201
    assert r.data["investigador_responsable"] == investigador.id
    assert r.data["activo"] is True


def test_yacimiento_no_acepta_activo_ni_responsable_en_el_cuerpo(api_investigador, investigador):
    otro = YacimientoFactory().investigador_responsable
    r = api_investigador.post(
        "/api/v1/yacimientos/",
        datos_yacimiento(activo=False, investigador_responsable=otro.id),
    )
    assert r.status_code == 201
    assert r.data["activo"] is True
    assert r.data["investigador_responsable"] == investigador.id


def test_yacimiento_valida_coordenadas(api_investigador):
    r = api_investigador.post("/api/v1/yacimientos/", datos_yacimiento(latitud=120))
    assert r.status_code == 400 and "latitud" in r.data


def test_filtros_y_busqueda_de_yacimientos(api_investigador):
    periodo = PeriodoFactory()
    YacimientoFactory(nombre="Akapana", periodo_cultural=periodo, estado="en_estudio")
    YacimientoFactory(nombre="Pumapunku")
    r = api_investigador.get(f"/api/v1/yacimientos/?periodo_cultural={periodo.id}")
    assert [y["nombre"] for y in r.data["results"]] == ["Akapana"]
    assert api_investigador.get("/api/v1/yacimientos/?search=puma").data["count"] == 1
    assert api_investigador.get("/api/v1/yacimientos/?estado=en_estudio").data["count"] == 1


def test_crud_de_capas_anidadas(api_investigador):
    yac = YacimientoFactory()
    url = f"/api/v1/yacimientos/{yac.id}/capas/"
    r = api_investigador.post(
        url, {"codigo": "C-01", "profundidad_desde": 0, "profundidad_hasta": 0.5}
    )
    assert r.status_code == 201 and r.data["yacimiento"] == yac.id
    capa_id = r.data["id"]
    r = api_investigador.patch(f"{url}{capa_id}/", {"descripcion": "Arcilla roja"})
    assert r.status_code == 200 and r.data["descripcion"] == "Arcilla roja"
    assert api_investigador.get(url).data["count"] == 1


def test_capa_codigo_duplicado_400(api_investigador):
    capa = CapaFactory(codigo="C-01")
    r = api_investigador.post(
        f"/api/v1/yacimientos/{capa.yacimiento_id}/capas/",
        {"codigo": "C-01", "profundidad_desde": 1, "profundidad_hasta": 2},
    )
    assert r.status_code == 400 and "codigo" in r.data


def test_capa_profundidad_invalida_400(api_investigador):
    yac = YacimientoFactory()
    r = api_investigador.post(
        f"/api/v1/yacimientos/{yac.id}/capas/",
        {"codigo": "C-9", "profundidad_desde": 2, "profundidad_hasta": 1},
    )
    assert r.status_code == 400 and "profundidad_hasta" in r.data


def test_capa_de_otro_yacimiento_no_es_accesible(api_investigador):
    capa = CapaFactory()
    otro = YacimientoFactory()
    assert (
        api_investigador.get(f"/api/v1/yacimientos/{otro.id}/capas/{capa.id}/").status_code == 404
    )


def datos_pieza(capa, **extra):
    return {
        "nombre": "Vaso",
        "tipo_pieza": TipoPiezaFactory().id,
        "periodo_cultural": PeriodoFactory().id,
        "capa": capa.id,
        **extra,
    }


def test_crear_pieza_genera_codigo_y_usuario(api_investigador, investigador, capa):
    r = api_investigador.post("/api/v1/piezas/", datos_pieza(capa))
    assert r.status_code == 201
    assert r.data["codigo"].startswith("ARQ-") and r.data["codigo"].endswith("-0001")
    assert r.data["usuario_registro"] == investigador.id
    assert r.data["yacimiento"] == capa.yacimiento_id
    assert r.data["publica"] is False


def test_codigo_y_activo_no_se_pueden_forzar(api_investigador, capa):
    r = api_investigador.post("/api/v1/piezas/", datos_pieza(capa, codigo="ARQ-1-1", activo=False))
    assert r.status_code == 201
    assert r.data["codigo"] != "ARQ-1-1" and r.data["activo"] is True


def test_pieza_no_acepta_capa_inactiva(api_investigador):
    capa = CapaFactory(activo=False)
    r = api_investigador.post("/api/v1/piezas/", datos_pieza(capa))
    assert r.status_code == 400 and "capa" in r.data


def test_etiqueta_opcional_en_api(api_investigador, capa):
    r = api_investigador.post("/api/v1/piezas/", datos_pieza(capa, etiqueta=EtiquetaFactory().id))
    assert r.status_code == 201 and r.data["etiqueta"] is not None
    r = api_investigador.post("/api/v1/piezas/", datos_pieza(capa))
    assert r.data["etiqueta"] is None


def test_filtros_de_piezas(api_investigador):
    capa = CapaFactory()
    tipo, etiqueta = TipoPiezaFactory(), EtiquetaFactory()
    PiezaFactory(nombre="Kero rojo", tipo_pieza=tipo, etiqueta=etiqueta, capa=capa, publica=True)
    PiezaFactory(nombre="Punta lítica")
    get = lambda q: api_investigador.get(f"/api/v1/piezas/?{q}").data["count"]  # noqa: E731
    assert get(f"tipo_pieza={tipo.id}") == 1
    assert get(f"etiqueta={etiqueta.id}") == 1
    assert get(f"capa={capa.id}") == 1
    assert get(f"yacimiento={capa.yacimiento_id}") == 1
    assert get("publica=true") == 1
    assert get("search=kero") == 1
    assert get("") == 2


def test_listados_paginados(api_investigador):
    for _ in range(25):
        PiezaFactory()
    r = api_investigador.get("/api/v1/piezas/")
    assert r.data["count"] == 25 and len(r.data["results"]) == 20 and r.data["next"]
