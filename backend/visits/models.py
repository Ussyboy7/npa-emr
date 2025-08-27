# Create your models here.
from django.db import models
from registry.models import BasePatient  # Reference patients polymorphically if needed

class Visit(models.Model):
    patient = models.ForeignKey('registry.BasePatient', on_delete=models.CASCADE, related_name='visits')  # But since abstract, use contenttypes or specific FKs
    visit_date = models.DateField()
    visit_time = models.TimeField()
    location = models.CharField(max_length=100)
    visit_type = models.CharField(max_length=50)  # Consultation/Follow-up
    clinic = models.CharField(max_length=50)  # General/Eye/etc.
    status = models.CharField(max_length=20, default='Not Sent')  # Not Sent/Pending/Completed
    wait_time = models.CharField(max_length=20, blank=True)  # e.g., "15 mins"
    created_at = models.DateTimeField(auto_now_add=True)