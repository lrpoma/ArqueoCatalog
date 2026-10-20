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

# (nombre, lat, lon, periodo, estado, [(capa, desde, hasta)])
YACIMIENTOS = [
    (
        "Tiwanaku - Akapana",
        -16.5547,
        -68.6733,
        "Tiwanaku",
        "en_excavacion",
        [("C-01", 0.0, 0.4), ("C-02", 0.4, 1.1), ("C-03", 1.1, 2.0)],
    ),
    (
        "Isla del Sol - Chincana",
        -16.0189,
        -69.1500,
        "Inca",
        "en_estudio",
        [("C-01", 0.0, 0.3), ("C-02", 0.3, 0.9)],
    ),
    (
        "Iwawe",
        -16.6350,
        -68.7060,
        "Formativo",
        "en_exploracion",
        [("C-01", 0.0, 0.5)],
    ),
    (
        "Lukurmata",
        -16.3750,
        -68.6330,
        "Señoríos Aymaras",
        "cerrado",
        [("C-01", 0.0, 0.6), ("C-02", 0.6, 1.4)],
    ),
]

# (nombre, tipo, material, periodo, etiqueta, yacimiento, capa, pública)
PIEZAS = [
    ("Vaso ceremonial (kero)", "Cerámica", "Arcilla", "Tiwanaku", "Ceremonial",
     "Tiwanaku - Akapana", "C-01", True),
    ("Cuenco con decoración felina", "Cerámica", "Arcilla", "Tiwanaku", "Ceremonial",
     "Tiwanaku - Akapana", "C-02", True),
    ("Punta de proyectil", "Lítico", "Obsidiana", "Tiwanaku", "Doméstico",
     "Tiwanaku - Akapana", "C-02", False),
    ("Fragmento textil policromo", "Textil", "Fibra de camélido", "Tiwanaku", "En restauración",
     "Tiwanaku - Akapana", "C-03", True),
    ("Tupu de plata", "Metal", "Plata", "Inca", "Funerario",
     "Isla del Sol - Chincana", "C-01", True),
    ("Aríbalo inca", "Cerámica", "Arcilla", "Inca", "Ceremonial",
     "Isla del Sol - Chincana", "C-02", False),
    ("Figurilla de llama", "Metal", "Aleación de cobre", "Inca", None,
     "Isla del Sol - Chincana", "C-02", True),
    ("Hacha de piedra pulida", "Lítico", "Basalto", "Formativo", "Doméstico",
     "Iwawe", "C-01", True),
    ("Tiesto con engobe rojo", "Cerámica", "Arcilla", "Formativo", None,
     "Iwawe", "C-01", False),
    ("Hueso trabajado (tubo)", "Hueso", "Hueso de camélido", "Señoríos Aymaras", "Funerario",
     "Lukurmata", "C-02", True),
    ("Olla globular", "Cerámica", "Arcilla", "Señoríos Aymaras", "Doméstico",
     "Lukurmata", "C-01", True),
]


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

        capas = {}
        for nombre, lat, lon, periodo, estado, lista_capas in YACIMIENTOS:
            yacimiento, _ = Yacimiento.objects.get_or_create(
                nombre=nombre,
                defaults={
                    "latitud": lat,
                    "longitud": lon,
                    "periodo_cultural": periodos[periodo],
                    "estado": estado,
                    "investigador_responsable": investigador,
                },
            )
            for codigo, desde, hasta in lista_capas:
                capas[(nombre, codigo)] = CapaEstratigrafica.objects.get_or_create(
                    yacimiento=yacimiento,
                    codigo=codigo,
                    defaults={"profundidad_desde": desde, "profundidad_hasta": hasta},
                )[0]

        for nombre, tipo, material, periodo, etiqueta, yac, capa, publica in PIEZAS:
            if Pieza.objects.filter(nombre=nombre).exists():
                continue
            Pieza.objects.create(
                nombre=nombre,
                tipo_pieza=tipos[tipo],
                material=material,
                periodo_cultural=periodos[periodo],
                etiqueta=Etiqueta.objects.get(nombre=etiqueta) if etiqueta else None,
                capa=capas[(yac, capa)],
                publica=publica,
                usuario_registro=investigador,
            )

        self.stdout.write(self.style.SUCCESS("Datos de ejemplo cargados."))
        if creado_admin or creado_inv:
            self.stdout.write(
                f"Usuarios admin / investigador creados con la contraseña: {password}"
            )
