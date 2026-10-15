import factory

from apps.catalogos.models import Etiqueta, PeriodoCultural, TipoPieza
from apps.piezas.models import Pieza
from apps.usuarios.models import Institucion, Usuario
from apps.yacimientos.models import CapaEstratigrafica, Yacimiento


class InstitucionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Institucion

    nombre = factory.Sequence(lambda n: f"Institución {n}")


class UsuarioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Usuario

    username = factory.Sequence(lambda n: f"usuario{n}")
    institucion = factory.SubFactory(InstitucionFactory)


class PeriodoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PeriodoCultural

    nombre = factory.Sequence(lambda n: f"Periodo {n}")
    anio_inicio = 500
    anio_fin = 1100


class TipoPiezaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TipoPieza

    nombre = factory.Sequence(lambda n: f"Tipo {n}")


class EtiquetaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Etiqueta

    nombre = factory.Sequence(lambda n: f"Etiqueta {n}")


class YacimientoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Yacimiento

    nombre = factory.Sequence(lambda n: f"Yacimiento {n}")
    latitud = -16.55
    longitud = -68.67
    periodo_cultural = factory.SubFactory(PeriodoFactory)
    investigador_responsable = factory.SubFactory(UsuarioFactory)


class CapaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CapaEstratigrafica

    yacimiento = factory.SubFactory(YacimientoFactory)
    codigo = factory.Sequence(lambda n: f"C-{n:02d}")
    profundidad_desde = 0.0
    profundidad_hasta = 0.5


class PiezaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pieza

    nombre = factory.Sequence(lambda n: f"Pieza {n}")
    tipo_pieza = factory.SubFactory(TipoPiezaFactory)
    periodo_cultural = factory.SubFactory(PeriodoFactory)
    capa = factory.SubFactory(CapaFactory)
    usuario_registro = factory.SubFactory(UsuarioFactory)
