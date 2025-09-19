# medical_records/urls.py
# Explanatory Comments:
# - Added URL patterns for all viewsets.
# - Used DefaultRouter for RESTful routing.
# - Ensured endpoints match frontend expectations (e.g., /patients/search/).

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultationRoomViewSet, PatientViewSet, VitalReadingViewSet, MedicalReportViewSet, TimelineEventViewSet, VisitViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'vitals', VitalReadingViewSet, basename='vital')
router.register(r'reports', MedicalReportViewSet, basename='report')
router.register(r'timeline', TimelineEventViewSet, basename='timeline')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'rooms', ConsultationRoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
]