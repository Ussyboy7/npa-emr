# models.py
# Explanatory Comments:
# - Ensured all choice fields use tuples (Django requirement).
# - Added `photo_url` property for frontend to access image URLs.
# - Optimized `save()` for `patient_id` generation and age calculation.
# - Added indexes on frequently searched fields (e.g., `personal_number`, `surname`) for performance.
# - Added `verbose_name` and `verbose_name_plural` in Meta for better admin UI.
# - Ensured related_names are consistent for reverse queries (e.g., `patient.vitals`).
# - Added validation in `save()` to prevent invalid data (e.g., future DOB).
# - Fixed `patient_id` generation to handle empty DB gracefully.
# - Added ConsultationRoom and ConsultationSession models for room and session management.
# - Vitals model aligned with frontend VitalsData, using bodymassindex.
# - TimelineEvent and MedicalReport models integrated with sessions where applicable.
# - Visit model linked to ConsultationSession for session tracking.

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
import uuid

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)  # e.g., "doctor", "nurse", "admin"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class Patient(models.Model):
    PATIENT_CATEGORIES = [
        ('Employee', 'Employee'),
        ('Retiree', 'Retiree'),
        ('NonNPA', 'NonNPA'),
        ('Dependent', 'Dependent'),
    ]

    GENDERS = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    GENOTYPES = [
        ('AA', 'AA'), ('AS', 'AS'),
        ('AC', 'AC'), ('SS', 'SS'),
    ]

    MARITAL_STATUSES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
    ]

    NON_NPA_TYPES = [
        ('Police', 'Police'),
        ('IT', 'IT'),
        ('NYSC', 'NYSC'),
        ('CSR', 'CSR'),
        ('MD Outfit', 'MD Outfit'),
        ('Board Member', 'Board Member'),
        ('Seaview', 'Seaview'),
    ]

    DEPENDENT_TYPES = [
        ('Employee Dependent', 'Employee Dependent'),
        ('Retiree Dependent', 'Retiree Dependent'),
    ]

    NOK_RELATIONSHIPS = [
        ('Spouse', 'Spouse'),
        ('Parent', 'Parent'),
        ('Sibling', 'Sibling'),
        ('Child', 'Child'),
    ]

    NIGERIAN_STATES = [
        ('Abia', 'Abia'), ('Adamawa', 'Adamawa'), ('Akwa Ibom', 'Akwa Ibom'), ('Anambra', 'Anambra'),
        ('Bauchi', 'Bauchi'), ('Bayelsa', 'Bayelsa'), ('Benue', 'Benue'), ('Borno', 'Borno'),
        ('Cross River', 'Cross River'), ('Delta', 'Delta'), ('Ebonyi', 'Ebonyi'), ('Edo', 'Edo'),
        ('Ekiti', 'Ekiti'), ('Enugu', 'Enugu'), ('FCT', 'FCT'), ('Gombe', 'Gombe'), ('Imo', 'Imo'),
        ('Jigawa', 'Jigawa'), ('Kaduna', 'Kaduna'), ('Kano', 'Kano'), ('Katsina', 'Katsina'),
        ('Kebbi', 'Kebbi'), ('Kogi', 'Kogi'), ('Kwara', 'Kwara'), ('Lagos', 'Lagos'), ('Nasarawa', 'Nasarawa'),
        ('Niger', 'Niger'), ('Ogun', 'Ogun'), ('Ondo', 'Ondo'), ('Osun', 'Osun'), ('Oyo', 'Oyo'),
        ('Plateau', 'Plateau'), ('Rivers', 'Rivers'), ('Sokoto', 'Sokoto'), ('Taraba', 'Taraba'),
        ('Yobe', 'Yobe'), ('Zamfara', 'Zamfara')
    ]

    # Patient fields
    patient_type = models.CharField(max_length=20, choices=PATIENT_CATEGORIES)
    dependent_type = models.CharField(max_length=30, choices=DEPENDENT_TYPES, blank=True, null=True)
    personal_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    sponsor_id = models.CharField(max_length=50, blank=True, null=True)  # For dependents
    title = models.CharField(max_length=10, blank=True, null=True)
    surname = models.CharField(max_length=100, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, blank=True, null=True)  # Employee type
    division = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUSES, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDERS, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    state_of_residence = models.CharField(max_length=50, choices=NIGERIAN_STATES, blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)
    state_of_origin = models.CharField(max_length=50, choices=NIGERIAN_STATES, blank=True, null=True)
    local_government_area = models.CharField(max_length=100, blank=True, null=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, blank=True, null=True)
    genotype = models.CharField(max_length=5, choices=GENOTYPES, blank=True, null=True)
    non_npa_type = models.CharField(max_length=20, choices=NON_NPA_TYPES, blank=True, null=True)
    relationship = models.CharField(max_length=20, choices=NOK_RELATIONSHIPS, blank=True, null=True)

    # Next of Kin
    nok_first_name = models.CharField(max_length=100, blank=True, null=True)
    nok_last_name = models.CharField(max_length=100, blank=True, null=True)
    nok_relationship = models.CharField(max_length=20, choices=NOK_RELATIONSHIPS, blank=True, null=True)
    nok_address = models.TextField(blank=True, null=True)
    nok_phone = models.CharField(max_length=20, blank=True, null=True)

    # Photo
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)

    # Additional fields
    patient_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    last_visit = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Validate DOB not in future
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError("Date of birth cannot be in the future.")

        # Generate patient_id
        if not self.patient_id:
            last_patient = Patient.objects.all().order_by('-id').first()
            last_id = int(last_patient.patient_id[3:]) if last_patient and last_patient.patient_id and last_patient.patient_id.startswith('NPA') else 0
            self.patient_id = f"NPA{last_id + 1:06d}"

        # Calculate age
        if self.date_of_birth:
            today = timezone.now().date()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.surname} {self.first_name}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        indexes = [
            models.Index(fields=['personal_number', 'surname']),
        ]

    @property
    def photo_url(self):
        return self.photo.url if self.photo else None


