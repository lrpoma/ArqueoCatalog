from rest_framework.negotiation import BaseContentNegotiation


class IgnorarAccept(BaseContentNegotiation):
    """Para vistas que devuelven un archivo (PNG, JPEG) directamente.

    Los visores de imágenes del celular envían cabeceras `Accept` variadas; sin esto
    DRF respondería 406 porque la vista no tiene un renderer para ese tipo.
    """

    def select_parser(self, request, parsers):
        return parsers[0]

    def select_renderer(self, request, renderers, format_suffix=None):
        return renderers[0], renderers[0].media_type
