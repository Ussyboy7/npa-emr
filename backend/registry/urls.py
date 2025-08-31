# registry/urls.py

from django.urls import path, include
from . import views

app_name = 'registry'

urlpatterns = [
    # Employee endpoints
    path('employees/', views.EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    
    # Retiree endpoints
    path('retirees/', views.RetireeListCreateView.as_view(), name='retiree-list-create'),
    path('retirees/<int:pk>/', views.RetireeDetailView.as_view(), name='retiree-detail'),
    
    # Dependent endpoints
    path('employee-dependents/', views.DependentListCreateView.as_view(), name='employee-dependent-list-create'),
    path('retiree-dependents/', views.DependentListCreateView.as_view(), name='retiree-dependent-list-create'),
    path('dependents/', views.DependentListCreateView.as_view(), name='dependent-list-create'),
    path('dependents/<int:pk>/', views.DependentDetailView.as_view(), name='dependent-detail'),
    
    # Non-NPA endpoints
    path('nonnpas/', views.NonNPAListCreateView.as_view(), name='nonnpa-list-create'),
    path('nonnpas/<int:pk>/', views.NonNPADetailView.as_view(), name='nonnpa-detail'),
    
    # General patient endpoints
    path('patients/', views.PatientListView.as_view(), name='patient-list'),
    path('patients/search/', views.PatientSearchView.as_view(), name='patient-search'),
    path('patients/lookup/', views.patient_lookup, name='patient-lookup'),
    path('patients/stats/', views.PatientStatsView.as_view(), name='patient-stats'),
    path('patients/bulk/', views.BulkPatientOperationView.as_view(), name='bulk-operations'),
    
    # Constants endpoint for frontend
    path('constants/', views.constants_view, name='constants'),
]

# Main project urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/registry/', include('registry.urls')),
    # Add other app URLs here
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Add API documentation URLs if using DRF
from rest_framework.documentation import include_docs_urls

urlpatterns += [
    path('api/docs/', include_docs_urls(title='Patient Registry API')),
]