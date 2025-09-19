"""
ASGI config for emr project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import medical_records.routing  # We'll create this later

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emr.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            medical_records.routing.websocket_urlpatterns
        )
    ),
})