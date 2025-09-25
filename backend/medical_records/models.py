# models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
from django.db.models import Sum, F
import uuid
from datetime import datetime

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)
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
    GENDERS = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    BLOOD_GROUPS = [('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')]
    GENOTYPES = [('AA', 'AA'), ('AS', 'AS'), ('AC', 'AC'), ('SS', 'SS')]
    MARITAL_STATUSES = [('Single', 'Single'), ('Married', 'Married'), ('Divorced', 'Divorced'), ('Widowed', 'Widowed')]
    NON_NPA_TYPES = [
        ('Police', 'Police'), ('IT', 'IT'), ('NYSC', 'NYSC'), ('CSR', 'CSR'),
        ('MD Outfit', 'MD Outfit'), ('Board Member', 'Board Member'), ('Seaview', 'Seaview'),
    ]
    DEPENDENT_TYPES = [('Employee Dependent', 'Employee Dependent'), ('Retiree Dependent', 'Retiree Dependent')]
    NOK_RELATIONSHIPS = [('Spouse', 'Spouse'), ('Parent', 'Parent'), ('Sibling', 'Sibling'), ('Child', 'Child')]
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

    patient_type = models.CharField(max_length=20, choices=PATIENT_CATEGORIES)
    dependent_type = models.CharField(max_length=30, choices=DEPENDENT_TYPES, blank=True, null=True)
    personal_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    sponsor_id = models.CharField(max_length=50, blank=True, null=True)
    title = models.CharField(max_length=10, blank=True, null=True)
    surname = models.CharField(max_length=100, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, blank=True, null=True)
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
    nok_first_name = models.CharField(max_length=100, blank=True, null=True)
    nok_last_name = models.CharField(max_length=100, blank=True, null=True)
    nok_relationship = models.CharField(max_length=20, choices=NOK_RELATIONSHIPS, blank=True, null=True)
    nok_address = models.TextField(blank=True, null=True)
    nok_phone = models.CharField(max_length=20, blank=True, null=True)
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)
    patient_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    last_visit = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError("Date of birth cannot be in the future.")

        if self.patient_type == 'Dependent':
            if not self.sponsor_id:
                raise ValidationError("Sponsor ID is required for dependents.")
            try:
                sponsor = Patient.objects.get(id=self.sponsor_id)
                if sponsor.patient_type not in ['Employee', 'Retiree']:
                    raise ValidationError("Sponsor must be either Employee or Retiree.")
                dependent_count = Patient.objects.filter(patient_type='Dependent', sponsor_id=self.sponsor_id).exclude(id=self.pk).count() if self.pk else Patient.objects.filter(patient_type='Dependent', sponsor_id=self.sponsor_id).count()
                serial = dependent_count + 1
                serial_str = f"{serial:02d}"
                self.patient_id = f"ED-{sponsor.personal_number}-{serial_str}" if sponsor.patient_type == 'Employee' else f"RD-{sponsor.personal_number}-{serial_str}"
            except Patient.DoesNotExist:
                raise ValidationError("Sponsor not found.")
        elif self.patient_type == 'NonNPA':
            if not self.non_npa_type:
                raise ValidationError("Non-NPA type is required for Non-NPA patients.")
            nonnpa_count = Patient.objects.filter(patient_type='NonNPA', non_npa_type=self.non_npa_type).exclude(id=self.pk).count() if self.pk else Patient.objects.filter(patient_type='NonNPA', non_npa_type=self.non_npa_type).count()
            serial = nonnpa_count + 1
            serial_str = f"{serial:03d}"
            self.patient_id = f"NN-{self.non_npa_type}-{serial_str}"
        else:
            if not self.personal_number:
                raise ValidationError("Personal number is required for Employee or Retiree.")
            same_personal_number_count = Patient.objects.filter(patient_type=self.patient_type, personal_number=self.personal_number).exclude(id=self.pk).count() if self.pk else Patient.objects.filter(patient_type=self.patient_type, personal_number=self.personal_number).count()
            serial = same_personal_number_count + 1
            serial_str = f"{serial:03d}"
            self.patient_id = f"E-{self.personal_number}-{serial_str}" if self.patient_type == 'Employee' else f"R-{self.personal_number}-{serial_str}"

        if self.date_of_birth:
            today = timezone.now().date()
            self.age = today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.surname} {self.first_name}"

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['personal_number', 'surname'])]

    @property
    def photo_url(self):
        return self.photo.url if self.photo else None

    @property
    def is_sponsor(self):
        return self.patient_type in ['Employee', 'Retiree']

