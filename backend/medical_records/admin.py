# admin.py
# Explanatory Comments:
# - Added list_display for key fields in admin.
# - Added search_fields for quick lookup.
# - Added list_filter for easy filtering.
# - Set readonly_fields for non-editable fields (e.g., created_at).
# - Ensured all models are registered.

from django.contrib import admin
from .models import Patient, VitalReading, MedicalReport, TimelineEvent, Visit, ConsultationRoom, ConsultationSession

@admin.register(ConsultationRoom)
class ConsultationRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'assigned_doctor', 'current_patient', 'start_time')
    list_filter = ('status',)
    search_fields = ('name', 'assigned_doctor__name')

@admin.register(ConsultationSession)
class ConsultationSessionAdmin(admin.ModelAdmin):
    list_display = ('room', 'doctor', 'patient', 'start_time', 'status')
    list_filter = ('status', 'room')
    search_fields = ('room__name', 'doctor__name', 'patient__name')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'surname', 'first_name', 'personal_number', 'patient_type', 'created_at')
    list_filter = ('patient_type', 'gender', 'marital_status')
    search_fields = ('surname', 'first_name', 'personal_number', 'patient_id')
    readonly_fields = ('patient_id', 'created_at', 'updated_at')

@admin.register(VitalReading)
class VitalReadingAdmin(admin.ModelAdmin):
    list_display = ('patient', 'date', 'systolic', 'diastolic', 'heart_rate', 'blood_sugar')
    list_filter = ('date',)
    search_fields = ('patient__surname', 'patient__first_name')

@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ('patient', 'report_name', 'report_type', 'date', 'doctor', 'status')
    list_filter = ('status', 'report_type', 'date')
    search_fields = ('patient__surname', 'patient__first_name', 'report_name')

@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('patient', 'date', 'time', 'type', 'title', 'status')
    list_filter = ('type', 'status', 'date')
    search_fields = ('patient__surname', 'patient__first_name', 'title')

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('patient', 'visit_date', 'visit_time', 'clinic', 'status', 'priority')
    list_filter = ('status', 'priority', 'clinic', 'visit_date')
    search_fields = ('patient__surname', 'patient__first_name')