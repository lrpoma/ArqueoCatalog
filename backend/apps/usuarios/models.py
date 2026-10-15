from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class Institucion(models.Model):
    class Tipo(models.TextChoices):
        MUSEO = "museo", "Museo"
        UNIVERSIDAD = "universidad", "Universidad"
        OTRO = "otro", "Otro"

    nombre = models.CharField(max_length=200, unique=True)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.OTRO)
    ciudad = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "institución"
        verbose_name_plural = "instituciones"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class UsuarioManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("rol", Usuario.Rol.ADMINISTRADOR)
        return super().create_superuser(username, email, password, **extra_fields)


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ADMINISTRADOR = "administrador", "Administrador"
        INVESTIGADOR = "investigador", "Investigador"

    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.INVESTIGADOR)
    institucion = models.ForeignKey(
        Institucion,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="usuarios",
    )

    objects = UsuarioManager()

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def save(self, *args, **kwargs):
        # /admin/ es solo para el rol Administrador.
        self.is_staff = self.rol == self.Rol.ADMINISTRADOR or self.is_superuser
        super().save(*args, **kwargs)

    @property
    def es_administrador(self):
        return self.rol == self.Rol.ADMINISTRADOR


class LogAcceso(models.Model):
    """Inicios de sesión exitosos. Se llena con la señal user_logged_in (Sprint 2)."""

    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name="accesos")
    fecha_hora = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        verbose_name = "log de acceso"
        verbose_name_plural = "log de accesos"
        ordering = ["-fecha_hora"]

    def __str__(self):
        return f"{self.usuario} · {self.fecha_hora:%Y-%m-%d %H:%M}"
