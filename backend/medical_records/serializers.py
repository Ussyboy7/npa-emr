# serializers.py
# Explanatory Comments:
# - Added read-only fields for computed data (e.g., patient_name).
# - Included related fields in PatientDetailSerializer for nested data.
# - Added validation for required fields in create/update.
# - Ensured fields match frontend expectations (e.g., photo_url).
# - Added error messages for better feedback.
# - Added ConsultationRoomSerializer and ConsultationSessionSerializer.
# - VitalsSerializer aligned with frontend VitalsData, using bodymassindex.

from rest_framework import serializers
from .models import Patient, VitalReading, MedicalReport, TimelineEvent, Visit, ConsultationRoom, ConsultationSession
from django.utils import timezone
from django.core.exceptions import ValidationError

class ConsultationRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationRoom
        fields = '__all__'

    def validate(self, data):
        if data.get('status') == 'occupied' and not data.get('assigned_doctor'):
            raise ValidationError({"assigned_doctor": "Assigned doctor is required for occupied rooms."})
        return data

class ConsultationSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationSession
        fields = '__all__'

    def validate(self, data):
        if data.get('start_time') > timezone.now():
            raise ValidationError({"start_time": "Start time cannot be in the future."})
        return data

class VitalReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalReading
        fields = '__all__'

    def validate(self, data):
        if data.get('systolic') and data['systolic'] < 0:
            raise ValidationError({"systolic": "Systolic pressure cannot be negative."})
        return data

class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = '__all__'

    def validate_date(self, value):
        if value > timezone.now().date():
            raise ValidationError("Report date cannot be in the future.")
        return value

class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = '__all__'

class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.surname', read_only=True)
    personal_number = serializers.CharField(source='patient.personal_number', read_only=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def validate_visit_date(self, value):
        if value < timezone.now().date():
            raise ValidationError("Visit date cannot be in the past.")
        return value

class PatientSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_photo_url(self, obj):
        return obj.photo.url if obj.photo else None

    def validate(self, data):
        if data.get('patient_type') in ['Employee', 'Retiree'] and not data.get('personal_number'):
            raise ValidationError({"personal_number": "Personal number is required for Employee or Retiree."})
        if data.get('patient_type') == 'Dependent' and not data.get('sponsor_id'):
            raise ValidationError({"sponsor_id": "Sponsor ID is required for Dependents."})
        return data

class PatientDetailSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    vitals = VitalReadingSerializer(many=True, read_only=True)
    reports = MedicalReportSerializer(many=True, read_only=True)
    visits = VisitSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'

    def get_photo_url(self, obj):
        return obj.photo.url if obj.photo else None