# emr/urls.py
# Explanatory Comments:
# - Added media serving for patient photos.
# - Included medical_records.urls for API endpoints.
# - Kept admin URL for Django admin access.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('medical_records.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)