"""Validación y limpieza de fotografías de piezas.

Toda imagen subida se decodifica y se vuelve a codificar desde cero: así se eliminan
los metadatos EXIF (incluido el GPS) y se descarta cualquier contenido que no sea imagen.
"""

import uuid
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

TAMANO_MAXIMO = 5 * 1024 * 1024  # 5 MB
FORMATOS_PERMITIDOS = {"JPEG", "PNG", "WEBP"}
LADO_MAXIMO = 2048
LADO_MINIATURA = 400


def _a_jpeg(imagen, lado_maximo):
    """Copia sin metadatos, en RGB y limitada a `lado_maximo`, codificada como JPEG."""
    copia = imagen.copy()
    copia.thumbnail((lado_maximo, lado_maximo))
    if copia.mode in ("RGBA", "LA", "P"):
        # Las transparencias se aplanan sobre blanco (JPEG no tiene canal alfa).
        copia = copia.convert("RGBA")
        fondo = Image.new("RGB", copia.size, (255, 255, 255))
        fondo.paste(copia, mask=copia.getchannel("A"))
        copia = fondo
    else:
        copia = copia.convert("RGB")
    salida = BytesIO()
    copia.save(salida, format="JPEG", quality=85, optimize=True)  # sin parámetro exif
    return salida.getvalue()


def procesar_fotografia(archivo):
    """Valida `archivo` y devuelve (foto, miniatura) como `ContentFile` JPEG sin EXIF."""
    if archivo.size > TAMANO_MAXIMO:
        raise ValidationError(
            {"archivo": f"La imagen supera el máximo de {TAMANO_MAXIMO // (1024 * 1024)} MB."}
        )
    try:
        with Image.open(archivo) as imagen:
            if imagen.format not in FORMATOS_PERMITIDOS:
                raise ValidationError({"archivo": "Formato no permitido. Use JPEG, PNG o WebP."})
            imagen.load()
            # Respeta la orientación del EXIF antes de descartarlo.
            imagen = ImageOps.exif_transpose(imagen)
            foto = _a_jpeg(imagen, LADO_MAXIMO)
            miniatura = _a_jpeg(imagen, LADO_MINIATURA)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise ValidationError({"archivo": "El archivo no es una imagen válida."}) from None

    nombre = f"{uuid.uuid4().hex}.jpg"  # nunca se conserva el nombre original
    return ContentFile(foto, name=nombre), ContentFile(miniatura, name=nombre)