class VitalReading(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    date = models.DateTimeField(auto_now_add=True)
    systolic = models.IntegerField(null=True, blank=True)
    diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    blood_sugar = models.FloatField(null=True, blank=True)
    rbs = models.FloatField(null=True, blank=True)
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
    status = models.CharField(max_length=20, choices=[('completed', 'Completed'), ('pending', 'Pending'), ('cancelled', 'Cancelled')])
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
        ('registration', 'Registration'), ('nursing', 'Nursing'), ('consultation', 'Consultation'),
        ('laboratory', 'Laboratory'), ('radiology', 'Radiology'), ('pharmacy', 'Pharmacy'),
        ('discharge', 'Discharge'), ('admission', 'Admission'),
    ]
    STATUS_CHOICES = [('completed', 'Completed'), ('in-progress', 'In Progress'), ('pending', 'Pending'), ('cancelled', 'Cancelled')]

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
        ('consultation', 'Consultation'), ('follow-up', 'Follow-up'), ('emergency', 'Emergency'),
        ('routine-checkup', 'Routine Checkup'), ('vaccination', 'Vaccination'),
    ]
    CLINICS = [('General', 'General'), ('Physiotherapy', 'Physiotherapy'), ('Eye', 'Eye'), ('Sickle Cell', 'Sickle Cell'), ('Dental', 'Dental'), ('Cardiology', 'Cardiology')]
    PRIORITIES = [('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Emergency', 'Emergency')]
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'), ('Confirmed', 'Confirmed'), ('In Progress', 'In Progress'),
        ('In Nursing Pool', 'In Nursing Pool'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled'), ('Rescheduled', 'Rescheduled'),
    ]
    LOCATIONS = [
        ('Bode Thomas Clinic', 'Bode Thomas Clinic'), ('Headquarters', 'Headquarters'), ('Tincan', 'Tincan'),
        ('LPC', 'LPC'), ('Rivers Port Complex', 'Rivers Port Complex'), ('Onne Port Complex', 'Onne Port Complex'),
        ('Delta Port Complex', 'Delta Port Complex'), ('Calabar Port', 'Calabar Port'), ('Lekki Deep Sea Port', 'Lekki Deep Sea Port'),
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
    consultation_room = models.ForeignKey('ConsultationRoom', on_delete=models.SET_NULL, blank=True, null=True, related_name='visits')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
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
    status = models.CharField(max_length=20, default='available')
    assigned_doctor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='rooms')
    current_patient = models.ForeignKey(Patient, null=True, blank=True, on_delete=models.SET_NULL, related_name='rooms')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    specialty_focus = models.CharField(max_length=100, null=True, blank=True)
    total_consultations_today = models.IntegerField(default=0)
    average_consultation_time = models.IntegerField(null=True, blank=True)
    last_patient = models.CharField(max_length=255, null=True, blank=True)
    queue = ArrayField(models.JSONField(), default=list, blank=True, null=True)
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
    status = models.CharField(max_length=20, default='active')
    rescheduled_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_sessions'
        verbose_name = "Consultation Session"
        verbose_name_plural = "Consultation Sessions"
        ordering = ['-start_time']

    def __str__(self):
        return f"Session in {self.room.name} for {self.patient} on {self.start_time}"

class Medication(models.Model):
    CATEGORIES = [
        ('Antibiotics', 'Antibiotics'), ('Analgesics', 'Analgesics'), ('Cardiovascular', 'Cardiovascular'),
        ('Diabetes', 'Diabetes'), ('Respiratory', 'Respiratory'), ('Vitamins', 'Vitamins'),
        ('Gastrointestinal', 'Gastrointestinal'), ('Dermatology', 'Dermatology'), ('Neurology', 'Neurology'), ('Other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, choices=CATEGORIES)
    strength = models.CharField(max_length=100)
    dosage_form = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=255)
    supplier = models.CharField(max_length=255)
    current_stock = models.IntegerField(default=0)
    minimum_stock = models.IntegerField(default=0)
    maximum_stock = models.IntegerField(default=0)
    pack_size = models.IntegerField(default=1)
    location = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    prescription_required = models.BooleanField(default=True)
    is_generic = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_restocked = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        active_batches = self.batches.filter(status='Active', expiry_date__gte=timezone.now().date())
        self.current_stock = sum(batch.remaining_tablets for batch in active_batches)
        if active_batches.exists():
            self.last_restocked = active_batches.order_by('-date_received').first().date_received
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} {self.strength}"

