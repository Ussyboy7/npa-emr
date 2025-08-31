# registry/admin.py

from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import Patient, Employee, Retiree, Dependent, NonNPA


class PatientChildAdmin(PolymorphicChildModelAdmin, SimpleHistoryAdmin):
    """Base admin for all patient child models with history"""
    base_model = Patient
    show_in_index = True
    
    # Common readonly fields
    readonly_fields = ['age', 'created_at', 'updated_at']
    
    # Common list display fields
    base_list_display = ['full_name', 'gender', 'age', 'phone', 'created_at']
    
    # Common search fields
    base_search_fields = ['first_name', 'last_name', 'surname', 'phone', 'email']
    
    # Common list filters
    base_list_filter = ['gender', 'marital_status', 'blood_group', 'genotype', 'created_at']

    def get_fieldsets(self, request, obj=None):
        """Common fieldsets for all patient types"""
        return (
            ('Personal Information', {
                'fields': ('title', 'surname', 'first_name', 'last_name', 
                          'gender', 'date_of_birth', 'age', 'marital_status')
            }),
            ('Contact Information', {
                'fields': ('email', 'phone', 'residential_address', 'state_of_residence',
                          'permanent_address', 'state_of_origin', 'local_government_area')
            }),
            ('Medical Information', {
                'fields': ('blood_group', 'genotype')
            }),
            ('Next of Kin', {
                'fields': ('nok_first_name', 'nok_last_name', 'nok_relationship',
                          'nok_address', 'nok_phone'),
                'classes': ('collapse',)
            }),
            ('Metadata', {
                'fields': ('created_at', 'updated_at'),
                'classes': ('collapse',)
            }),
        )


@admin.register(Employee)
class EmployeeAdmin(PatientChildAdmin):
    base_model = Employee
    
    list_display = PatientChildAdmin.base_list_display + ['personal_number', 'type', 'division', 'location']
    search_fields = PatientChildAdmin.base_search_fields + ['personal_number', 'division', 'location']
    list_filter = PatientChildAdmin.base_list_filter + ['type', 'division', 'location']
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = list(super().get_fieldsets(request, obj))
        # Insert work information after personal information
        fieldsets.insert(1, (
            'Work Information', {
                'fields': ('personal_number', 'type', 'division', 'location')
            }
        ))
        return fieldsets


@admin.register(Retiree)
class RetireeAdmin(PatientChildAdmin):
    base_model = Retiree
    
    list_display = PatientChildAdmin.base_list_display + ['personal_number', 'retirement_date']
    search_fields = PatientChildAdmin.base_search_fields + ['personal_number']
    list_filter = PatientChildAdmin.base_list_filter + ['retirement_date']
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = list(super().get_fieldsets(request, obj))
        # Insert retirement information after personal information
        fieldsets.insert(1, (
            'Retirement Information', {
                'fields': ('personal_number', 'retirement_date', 'former_division', 'former_location')
            }
        ))
        return fieldsets


@admin.register(Dependent)
class DependentAdmin(PatientChildAdmin):
    base_model = Dependent
    
    list_display = PatientChildAdmin.base_list_display + ['sponsor_personal_number', 'dependent_type', 'relationship_to_sponsor']
    search_fields = PatientChildAdmin.base_search_fields + ['sponsor_personal_number']
    list_filter = PatientChildAdmin.base_list_filter + ['dependent_type', 'relationship_to_sponsor']
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = list(super().get_fieldsets(request, obj))
        # Insert sponsor information after personal information
        fieldsets.insert(1, (
            'Sponsor Information', {
                'fields': ('sponsor_personal_number', 'dependent_type', 'relationship_to_sponsor')
            }
        ))
        return fieldsets


@admin.register(NonNPA)
class NonNPAAdmin(PatientChildAdmin):
    base_model = NonNPA
    
    list_display = PatientChildAdmin.base_list_display + ['non_npa_type', 'organization', 'access_valid_until', 'is_access_valid']
    search_fields = PatientChildAdmin.base_search_fields + ['non_npa_type', 'organization']
    list_filter = PatientChildAdmin.base_list_filter + ['non_npa_type', 'access_valid_until']
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = list(super().get_fieldsets(request, obj))
        # Insert non-NPA information after personal information
        fieldsets.insert(1, (
            'Non-NPA Information', {
                'fields': ('non_npa_type', 'organization', 'access_valid_from', 'access_valid_until')
            }
        ))
        return fieldsets
    
    def is_access_valid(self, obj):
        return obj.is_access_valid
    is_access_valid.boolean = True
    is_access_valid.short_description = 'Access Valid'


@admin.register(Patient)
class PatientParentAdmin(PolymorphicParentModelAdmin):
    """Parent admin for all patient types"""
    base_model = Patient
    child_models = (Employee, Retiree, Dependent, NonNPA)
    
    list_display = ['full_name', 'polymorphic_ctype', 'gender', 'age', 'phone', 'created_at']
    search_fields = ['first_name', 'last_name', 'surname', 'phone', 'email']
    list_filter = ['polymorphic_ctype', 'gender', 'marital_status', 'created_at']
    
    def polymorphic_ctype(self, obj):
        return obj.get_real_instance_class().__name__
    polymorphic_ctype.short_description = 'Patient Type'


# Customize admin site headers
admin.site.site_header = "Patient Registry Administration"
admin.site.site_title = "Patient Registry Admin"
admin.site.index_title = "Welcome to Patient Registry Administration"