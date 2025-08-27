from django.db import models

class BasePatient(models.Model):
    # Shared fields
    title = models.CharField(max_length=20, blank=True)
    surname = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    marital_status = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=10)
    date_of_birth = models.DateField()
    age = models.PositiveIntegerField(blank=True, null=True)  # Computed
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    residential_address = models.TextField(blank=True)
    state_of_residence = models.CharField(max_length=50, blank=True)
    permanent_address = models.TextField(blank=True)
    state_of_origin = models.CharField(max_length=50, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    genotype = models.CharField(max_length=5, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        from datetime import date
        today = date.today()
        age = today.year - self.date_of_birth.year
        if (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day):
            age -= 1
        self.age = age
        super().save(*args, **kwargs)

class NextOfKin(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

class Employee(BasePatient):
    personal_number = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=50)  # Staff/Officer
    division = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    next_of_kin = models.OneToOneField(NextOfKin, on_delete=models.SET_NULL, null=True, blank=True)

class Retiree(BasePatient):
    personal_number = models.CharField(max_length=50, unique=True)
    next_of_kin = models.OneToOneField(NextOfKin, on_delete=models.SET_NULL, null=True, blank=True)

class NonNPA(BasePatient):
    non_npa_type = models.CharField(max_length=50)  # Police/IT/etc.
    next_of_kin = models.OneToOneField(NextOfKin, on_delete=models.SET_NULL, null=True, blank=True)

class Dependent(BasePatient):
    sponsor_personal_number = models.CharField(max_length=50)  # Link to Employee/Retiree PN
    dependent_type = models.CharField(max_length=50)  # Employee/Retiree Dependent
    next_of_kin = models.OneToOneField(NextOfKin, on_delete=models.SET_NULL, null=True, blank=True)
    sponsor = models.ForeignKey('registry.Employee', on_delete=models.CASCADE, null=True, related_name='dependents')  # Or Retiree