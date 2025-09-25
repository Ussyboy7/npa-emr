# medical_records/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConsultationRoomViewSet, PatientViewSet, VitalReadingViewSet, MedicalReportViewSet, 
    TimelineEventViewSet, VisitViewSet, ConsultationSessionViewSet,
    MedicationViewSet, PrescriptionViewSet, PrescriptionItemViewSet,
    PharmacyQueueViewSet, StockTransactionViewSet
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'vitals', VitalReadingViewSet, basename='vital')
router.register(r'reports', MedicalReportViewSet, basename='report')
router.register(r'timeline', TimelineEventViewSet, basename='timeline')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'rooms', ConsultationRoomViewSet, basename='room')
router.register(r'sessions', ConsultationSessionViewSet, basename='session')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'prescription-items', PrescriptionItemViewSet, basename='prescription-item')
router.register(r'pharmacy-queue', PharmacyQueueViewSet, basename='pharmacy-queue')
router.register(r'stock-transactions', StockTransactionViewSet, basename='stock-transaction')

urlpatterns = [
    path('', include(router.urls)),
]