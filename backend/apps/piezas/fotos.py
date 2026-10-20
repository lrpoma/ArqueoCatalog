import io
import uuid

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework import serializers

TAMANO_MAXIMO = 8 * 1024 * 1024
FORMATOS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
LADO_MAXIMO = 2000
LADO_MINIATURA = 400


def validar_imagen(archivo):
    """Comprueba tamaño y que sea realmente JPEG, PNG o WEBP (no solo la extensión)."""
    if archivo.size > TAMANO_MAXIMO:
        raise serializers.ValidationError("La imagen supera el máximo de 8 MB.")
    try:
        with Image.open(archivo) as imagen:
            imagen.verify()
            formato = imagen.format
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise serializers.ValidationError("El archivo no es una imagen válida.") from None
    finally:
        archivo.seek(0)
    if formato not in FORMATOS:
        raise serializers.ValidationError("Formato no permitido. Usa JPEG, PNG o WEBP.")


def _guardar(imagen, formato):
    buffer = io.BytesIO()
    if formato == "JPEG" and imagen.mode not in ("RGB", "L"):
        imagen = imagen.convert("RGB")
    imagen.save(buffer, format=formato, quality=85)
    return buffer.getvalue()


def procesar_imagen(archivo):
    """Devuelve (original, miniatura) como ContentFile, sin EXIF ni GPS.

    Se recrea la imagen solo con sus píxeles, así ningún metadato sobrevive.
    La orientación del EXIF se aplica antes de descartarlo.
    """
    with Image.open(archivo) as origen:
        formato = origen.format
        imagen = ImageOps.exif_transpose(origen)
        if imagen.mode not in ("RGB", "RGBA", "L"):
            imagen = imagen.convert("RGBA" if "transparency" in imagen.info else "RGB")
        imagen.thumbnail((LADO_MAXIMO, LADO_MAXIMO))
        limpia = Image.frombytes(imagen.mode, imagen.size, imagen.tobytes())
    miniatura = limpia.copy()
    miniatura.thumbnail((LADO_MINIATURA, LADO_MINIATURA))

    nombre = f"{uuid.uuid4().hex}.{FORMATOS[formato]}"
    return (
        ContentFile(_guardar(limpia, formato), name=nombre),
        ContentFile(_guardar(miniatura, formato), name=nombre),
    )