class MedicationBatch(models.Model):
    STATUS_CHOICES = [('Active', 'Active'), ('Near Expiry', 'Near Expiry'), ('Expired', 'Expired'), ('Recalled', 'Recalled')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    total_tablets = models.IntegerField()
    remaining_tablets = models.IntegerField(default=0)
    date_received = models.DateField(auto_now_add=True)
    pack_size = models.IntegerField()
    packs_received = models.IntegerField()
    opened_packs = models.IntegerField(default=0)
    sealed_packs = models.IntegerField(default=0)
    supplier = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='Active', choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if isinstance(self.expiry_date, str):
            try:
                self.expiry_date = datetime.strptime(self.expiry_date, '%Y-%m-%d').date()
            except ValueError:
                self.expiry_date = timezone.now().date()
        
        if self.expiry_date < timezone.now().date():
            self.status = 'Expired'
        elif self.expiry_date <= timezone.now().date() + timezone.timedelta(days=30):
            self.status = 'Near Expiry'
        
        if self.total_tablets < self.remaining_tablets:
            self.remaining_tablets = self.total_tablets
            
        super().save(*args, **kwargs)
        
        if self.medication:
            self.medication.save()

    def __str__(self):
        return f"{self.medication.name} - {self.batch_number}"

class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='prescriptions')
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    prescribed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    prescribed_by_name = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.prescribed_by_name and self.prescribed_by:
            self.prescribed_by_name = f"{self.prescribed_by.name}"
        super().save(*args, **kwargs)

    def update_availability_status(self):
        if self.items.exists():
            total_items = self.items.count()
            available_items = self.items.filter(status__in=['Available', 'Substituted']).count()
            out_of_stock_items = self.items.filter(status='Out of Stock').count()
            dispensed_items = self.items.filter(status='Dispensed').count()
            
            for item in self.items.filter(status='Pending'):
                medication = item.medication
                item.status = 'Available' if medication and medication.current_stock >= item.quantity else 'Out of Stock'
                item.save()
            
            self.total_items = total_items
            self.available_items = available_items
            self.out_of_stock_items = out_of_stock_items
            self.dispensed_items = dispensed_items
            self.save()

    def __str__(self):
        return f"Prescription for {self.visit.patient} on {self.created_at}"

class PrescriptionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    route = models.CharField(max_length=100)
    quantity = models.IntegerField()
    instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending')
    substituted_with = models.ForeignKey(Medication, on_delete=models.SET_NULL, null=True, blank=True, related_name='substitutes')
    substitution_reason = models.TextField(blank=True, null=True)
    dispensed_quantity = models.IntegerField(null=True, blank=True)
    dispensed_date = models.DateTimeField(null=True, blank=True)
    dispensed_by = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medication.name} - {self.quantity}"

class PharmacyQueue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='queue')
    status = models.CharField(max_length=20, default='Pending')
    priority = models.CharField(max_length=20, default='Medium')
    assigned_pharmacist = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    wait_time_minutes = models.IntegerField(default=0)
    estimated_wait = models.IntegerField(null=True, blank=True)
    pharmacist_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pharmacy Queue for {self.prescription}"

class StockTransaction(models.Model):
    TRANSACTION_TYPES = [('Dispensed', 'Dispensed'), ('Restocked', 'Restocked'), ('Adjusted', 'Adjusted'), ('Expired', 'Expired'), ('Returned', 'Returned')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    performed_by = models.CharField(max_length=255, blank=True, null=True)
    visit = models.ForeignKey(Visit, on_delete=models.SET_NULL, null=True, blank=True)
    prescription = models.ForeignKey(Prescription, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    batch_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.quantity} of {self.medication.name}"