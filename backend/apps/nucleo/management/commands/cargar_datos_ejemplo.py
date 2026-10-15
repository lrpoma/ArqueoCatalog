from django.core.management.base import BaseCommand
from django.db import transaction

from apps.catalogos.models import Etiqueta, PeriodoCultural, TipoPieza
from apps.piezas.models import Pieza
from apps.usuarios.models import Institucion, Usuario
from apps.yacimientos.models import CapaEstratigrafica, Yacimiento

INSTITUCIONES = [
    ("Museo Nacional de Arqueología (Tiwanaku)", "museo", "La Paz"),
    ("Universidad Mayor de San Andrés", "universidad", "La Paz"),
]
PERIODOS = [
    ("Formativo", -1500, 200),
    ("Tiwanaku", 500, 1100),
    ("Señoríos Aymaras", 1100, 1450),
    ("Inca", 1450, 1532),
]
TIPOS = ["Cerámica", "Lítico", "Textil", "Metal", "Hueso"]
ETIQUETAS = ["Ceremonial", "Doméstico", "Funerario", "En restauración"]


class Command(BaseCommand):
    help = "Carga catálogos, instituciones, usuarios y registros de ejemplo (idempotente)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password", default="cambiar-123", help="Contraseña de los usuarios de ejemplo"
        )

    @transaction.atomic
    def handle(self, *args, password, **options):
        instituciones = [
            Institucion.objects.get_or_create(nombre=n, defaults={"tipo": t, "ciudad": c})[0]
            for n, t, c in INSTITUCIONES
        ]
        periodos = {
            n: PeriodoCultural.objects.get_or_create(
                nombre=n, defaults={"anio_inicio": i, "anio_fin": f}
            )[0]
            for n, i, f in PERIODOS
        }
        tipos = {n: TipoPieza.objects.get_or_create(nombre=n)[0] for n in TIPOS}
        for nombre in ETIQUETAS:
            Etiqueta.objects.get_or_create(nombre=nombre)

        admin, creado_admin = Usuario.objects.get_or_create(
            username="admin",
            defaults={"rol": Usuario.Rol.ADMINISTRADOR, "institucion": instituciones[1]},
        )
        investigador, creado_inv = Usuario.objects.get_or_create(
            username="investigador",
            defaults={"rol": Usuario.Rol.INVESTIGADOR, "institucion": instituciones[0]},
        )
        for usuario, creado in ((admin, creado_admin), (investigador, creado_inv)):
            if creado:
                usuario.set_password(password)
                usuario.save()

        yacimiento, _ = Yacimiento.objects.get_or_create(
            nombre="Tiwanaku - Akapana",
            defaults={
                "latitud": -16.5547,
                "longitud": -68.6733,
                "periodo_cultural": periodos["Tiwanaku"],
                "estado": Yacimiento.Estado.EN_EXCAVACION,
                "investigador_responsable": investigador,
            },
        )
        capa, _ = CapaEstratigrafica.objects.get_or_create(
            yacimiento=yacimiento,
            codigo="C-01",
            defaults={"profundidad_desde": 0.0, "profundidad_hasta": 0.4},
        )
        if not Pieza.objects.exists():
            Pieza.objects.create(
                nombre="Vaso ceremonial (kero)",
                tipo_pieza=tipos["Cerámica"],
                material="Arcilla",
                periodo_cultural=periodos["Tiwanaku"],
                etiqueta=Etiqueta.objects.get(nombre="Ceremonial"),
                capa=capa,
                publica=True,
                usuario_registro=investigador,
            )

        self.stdout.write(self.style.SUCCESS("Datos de ejemplo cargados."))
        if creado_admin or creado_inv:
            self.stdout.write(
                f"Usuarios admin / investigador creados con la contraseña: {password}"
            )
