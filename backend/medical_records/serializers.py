from rest_framework import serializers
from .models import (
    Patient, VitalReading, MedicalReport, TimelineEvent, Visit, 
    ConsultationRoom, ConsultationSession,
    Medication, MedicationBatch, Prescription, PrescriptionItem, 
    PharmacyQueue, StockTransaction
)
from django.utils import timezone
from django.core.exceptions import ValidationError

class ConsultationRoomSerializer(serializers.ModelSerializer):
    current_patient_name = serializers.CharField(source='current_patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
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
    doctor_name = serializers.CharField(source='assigned_doctor.get_full_name', read_only=True)
    consultation_room_name = serializers.CharField(source='consultation_room.name', read_only=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def validate_visit_date(self, value):
        if value < timezone.now().date():
            raise ValidationError("Visit date cannot be in the past.")
        return value

class PatientSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    sponsor_name = serializers.CharField(source='sponsor.first_name', read_only=True)
    
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
    dependents = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_photo_url(self, obj):
        return obj.photo.url if obj.photo else None
    
    def get_dependents(self, obj):
        dependents = Patient.objects.filter(patient_type='Dependent', sponsor_id=obj.id)
        return PatientSerializer(dependents, many=True).data

# PHARMACY SERIALIZER
class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

    def validate(self, data):
        # Ensure required fields are provided
        required_fields = ['name', 'category', 'strength', 'dosage_form', 'manufacturer', 'supplier', 'location']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                raise serializers.ValidationError({field: f"{field.replace('_', ' ').title()} is required."})

        # Validate category
        if data.get('category') not in dict(Medication.CATEGORIES):
            raise serializers.ValidationError({"category": f"Invalid category. Must be one of: {', '.join([c[0] for c in Medication.CATEGORIES])}"})

        # Validate numeric fields
        if data.get('pack_size', 1) <= 0:
            raise serializers.ValidationError({"pack_size": "Pack size must be a positive integer."})
        if data.get('minimum_stock', 0) < 0:
            raise serializers.ValidationError({"minimum_stock": "Minimum stock cannot be negative."})
        if data.get('maximum_stock', 0) < 0:
            raise serializers.ValidationError({"maximum_stock": "Maximum stock cannot be negative."})

        return data

class MedicationBatchSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    
    class Meta:
        model = MedicationBatch
        fields = '__all__'

class PrescriptionItemDetailSerializer(serializers.ModelSerializer):
    medication_details = MedicationSerializer(source='medication', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    frequency_display = serializers.CharField(source='frequency', read_only=True)
    route_display = serializers.CharField(source='route', read_only=True)
    dispensed_by_name = serializers.CharField(source='dispensed_by.name', read_only=True)
    substituted_with_details = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionItem
        fields = '__all__'
    
    def get_substituted_with_details(self, obj):
        if obj.substituted_with:
            return {
                'name': obj.substituted_with.name,
                'strength': obj.substituted_with.strength,
                'reason': 'Stock unavailable',  # You might want to add this field to your model
                'approved_by': obj.dispensed_by.name if obj.dispensed_by else 'System'
            }
        return None

class PrescriptionDetailSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField()
    prescribed_by_name = serializers.CharField(read_only=True)
    visit_details = serializers.SerializerMethodField()
    items = PrescriptionItemDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Prescription
        fields = '__all__'
    
    def get_patient_details(self, obj):
        patient = obj.visit.patient
        return {
            'id': str(patient.id),
            'name': f"{patient.first_name} {patient.surname}",
            'age': patient.age or 0,
            'gender': patient.gender or 'Unknown',
            'mrn': patient.patient_id or 'N/A',
            'allergies': [],  # You might want to add this field to your Patient model
            'phone_number': patient.phone or 'N/A',
            'employee_category': patient.patient_type,
            'location': patient.location or 'N/A'
        }
    
    def get_visit_details(self, obj):
        visit = obj.visit
        return {
            'consultation_room': {
                'name': visit.consultation_room.name if visit.consultation_room else None
            } if visit.consultation_room else None,
            'special_instructions': visit.special_instructions
        }

class PharmacyQueueSerializer(serializers.ModelSerializer):
    prescription_details = PrescriptionDetailSerializer(source='prescription', read_only=True)
    assigned_pharmacist_name = serializers.CharField(source='assigned_pharmacist.name', read_only=True)
    
    class Meta:
        model = PharmacyQueue
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    visit_id = serializers.CharField(source='visit.id', read_only=True)
    patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    prescribed_by_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Prescription
        fields = '__all__'

class PrescriptionItemSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    substituted_with_name = serializers.CharField(source='substituted_with.name', read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = '__all__'

class StockTransactionSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.name', read_only=True)
    visit_id = serializers.CharField(source='visit.id', read_only=True)
    prescription_id = serializers.CharField(source='prescription.id', read_only=True)
    
    class Meta:
        model = StockTransaction
        fields = '__all__'