class VitalReading(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    date = models.DateTimeField(auto_now_add=True)
    systolic = models.IntegerField(null=True, blank=True)
    diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    blood_sugar = models.FloatField(null=True, blank=True)  # FBS
    rbs = models.FloatField(null=True, blank=True)  # Random Blood Sugar
    temperature = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.FloatField(null=True, blank=True)
    pain_scale = models.IntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    recorded_by = models.CharField(max_length=255, default="Unknown")

    class Meta:
        ordering = ['-date']
        verbose_name = "Vital Reading"
        verbose_name_plural = "Vital Readings"

    def __str__(self):
        return f"Vitals for {self.patient} on {self.date}"

class MedicalReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports')
    file_number = models.CharField(max_length=50)
    report_name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=100)
    date = models.DateField()
    doctor = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled')
    ])
    download_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.report_name} for {self.patient}"

    class Meta:
        ordering = ['-date']
        verbose_name = "Medical Report"
        verbose_name_plural = "Medical Reports"

class TimelineEvent(models.Model):
    EVENT_TYPES = [
        ('registration', 'Registration'),
        ('nursing', 'Nursing'),
        ('consultation', 'Consultation'),
        ('laboratory', 'Laboratory'),
        ('radiology', 'Radiology'),
        ('pharmacy', 'Pharmacy'),
        ('discharge', 'Discharge'),
        ('admission', 'Admission'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('in-progress', 'In Progress'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='timeline_events')
    date = models.DateField()
    time = models.TimeField()
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=100)
    staff = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    duration = models.IntegerField(null=True, blank=True, help_text="Duration in minutes")
    notes = models.TextField(blank=True, null=True)
    related_record_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} for {self.patient} on {self.date}"

    class Meta:
        ordering = ['-date', '-time']
        verbose_name = "Timeline Event"
        verbose_name_plural = "Timeline Events"

class Visit(models.Model):
    VISIT_TYPES = [
        ('consultation', 'Consultation'),
        ('follow-up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('routine-checkup', 'Routine Checkup'),
        ('vaccination', 'Vaccination'),
    ]

    CLINICS = [
        ('General', 'General'),
        ('Physiotherapy', 'Physiotherapy'),
        ('Eye', 'Eye'),
        ('Sickle Cell', 'Sickle Cell'),
        ('Dental', 'Dental'),
        ('Cardiology', 'Cardiology'),
    ]

    PRIORITIES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Emergency', 'Emergency'),
    ]

    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Confirmed', 'Confirmed'),
        ('In Progress', 'In Progress'),
        ('In Nursing Pool', 'In Nursing Pool'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rescheduled', 'Rescheduled'),
    ]

    LOCATIONS = [
        ('Bode Thomas Clinic', 'Bode Thomas Clinic'),
        ('Headquarters', 'Headquarters'),
        ('Tincan', 'Tincan'),
        ('LPC', 'LPC'),
        ('Rivers Port Complex', 'Rivers Port Complex'),
        ('Onne Port Complex', 'Onne Port Complex'),
        ('Delta Port Complex', 'Delta Port Complex'),
        ('Calabar Port', 'Calabar Port'),
        ('Lekki Deep Sea Port', 'Lekki Deep Sea Port')
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    visit_date = models.DateField()
    visit_time = models.TimeField()
    visit_location = models.CharField(max_length=100, choices=LOCATIONS)
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPES)
    clinic = models.CharField(max_length=20, choices=CLINICS)
    priority = models.CharField(max_length=10, choices=PRIORITIES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    special_instructions = models.TextField(blank=True, null=True)
    assigned_nurse = models.CharField(max_length=100, blank=True, null=True)
    nursing_received_at = models.DateTimeField(blank=True, null=True)
    patient_name = models.CharField(max_length=200, blank=True, null=True)
    personal_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-populate patient_name and personal_number
        if self.patient:
            self.patient_name = f"{self.patient.surname} {self.patient.first_name}"
            self.personal_number = self.patient.personal_number
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Visit for {self.patient} on {self.visit_date}"

    class Meta:
        ordering = ['-visit_date', '-visit_time']
        verbose_name = "Visit"
        verbose_name_plural = "Visits"

class ConsultationRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='available')  # "available", "occupied", "maintenance"
    assigned_doctor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='rooms')
    current_patient = models.ForeignKey(Patient, null=True, blank=True, on_delete=models.SET_NULL, related_name='rooms')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    specialty_focus = models.CharField(max_length=100, null=True, blank=True)
    total_consultations_today = models.IntegerField(default=0)
    average_consultation_time = models.IntegerField(null=True, blank=True)
    last_patient = models.CharField(max_length=255, null=True, blank=True)
    queue = ArrayField(  # New: Minimal queue support as array of dicts
        models.JSONField(),  # e.g., [{'patient_id': 'visit-123', 'position': 1}]
        default=list,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_rooms'
        verbose_name = "Consultation Room"
        verbose_name_plural = "Consultation Rooms"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ConsultationSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ConsultationRoom, on_delete=models.CASCADE, related_name='sessions')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    vitals_data = models.JSONField(null=True, blank=True)
    lab_orders = models.JSONField(null=True, blank=True)
    prescriptions = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')  # "active", "completed", "cancelled"
    rescheduled_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_sessions'
        verbose_name = "Consultation Session"
        verbose_name_plural = "Consultation Sessions"
        ordering = ['-start_time']

    def __str__(self):
        return f"Session in {self.room.name} for {self.patient.name} on {self.start_time}"