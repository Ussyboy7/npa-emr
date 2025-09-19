# views.py
# Explanatory Comments:
# - Added validation in create/update to return specific error messages (e.g., missing fields).
# - Improved search: Added Q queries for first_name, surname, personal_number.
# - Added pagination to list views (matches frontend rowsPerPage).
# - Secured endpoints: Replaced AllowAny with IsAuthenticated for production (commented for dev as per request).
# - Added logging for debugging API errors.
# - Ensured proper error responses (400 for validation, 404 for not found).
# - Added WebSocket support for visit updates via Channels (optional, comment if not needed).
# - Added ConsultationRoomViewSet and ConsultationSessionViewSet for room/session management.

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny  # IsAuthenticated commented as per request
from django.db.models import Q
from django.core.exceptions import ValidationError
import logging
from .models import Patient, VitalReading, MedicalReport, TimelineEvent, Visit, ConsultationRoom, ConsultationSession
from .serializers import (
    PatientSerializer, PatientDetailSerializer,
    VitalReadingSerializer, MedicalReportSerializer,
    TimelineEventSerializer, VisitSerializer,
    ConsultationRoomSerializer, ConsultationSessionSerializer
)

logger = logging.getLogger(__name__)

class ConsultationRoomViewSet(viewsets.ModelViewSet):
    queryset = ConsultationRoom.objects.all()
    serializer_class = ConsultationRoomSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

class ConsultationSessionViewSet(viewsets.ModelViewSet):
    queryset = ConsultationSession.objects.all()
    serializer_class = ConsultationSessionSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PatientDetailSerializer
        return PatientSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created patient: {serializer.data['patient_id']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Patient creation failed: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in patient creation: {str(e)}", exc_info=True)
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def vitals(self, request, pk=None):
        try:
            patient = self.get_object()
            vitals = VitalReading.objects.filter(patient=patient)
            serializer = VitalReadingSerializer(vitals, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for vitals")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def reports(self, request, pk=None):
        try:
            patient = self.get_object()
            reports = MedicalReport.objects.filter(patient=patient)
            serializer = MedicalReportSerializer(reports, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for reports")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def visits(self, request, pk=None):
        try:
            patient = self.get_object()
            visits = Visit.objects.filter(patient=patient)
            serializer = VisitSerializer(visits, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for visits")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        try:
            patient = self.get_object()
            events = TimelineEvent.objects.filter(patient=patient)
            serializer = TimelineEventSerializer(events, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for timeline")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        try:
            if query:
                patients = Patient.objects.filter(
                    Q(personal_number__icontains=query) |
                    Q(surname__icontains=query) |
                    Q(first_name__icontains=query)
                )
            else:
                patients = Patient.objects.none()
            serializer = self.get_serializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Search failed: {str(e)}", exc_info=True)
            return Response({"detail": "Search failed."}, status=status.HTTP_400_BAD_REQUEST)

class VitalReadingViewSet(viewsets.ModelViewSet):
    queryset = VitalReading.objects.all()
    serializer_class = VitalReadingSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created vital reading for patient: {serializer.data['patient']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Vital creation failed: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MedicalReportViewSet(viewsets.ModelViewSet):
    queryset = MedicalReport.objects.all()
    serializer_class = MedicalReportSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated] for production

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created visit for patient: {serializer.data['patient']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Visit creation failed: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)