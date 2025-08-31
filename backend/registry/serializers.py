# registry/serializers.py

from rest_framework import serializers
from .models import Patient, Employee, Retiree, Dependent, NonNPA


class PatientBaseSerializer(serializers.ModelSerializer):
    """Base serializer for all patient types with common fields"""
    
    class Meta:
        model = Patient
        fields = [
            'id', 'title', 'surname', 'first_name', 'last_name',
            'marital_status', 'gender', 'date_of_birth', 'age',
            'email', 'phone', 'address', 'residential_address', 
            'state_of_residence', 'permanent_address', 'state_of_origin',
            'local_government_area', 'blood_group', 'genotype',
            'nok_first_name', 'nok_last_name', 'nok_relationship',
            'nok_address', 'nok_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'age', 'created_at', 'updated_at']

    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise serializers.ValidationError("Phone number must contain only digits, spaces, hyphens, and plus sign.")
        return value

    def validate_nok_phone(self, value):
        """Validate next of kin phone number format"""
        if value and not value.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise serializers.ValidationError("Next of kin phone number must contain only digits, spaces, hyphens, and plus sign.")
        return value


class EmployeeSerializer(PatientBaseSerializer):
    """Serializer for Employee model"""
    
    class Meta(PatientBaseSerializer.Meta):
        model = Employee
        fields = PatientBaseSerializer.Meta.fields + [
            'personal_number', 'type', 'division', 'location'
        ]

    def validate_personal_number(self, value):
        """Ensure personal number is unique for employees"""
        if self.instance:
            # Update case - exclude current instance
            if Employee.objects.exclude(pk=self.instance.pk).filter(personal_number=value).exists():
                raise serializers.ValidationError("Employee with this personal number already exists.")
        else:
            # Create case
            if Employee.objects.filter(personal_number=value).exists():
                raise serializers.ValidationError("Employee with this personal number already exists.")
        return value


class RetireeSerializer(PatientBaseSerializer):
    """Serializer for Retiree model"""
    
    class Meta(PatientBaseSerializer.Meta):
        model = Retiree
        fields = PatientBaseSerializer.Meta.fields + [
            'personal_number', 'retirement_date', 'former_division', 'former_location'
        ]

    def validate_personal_number(self, value):
        """Ensure personal number is unique for retirees"""
        if self.instance:
            # Update case - exclude current instance
            if Retiree.objects.exclude(pk=self.instance.pk).filter(personal_number=value).exists():
                raise serializers.ValidationError("Retiree with this personal number already exists.")
        else:
            # Create case
            if Retiree.objects.filter(personal_number=value).exists():
                raise serializers.ValidationError("Retiree with this personal number already exists.")
        return value


class DependentSerializer(PatientBaseSerializer):
    """Serializer for Dependent model"""
    sponsor_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta(PatientBaseSerializer.Meta):
        model = Dependent
        fields = PatientBaseSerializer.Meta.fields + [
            'sponsor_personal_number', 'dependent_type', 'relationship_to_sponsor', 'sponsor_name'
        ]

    def get_sponsor_name(self, obj):
        """Get sponsor's full name"""
        sponsor = obj.sponsor
        return sponsor.full_name if sponsor else None

    def validate_sponsor_personal_number(self, value):
        """Validate that sponsor exists"""
        dependent_type = self.initial_data.get('dependent_type')
        
        if dependent_type == 'Employee Dependent':
            if not Employee.objects.filter(personal_number=value).exists():
                raise serializers.ValidationError("Employee with this personal number does not exist.")
        elif dependent_type == 'Retiree Dependent':
            if not Retiree.objects.filter(personal_number=value).exists():
                raise serializers.ValidationError("Retiree with this personal number does not exist.")
        else:
            raise serializers.ValidationError("Dependent type is required to validate sponsor.")
        
        return value

    def validate(self, data):
        """Cross-field validation"""
        dependent_type = data.get('dependent_type')
        sponsor_personal_number = data.get('sponsor_personal_number')
        
        if dependent_type and sponsor_personal_number:
            # Check if dependent already exists for this sponsor
            existing_dependent = Dependent.objects.filter(
                sponsor_personal_number=sponsor_personal_number,
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                date_of_birth=data.get('date_of_birth')
            )
            
            if self.instance:
                existing_dependent = existing_dependent.exclude(pk=self.instance.pk)
            
            if existing_dependent.exists():
                raise serializers.ValidationError(
                    "A dependent with the same name and date of birth already exists for this sponsor."
                )
        
        return data


class NonNPASerializer(PatientBaseSerializer):
    """Serializer for NonNPA model"""
    is_access_valid = serializers.ReadOnlyField()
    
    class Meta(PatientBaseSerializer.Meta):
        model = NonNPA
        fields = PatientBaseSerializer.Meta.fields + [
            'non_npa_type', 'organization', 'access_valid_from', 
            'access_valid_until', 'is_access_valid'
        ]

    def validate(self, data):
        """Validate access dates"""
        access_valid_from = data.get('access_valid_from')
        access_valid_until = data.get('access_valid_until')
        
        if access_valid_from and access_valid_until:
            if access_valid_from > access_valid_until:
                raise serializers.ValidationError(
                    "Access valid from date cannot be later than access valid until date."
                )
        
        return data


class PatientSearchSerializer(serializers.Serializer):
    """Serializer for patient search functionality"""
    personal_number = serializers.CharField(max_length=20)
    
    def validate_personal_number(self, value):
        """Check if employee exists with this personal number"""
        if not Employee.objects.filter(personal_number=value).exists():
            raise serializers.ValidationError("Employee with this personal number not found.")
        return value


class PatientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for patient lists"""
    patient_type = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'full_name', 'patient_type', 'gender', 
            'age', 'phone', 'email', 'created_at'
        ]
    
    def get_patient_type(self, obj):
        """Get the patient type name"""
        return obj.get_real_instance_class().__name__


# Bulk operation serializers
class BulkPatientSerializer(serializers.Serializer):
    """Serializer for bulk patient operations"""
    patient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['delete', 'export'])
    
    def validate_patient_ids(self, value):
        """Validate that all patient IDs exist"""
        existing_ids = set(Patient.objects.filter(id__in=value).values_list('id', flat=True))
        provided_ids = set(value)
        
        if existing_ids != provided_ids:
            missing_ids = provided_ids - existing_ids
            raise serializers.ValidationError(f"Patients with IDs {list(missing_ids)} do not exist.")
        
        return value