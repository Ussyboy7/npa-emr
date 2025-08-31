# registry/views.py

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
import csv
import json
from datetime import datetime

from .models import Patient, Employee, Retiree, Dependent, NonNPA
from .serializers import (
    EmployeeSerializer, RetireeSerializer, DependentSerializer, 
    NonNPASerializer, PatientSearchSerializer, PatientListSerializer,
    BulkPatientSerializer
)


class EmployeeListCreateView(generics.ListCreateAPIView):
    """List all employees or create a new employee"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'division', 'location', 'gender', 'marital_status']
    search_fields = ['first_name', 'last_name', 'surname', 'personal_number', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'age']
    ordering = ['-created_at']


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an employee"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class RetireeListCreateView(generics.ListCreateAPIView):
    """List all retirees or create a new retiree"""
    queryset = Retiree.objects.all()
    serializer_class = RetireeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'marital_status', 'retirement_date']
    search_fields = ['first_name', 'last_name', 'surname', 'personal_number', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'retirement_date']
    ordering = ['-created_at']


class RetireeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a retiree"""
    queryset = Retiree.objects.all()
    serializer_class = RetireeSerializer


class DependentListCreateView(generics.ListCreateAPIView):
    """List all dependents or create a new dependent"""
    queryset = Dependent.objects.all()
    serializer_class = DependentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['dependent_type', 'relationship_to_sponsor', 'gender']
    search_fields = ['first_name', 'last_name', 'surname', 'sponsor_personal_number']
    ordering_fields = ['created_at', 'first_name', 'last_name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter dependents based on sponsor type if specified"""
        queryset = super().get_queryset()
        sponsor_type = self.request.query_params.get('sponsor_type')
        
        if sponsor_type == 'employee':
            queryset = queryset.filter(dependent_type='Employee Dependent')
        elif sponsor_type == 'retiree':
            queryset = queryset.filter(dependent_type='Retiree Dependent')
        
        return queryset


class DependentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a dependent"""
    queryset = Dependent.objects.all()
    serializer_class = DependentSerializer


class NonNPAListCreateView(generics.ListCreateAPIView):
    """List all Non-NPA patients or create a new one"""
    queryset = NonNPA.objects.all()
    serializer_class = NonNPASerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['non_npa_type', 'gender', 'organization']
    search_fields = ['first_name', 'last_name', 'surname', 'organization']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'access_valid_until']
    ordering = ['-created_at']


class NonNPADetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a Non-NPA patient"""
    queryset = NonNPA.objects.all()
    serializer_class = NonNPASerializer


class PatientSearchView(APIView):
    """Search for employees by personal number (for the search functionality in your React form)"""
    
    def post(self, request):
        serializer = PatientSearchSerializer(data=request.data)
        if serializer.is_valid():
            personal_number = serializer.validated_data['personal_number']
            try:
                employee = Employee.objects.get(personal_number=personal_number)
                employee_data = EmployeeSerializer(employee).data
                return Response({
                    'success': True,
                    'data': employee_data,
                    'message': 'Employee found successfully'
                })
            except Employee.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Employee not found'
                }, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PatientListView(generics.ListAPIView):
    """List all patients regardless of type"""
    queryset = Patient.objects.all()
    serializer_class = PatientListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'marital_status', 'blood_group']
    search_fields = ['first_name', 'last_name', 'surname', 'phone', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'age']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter by patient type if specified"""
        queryset = super().get_queryset()
        patient_type = self.request.query_params.get('type')
        
        if patient_type:
            if patient_type.lower() == 'employee':
                queryset = Employee.objects.all()
            elif patient_type.lower() == 'retiree':
                queryset = Retiree.objects.all()
            elif patient_type.lower() == 'dependent':
                queryset = Dependent.objects.all()
            elif patient_type.lower() == 'nonnpa':
                queryset = NonNPA.objects.all()
        
        return queryset


class PatientStatsView(APIView):
    """Get patient statistics"""
    
    def get(self, request):
        stats = {
            'total_patients': Patient.objects.count(),
            'employees': Employee.objects.count(),
            'retirees': Retiree.objects.count(),
            'dependents': Dependent.objects.count(),
            'non_npa': NonNPA.objects.count(),
            'by_gender': {
                'male': Patient.objects.filter(gender='Male').count(),
                'female': Patient.objects.filter(gender='Female').count(),
                'other': Patient.objects.filter(gender='Other').count(),
            },
            'recent_registrations': Patient.objects.filter(
                created_at__gte=datetime.now().replace(day=1)
            ).count()
        }
        return Response(stats)


class BulkPatientOperationView(APIView):
    """Handle bulk operations on patients"""
    
    def post(self, request):
        serializer = BulkPatientSerializer(data=request.data)
        if serializer.is_valid():
            patient_ids = serializer.validated_data['patient_ids']
            action = serializer.validated_data['action']
            
            if action == 'delete':
                deleted_count = Patient.objects.filter(id__in=patient_ids).count()
                Patient.objects.filter(id__in=patient_ids).delete()
                return Response({
                    'success': True,
                    'message': f'{deleted_count} patients deleted successfully'
                })
            
            elif action == 'export':
                patients = Patient.objects.filter(id__in=patient_ids)
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = 'attachment; filename="patients_export.csv"'
                
                writer = csv.writer(response)
                writer.writerow([
                    'ID', 'Type', 'Title', 'Surname', 'First Name', 'Last Name',
                    'Gender', 'Date of Birth', 'Age', 'Email', 'Phone',
                    'Blood Group', 'Genotype', 'Created At'
                ])
                
                for patient in patients:
                    writer.writerow([
                        patient.id,
                        patient.get_real_instance_class().__name__,
                        patient.title,
                        patient.surname,
                        patient.first_name,
                        patient.last_name,
                        patient.gender,
                        patient.date_of_birth,
                        patient.age,
                        patient.email,
                        patient.phone,
                        patient.blood_group,
                        patient.genotype,
                        patient.created_at.strftime('%Y-%m-%d %H:%M:%S')
                    ])
                
                return response
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def patient_lookup(request):
    """Quick patient lookup by personal number or name"""
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'results': []})
    
    # Search in employees and retirees by personal number
    employees = Employee.objects.filter(personal_number__icontains=query)[:5]
    retirees = Retiree.objects.filter(personal_number__icontains=query)[:5]
    
    # Search all patients by name
    name_results = Patient.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(surname__icontains=query)
    )[:10]
    
    results = []
    
    # Add employee results
    for emp in employees:
        results.append({
            'id': emp.id,
            'type': 'Employee',
            'name': emp.full_name,
            'personal_number': emp.personal_number,
            'division': emp.division
        })
    
    # Add retiree results
    for ret in retirees:
        results.append({
            'id': ret.id,
            'type': 'Retiree',
            'name': ret.full_name,
            'personal_number': ret.personal_number,
            'retirement_date': ret.retirement_date
        })
    
    # Add name search results
    for patient in name_results:
        if patient.id not in [r['id'] for r in results]:  # Avoid duplicates
            results.append({
                'id': patient.id,
                'type': patient.get_real_instance_class().__name__,
                'name': patient.full_name,
                'phone': patient.phone,
                'age': patient.age
            })
    
    return Response({'results': results[:15]})  # Limit to 15 results


@api_view(['GET'])
def constants_view(request):
    """Return constants/choices for frontend dropdowns"""
    from .models import Patient, Employee, Retiree, Dependent, NonNPA
    
    constants = {
        'titles': [choice[0] for choice in Patient.TITLE_CHOICES],
        'genders': [choice[0] for choice in Patient.GENDER_CHOICES],
        'marital_statuses': [choice[0] for choice in Patient.MARITAL_STATUS_CHOICES],
        'blood_groups': [choice[0] for choice in Patient.BLOOD_GROUP_CHOICES],
        'genotypes': [choice[0] for choice in Patient.GENOTYPE_CHOICES],
        'nigerian_states': [choice[0] for choice in Patient.NIGERIAN_STATES],
        'nok_relationships': [choice[0] for choice in Patient.NOK_RELATIONSHIP_CHOICES],
        'employee_types': [choice[0] for choice in Employee.EMPLOYEE_TYPE_CHOICES],
        'divisions': [choice[0] for choice in Employee.DIVISION_CHOICES],
        'locations': [choice[0] for choice in Employee.LOCATION_CHOICES],
        'dependent_types': [choice[0] for choice in Dependent.DEPENDENT_TYPE_CHOICES],
        'non_npa_types': [choice[0] for choice in NonNPA.NON_NPA_TYPE_CHOICES],
    }
    
    return Response(constants)