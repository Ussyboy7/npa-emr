# registry/models.py
from django.db import models
from django.core.validators import RegexValidator
from polymorphic.models import PolymorphicModel
from simple_history.models import HistoricalRecords


class Patient(PolymorphicModel):
    """
    Base polymorphic model for all patient types.
    Uses polymorphic inheritance to handle different patient categories.
    """
    
    # Title choices
    TITLE_CHOICES = [
        ('Mr.', 'Mr.'),
        ('Mrs.', 'Mrs.'),
        ('Ms.', 'Ms.'),
        ('Dr.', 'Dr.'),
        ('Prof.', 'Prof.'),
        ('Chief', 'Chief'),
        ('Engr.', 'Engr.'),
        ('Barr.', 'Barr.'),
        ('Alhaji', 'Alhaji'),
        ('Alhaja', 'Alhaja'),
    ]

    # Marital status choices
    MARITAL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
        ('Separated', 'Separated'),
    ]

    # Gender choices
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    # Blood group choices
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    # Genotype choices
    GENOTYPE_CHOICES = [
        ('AA', 'AA'), ('AS', 'AS'), ('SS', 'SS'),
        ('AC', 'AC'), ('SC', 'SC'), ('CC', 'CC'),
    ]

    # Nigerian states choices
    NIGERIAN_STATES = [
        ('Abia', 'Abia'), ('Adamawa', 'Adamawa'), ('Akwa Ibom', 'Akwa Ibom'),
        ('Anambra', 'Anambra'), ('Bauchi', 'Bauchi'), ('Bayelsa', 'Bayelsa'),
        ('Benue', 'Benue'), ('Borno', 'Borno'), ('Cross River', 'Cross River'),
        ('Delta', 'Delta'), ('Ebonyi', 'Ebonyi'), ('Edo', 'Edo'),
        ('Ekiti', 'Ekiti'), ('Enugu', 'Enugu'), ('Gombe', 'Gombe'),
        ('Imo', 'Imo'), ('Jigawa', 'Jigawa'), ('Kaduna', 'Kaduna'),
        ('Kano', 'Kano'), ('Katsina', 'Katsina'), ('Kebbi', 'Kebbi'),
        ('Kogi', 'Kogi'), ('Kwara', 'Kwara'), ('Lagos', 'Lagos'),
        ('Nasarawa', 'Nasarawa'), ('Niger', 'Niger'), ('Ogun', 'Ogun'),
        ('Ondo', 'Ondo'), ('Osun', 'Osun'), ('Oyo', 'Oyo'),
        ('Plateau', 'Plateau'), ('Rivers', 'Rivers'), ('Sokoto', 'Sokoto'),
        ('Taraba', 'Taraba'), ('Yobe', 'Yobe'), ('Zamfara', 'Zamfara'),
        ('FCT', 'Federal Capital Territory'),
    ]

    # NOK relationship choices
    NOK_RELATIONSHIP_CHOICES = [
        ('Spouse', 'Spouse'),
        ('Father', 'Father'),
        ('Mother', 'Mother'),
        ('Son', 'Son'),
        ('Daughter', 'Daughter'),
        ('Brother', 'Brother'),
        ('Sister', 'Sister'),
        ('Uncle', 'Uncle'),
        ('Aunt', 'Aunt'),
        ('Nephew', 'Nephew'),
        ('Niece', 'Niece'),
        ('Cousin', 'Cousin'),
        ('Friend', 'Friend'),
        ('Guardian', 'Guardian'),
        ('Other', 'Other'),
    ]

    # Core personal information
    title = models.CharField(max_length=10, choices=TITLE_CHOICES, blank=True)
    surname = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    
    # Personal details
    marital_status = models.CharField(
        max_length=20, 
        choices=MARITAL_STATUS_CHOICES,
        blank=True
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    age = models.PositiveIntegerField(
        help_text="Age in years (auto-calculated from date of birth)"
    )

    # Contact information
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True
    )
    
    # Address fields
    address = models.TextField(blank=True, help_text="General address field")
    residential_address = models.TextField(blank=True, help_text="Current residential address")
    state_of_residence = models.CharField(
        max_length=50, 
        choices=NIGERIAN_STATES,
        blank=True
    )
    permanent_address = models.TextField(blank=True, help_text="Permanent home address")
    state_of_origin = models.CharField(
        max_length=50, 
        choices=NIGERIAN_STATES,
        blank=True
    )
    local_government_area = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Local Government Area"
    )

    # Medical information
    blood_group = models.CharField(
        max_length=3, 
        choices=BLOOD_GROUP_CHOICES,
        blank=True
    )
    genotype = models.CharField(
        max_length=2, 
        choices=GENOTYPE_CHOICES,
        blank=True
    )

    # Next of Kin information
    nok_first_name = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name="Next of Kin First Name"
    )
    nok_last_name = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name="Next of Kin Last Name"
    )
    nok_relationship = models.CharField(
        max_length=30, 
        choices=NOK_RELATIONSHIP_CHOICES,
        blank=True,
        verbose_name="Next of Kin Relationship"
    )
    nok_address = models.TextField(
        blank=True,
        verbose_name="Next of Kin Address"
    )
    nok_phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True,
        verbose_name="Next of Kin Phone"
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # History tracking
    history = HistoricalRecords()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['surname', 'first_name']),
            models.Index(fields=['created_at']),
            models.Index(fields=['gender']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_real_instance_class().__name__})"

    @property
    def full_name(self):
        """Return full name combining title, first name, and surname"""
        parts = [self.title, self.first_name, self.last_name]
        return ' '.join(part for part in parts if part).strip()

    def save(self, *args, **kwargs):
        """Override save to auto-calculate age from date of birth"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        super().save(*args, **kwargs)


class Employee(Patient):
    """Employee patient model"""
    
    # Employee type choices
    EMPLOYEE_TYPE_CHOICES = [
        ('Staff', 'Staff'),
        ('Officer', 'Officer'),
        ('Senior Staff', 'Senior Staff'),
        ('Management', 'Management'),
    ]

    # Division choices (you may want to expand this based on your organization)
    DIVISION_CHOICES = [
        ('Administration', 'Administration'),
        ('Finance', 'Finance'),
        ('Human Resources', 'Human Resources'),
        ('Operations', 'Operations'),
        ('Technical', 'Technical'),
        ('Marketing', 'Marketing'),
        ('Legal', 'Legal'),
        ('IT', 'IT'),
    ]

    # Location choices (you may want to expand this)
    LOCATION_CHOICES = [
        ('Head Office', 'Head Office'),
        ('Branch Office', 'Branch Office'),
        ('Regional Office', 'Regional Office'),
        ('Field Office', 'Field Office'),
    ]

    personal_number = models.CharField(
        max_length=20, 
        unique=True,
        help_text="Unique employee personal number"
    )
    type = models.CharField(
        max_length=30, 
        choices=EMPLOYEE_TYPE_CHOICES,
        verbose_name="Employee Type"
    )
    division = models.CharField(max_length=100, choices=DIVISION_CHOICES)
    location = models.CharField(max_length=100, choices=LOCATION_CHOICES)

    class Meta:
        indexes = [
            models.Index(fields=['personal_number']),
            models.Index(fields=['type']),
            models.Index(fields=['division']),
        ]

    def __str__(self):
        return f"{self.personal_number} - {self.full_name} (Employee)"


class Retiree(Patient):
    """Retiree patient model"""
    
    personal_number = models.CharField(
        max_length=20, 
        unique=True,
        help_text="Unique retiree personal number"
    )
    retirement_date = models.DateField(
        blank=True, 
        null=True,
        help_text="Date of retirement"
    )
    
    # Optional: former employee details
    former_division = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Division before retirement"
    )
    former_location = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Location before retirement"
    )

    class Meta:
        indexes = [
            models.Index(fields=['personal_number']),
            models.Index(fields=['retirement_date']),
        ]

    def __str__(self):
        return f"{self.personal_number} - {self.full_name} (Retiree)"


class Dependent(Patient):
    """Dependent patient model (for both employee and retiree dependents)"""
    
    DEPENDENT_TYPE_CHOICES = [
        ('Employee Dependent', 'Employee Dependent'),
        ('Retiree Dependent', 'Retiree Dependent'),
    ]

    sponsor_personal_number = models.CharField(
        max_length=20,
        help_text="Personal number of the sponsor (employee or retiree)"
    )
    dependent_type = models.CharField(
        max_length=30, 
        choices=DEPENDENT_TYPE_CHOICES
    )
    
    # Relationship to sponsor
    relationship_to_sponsor = models.CharField(
        max_length=30,
        choices=Patient.NOK_RELATIONSHIP_CHOICES,
        blank=True,
        help_text="Relationship to the sponsor"
    )

    class Meta:
        indexes = [
            models.Index(fields=['sponsor_personal_number']),
            models.Index(fields=['dependent_type']),
        ]
        # Ensure a person can't be registered as dependent multiple times under same sponsor
        unique_together = [['sponsor_personal_number', 'first_name', 'last_name', 'date_of_birth']]

    def __str__(self):
        return f"{self.full_name} - Dependent of {self.sponsor_personal_number}"

    @property
    def sponsor(self):
        """Get the sponsor (Employee or Retiree) for this dependent"""
        if self.dependent_type == 'Employee Dependent':
            try:
                return Employee.objects.get(personal_number=self.sponsor_personal_number)
            except Employee.DoesNotExist:
                return None
        elif self.dependent_type == 'Retiree Dependent':
            try:
                return Retiree.objects.get(personal_number=self.sponsor_personal_number)
            except Retiree.DoesNotExist:
                return None
        return None


class NonNPA(Patient):
    """Non-NPA patient model"""
    
    NON_NPA_TYPE_CHOICES = [
        ('Police', 'Police'),
        ('IT', 'IT'),
        ('NYSC', 'NYSC'),
        ('CSR', 'CSR'),
        ('MD Outfit', 'MD Outfit'),
        ('Board Member', 'Board Member'),
        ('Seaview', 'Seaview'),
    ]

    non_npa_type = models.CharField(
        max_length=50, 
        choices=NON_NPA_TYPE_CHOICES,
        verbose_name="Non-NPA Category"
    )
    
    # Optional: organization or company they represent
    organization = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Organization or company represented"
    )
    
    # Optional: validity period for access
    access_valid_from = models.DateField(
        blank=True, 
        null=True,
        help_text="Start date for access validity"
    )
    access_valid_until = models.DateField(
        blank=True, 
        null=True,
        help_text="End date for access validity"
    )

    class Meta:
        indexes = [
            models.Index(fields=['non_npa_type']),
            models.Index(fields=['access_valid_until']),
        ]
        verbose_name = "Non-NPA Patient"
        verbose_name_plural = "Non-NPA Patients"

    def __str__(self):
        return f"{self.full_name} - {self.non_npa_type}"

    @property
    def is_access_valid(self):
        """Check if access is currently valid based on validity dates"""
        from datetime import date
        today = date.today()
        
        if self.access_valid_from and today < self.access_valid_from:
            return False
        if self.access_valid_until and today > self.access_valid_until:
            return False
        return True