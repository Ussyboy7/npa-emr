# viewsets.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, F, Count, Sum
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
import logging
from datetime import datetime
from .models import (
    Patient, VitalReading, MedicalReport, TimelineEvent, Visit,
    ConsultationRoom, ConsultationSession, Medication, MedicationBatch,
    Prescription, PrescriptionItem, PharmacyQueue, StockTransaction
)
from .serializers import (
    PatientSerializer, PatientDetailSerializer, VitalReadingSerializer,
    MedicalReportSerializer, TimelineEventSerializer, VisitSerializer,
    ConsultationRoomSerializer, ConsultationSessionSerializer,
    MedicationSerializer, MedicationBatchSerializer, PrescriptionSerializer,
    PrescriptionItemSerializer, PharmacyQueueSerializer, StockTransactionSerializer
)

logger = logging.getLogger(__name__)

class ConsultationRoomViewSet(viewsets.ModelViewSet):
    queryset = ConsultationRoom.objects.all()
    serializer_class = ConsultationRoomSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        data = serializer.validated_data
        if data.get('status') == 'occupied' and not data.get('assigned_doctor'):
            raise ValidationError({"assigned_doctor": "Assigned doctor is required for occupied rooms."})
        serializer.save()

class ConsultationSessionViewSet(viewsets.ModelViewSet):
    queryset = ConsultationSession.objects.all()
    serializer_class = ConsultationSessionSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        data = serializer.validated_data
        if data.get('start_time') > timezone.now():
            raise ValidationError({"start_time": "Start time cannot be in the future."})
        serializer.save()

class VitalReadingViewSet(viewsets.ModelViewSet):
    queryset = VitalReading.objects.all()
    serializer_class = VitalReadingSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created vital reading for patient: {serializer.data['patient']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Vital creation failed: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MedicalReportViewSet(viewsets.ModelViewSet):
    queryset = MedicalReport.objects.all()
    serializer_class = MedicalReportSerializer
    permission_classes = [AllowAny]

class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    permission_classes = [AllowAny]

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created visit for patient: {serializer.data['patient']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Visit creation failed: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Patient.objects.all()
        patient_type = self.request.query_params.get('patient_type', None)
        sponsor_id = self.request.query_params.get('sponsor_id', None)
        
        if patient_type:
            if ',' in patient_type:
                patient_types = [pt.strip() for pt in patient_type.split(',')]
                queryset = queryset.filter(patient_type__in=patient_types)
            else:
                queryset = queryset.filter(patient_type=patient_type)
        
        if sponsor_id:
            queryset = queryset.filter(sponsor_id=sponsor_id)
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PatientDetailSerializer
        return PatientSerializer

    def create(self, request, *args, **kwargs):
        try:
            if request.data.get('patient_type') == 'Dependent':
                sponsor_id = request.data.get('sponsor_id')
                if not sponsor_id:
                    return Response(
                        {"detail": "Sponsor ID is required for dependents"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    sponsor = Patient.objects.get(id=sponsor_id)
                    if sponsor.patient_type not in ['Employee', 'Retiree']:
                        return Response(
                            {"detail": "Sponsor must be an Employee or Retiree"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Patient.DoesNotExist:
                    return Response(
                        {"detail": "Sponsor not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                dependent_count = Patient.objects.filter(patient_type='Dependent', sponsor_id=sponsor_id).count()
                if sponsor.patient_type == 'Employee' and dependent_count >= 5:
                    return Response(
                        {"detail": "Employee already has maximum number of dependents (5)"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif sponsor.patient_type == 'Retiree' and dependent_count >= 1:
                    return Response(
                        {"detail": "Retiree already has maximum number of dependents (1)"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created patient: {serializer.data['id']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Patient creation failed: {str(e)}", exc_info=True)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def vitals(self, request, pk=None):
        try:
            patient = self.get_object()
            vitals = VitalReading.objects.filter(patient=patient)
            serializer = VitalReadingSerializer(vitals, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for vitals")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def reports(self, request, pk=None):
        try:
            patient = self.get_object()
            reports = MedicalReport.objects.filter(patient=patient)
            serializer = MedicalReportSerializer(reports, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for reports")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def visits(self, request, pk=None):
        try:
            patient = self.get_object()
            visits = Visit.objects.filter(patient=patient)
            serializer = VisitSerializer(visits, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for visits")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        try:
            patient = self.get_object()
            events = TimelineEvent.objects.filter(patient=patient)
            serializer = TimelineEventSerializer(events, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            logger.error(f"Patient {pk} not found for timeline")
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = self.request.query_params.get('q', '')
        try:
            if query:
                patients = Patient.objects.filter(
                    Q(personal_number__icontains=query) |
                    Q(surname__icontains=query) |
                    Q(first_name__icontains=query)
                ).filter(patient_type__in=['Employee', 'Retiree'])
            else:
                patients = Patient.objects.none()
            serializer = self.get_serializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Search failed: {str(e)}", exc_info=True)
            return Response({"detail": "Search failed."}, status=status.HTTP_400_BAD_REQUEST)
        
# viewsets.py
class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        logger.debug(f"Request data: {request.data}")  # Log payload for debugging
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Created medication: {serializer.data['name']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Medication creation failed: {serializer.errors}")
            return Response(
                {"detail": "Validation failed", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during medication creation: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(category__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['post'])
    def check_interactions(self, request):
        medication_ids = request.data.get('medication_ids', [])
        interactions = []
        
        if len(medication_ids) >= 2:
            interactions.append({
                'drug1': 'Medication A',
                'drug2': 'Medication B',
                'severity': 'Moderate',
                'description': 'Both medications affect the liver',
                'recommendation': 'Monitor liver function closely'
            })
        
        return Response({'interactions': interactions})

    @action(detail=True, methods=['post'])
    def add_batch(self, request, pk=None):
        medication = self.get_object()
        
        batch_number = request.data.get('batch_number')
        expiry_date = request.data.get('expiry_date')
        pack_size = request.data.get('pack_size', medication.pack_size)
        packs_received = request.data.get('packs_received', 1)
        total_tablets = pack_size * packs_received
        
        if not batch_number or not expiry_date:
            return Response(
                {'error': 'Batch number and expiry date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if isinstance(expiry_date, str):
            try:
                expiry_date = datetime.strptime(expiry_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid expiry date format. Please use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        with transaction.atomic():
            batch = MedicationBatch.objects.create(
                medication=medication,
                batch_number=batch_number,
                expiry_date=expiry_date,
                total_tablets=total_tablets,
                remaining_tablets=total_tablets,
                date_received=timezone.now().date(),
                pack_size=pack_size,
                packs_received=packs_received,
                opened_packs=0,
                sealed_packs=packs_received,
                supplier=medication.supplier,
                status='Active'
            )
            
            previous_stock = medication.current_stock
            medication.save()
            
            StockTransaction.objects.create(
                medication=medication,
                type='Restocked',
                quantity=total_tablets,
                previous_stock=previous_stock,
                new_stock=medication.current_stock,
                performed_by=request.user.get_username() if request.user.is_authenticated else 'System',
                reason=f'Added batch {batch_number}'
            )
        
        return Response({
            'message': 'Batch added successfully',
            'batch_id': batch.id,
            'new_stock': medication.current_stock
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stock_status(self, request):
        total_items = Medication.objects.count()
        in_stock = Medication.objects.filter(current_stock__gt=0).count()
        low_stock = Medication.objects.filter(
            current_stock__lte=F('minimum_stock'),
            current_stock__gt=0
        ).count()
        out_of_stock = Medication.objects.filter(current_stock=0).count()
        near_expiry = Medication.objects.filter(
            batches__expiry_date__lte=timezone.now() + timezone.timedelta(days=30),
            batches__expiry_date__gte=timezone.now(),
            batches__remaining_tablets__gt=0
        ).distinct().count()
        expired = Medication.objects.filter(
            batches__expiry_date__lt=timezone.now(),
            batches__remaining_tablets__gt=0
        ).distinct().count()
        
        return Response({
            'total_items': total_items,
            'in_stock': in_stock,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'near_expiry': near_expiry,
            'expired': expired
        })

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        visit_id = self.request.query_params.get('visit', None)
        if visit_id:
            queryset = queryset.filter(visit_id=visit_id)
        return queryset.select_related('visit', 'prescribed_by').prefetch_related('items')

    def perform_create(self, serializer):
        with transaction.atomic():
            prescribed_by = None
            if self.request.user.is_authenticated:
                prescribed_by = self.request.user
            else:
                from .models import User
                try:
                    prescribed_by = User.objects.get(name='Default Doctor')
                except User.DoesNotExist:
                    prescribed_by = User.objects.create(
                        name='Default Doctor',
                        email='doctor@example.com',
                        role='doctor'
                    )
            
            prescription = serializer.save(
                prescribed_by=prescribed_by,
                status='Pending'
            )
            
            items_data = self.request.data.get('items', [])
            for item_data in items_data:
                medication = Medication.objects.get(id=item_data['medication'])
                
                item_status = 'Available' if medication.current_stock >= item_data['quantity'] else 'Out of Stock'
                
                PrescriptionItem.objects.create(
                    prescription=prescription,
                    medication=medication,
                    dosage=item_data['dosage'],
                    frequency=item_data['frequency'],
                    duration=item_data['duration'],
                    route=item_data['route'],
                    quantity=item_data['quantity'],
                    instructions=item_data.get('instructions', ''),
                    status=item_status
                )
            
            prescription.update_availability_status()
            
            PharmacyQueue.objects.create(
                prescription=prescription,
                priority='Medium',
                status='Pending',
                wait_time_minutes=0
            )

    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            prescription = serializer.save()
            
            items_data = request.data.get('items', [])
            PrescriptionItem.objects.filter(prescription=prescription).delete()
            
            for item_data in items_data:
                medication = Medication.objects.get(id=item_data['medication'])
                
                item_status = 'Available' if medication.current_stock >= item_data['quantity'] else 'Out of Stock'
                
                PrescriptionItem.objects.create(
                    prescription=prescription,
                    medication=medication,
                    dosage=item_data['dosage'],
                    frequency=item_data['frequency'],
                    duration=item_data['duration'],
                    route=item_data['route'],
                    quantity=item_data['quantity'],
                    instructions=item_data.get('instructions', ''),
                    status=item_status
                )
            
            prescription.update_availability_status()
            
            return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        prescription = self.get_object()
        prescription.status = 'Cancelled'
        prescription.save()
        return Response({'status': 'Prescription cancelled'})

class PrescriptionItemViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer
    permission_classes = [AllowAny]

class PharmacyQueueViewSet(viewsets.ModelViewSet):
    queryset = PharmacyQueue.objects.all()
    serializer_class = PharmacyQueueSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        priority_filter = self.request.query_params.get('priority', None)
        pharmacist_filter = self.request.query_params.get('pharmacist', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        if pharmacist_filter == 'current_user' and self.request.user.is_authenticated:
            queryset = queryset.filter(assigned_pharmacist=self.request.user)
            
        return queryset.select_related(
            'prescription', 
            'prescription__visit', 
            'prescription__visit__patient',
            'prescription__visit__consultation_room',
            'assigned_pharmacist'
        ).prefetch_related('prescription__items__medication')

    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        queue_item = self.get_object()
        
        pharmacist = None
        if request.user.is_authenticated:
            pharmacist = request.user
        else:
            from .models import User
            try:
                pharmacist = User.objects.get(name='Default Pharmacist')
            except User.DoesNotExist:
                pharmacist = User.objects.create(
                    name='Default Pharmacist',
                    email='pharmacist@example.com',
                    role='pharmacist'
                )
        
        queue_item.assigned_pharmacist = pharmacist
        queue_item.status = 'Processing'
        queue_item.save()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def mark_ready(self, request, pk=None):
        queue_item = self.get_object()
        queue_item.status = 'Ready'
        queue_item.save()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def dispense_items(self, request, pk=None):
        queue_item = self.get_object()
        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response(
                {'error': 'No items provided for dispensing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            dispensed_count = 0
            total_items = queue_item.prescription.items.count()
            
            for item_data in items_data:
                if not isinstance(item_data, dict):
                    continue
                    
                try:
                    item_id = item_data.get('item_id')
                    quantity_to_dispense = item_data.get('quantity_to_dispense', 1)
                    
                    if not item_id:
                        continue
                        
                    item = queue_item.prescription.items.get(id=item_id)
                    
                    try:
                        quantity_to_dispense = int(quantity_to_dispense)
                    except (ValueError, TypeError):
                        quantity_to_dispense = item.quantity
                    
                    medication = item.medication
                    previous_stock = medication.current_stock
                    
                    if medication.current_stock >= quantity_to_dispense:
                        active_batches = medication.batches.filter(
                            remaining_tablets__gt=0,
                            expiry_date__gte=timezone.now().date(),
                            status='Active'
                        ).order_by('expiry_date')
                        
                        remaining_to_dispense = quantity_to_dispense
                        for batch in active_batches:
                            if remaining_to_dispense <= 0:
                                break
                            
                            quantity_from_batch = min(batch.remaining_tablets, remaining_to_dispense)
                            
                            batch.remaining_tablets -= quantity_from_batch
                            
                            tablets_used_total = batch.total_tablets - batch.remaining_tablets
                            new_opened_packs = max(0, (tablets_used_total + batch.pack_size - 1) // batch.pack_size -
                                                  (batch.total_tablets - batch.remaining_tablets - quantity_from_batch + batch.pack_size - 1) // batch.pack_size)
                            batch.opened_packs += new_opened_packs
                            batch.sealed_packs = max(0, batch.sealed_packs - new_opened_packs)
                            
                            if batch.expiry_date < timezone.now().date():
                                batch.status = 'Expired'
                            elif batch.expiry_date <= timezone.now().date() + timezone.timedelta(days=30):
                                batch.status = 'Near Expiry'
                            
                            batch.save()
                            remaining_to_dispense -= quantity_from_batch
                        
                        medication.save()
                        
                        dispensed_by = request.user.get_username() if request.user.is_authenticated else 'System'
                        
                        StockTransaction.objects.create(
                            medication=medication,
                            type='Dispensed',
                            quantity=-quantity_to_dispense,
                            previous_stock=previous_stock,
                            new_stock=medication.current_stock,
                            performed_by=dispensed_by,
                            visit=queue_item.prescription.visit,
                            prescription=queue_item.prescription,
                            batch_number=active_batches.first().batch_number if active_batches.exists() else ''
                        )
                        
                        item.status = 'Dispensed'
                        item.dispensed_quantity = quantity_to_dispense
                        item.dispensed_date = timezone.now()
                        item.dispensed_by = dispensed_by
                        item.save()
                        
                        dispensed_count += 1
                    else:
                        return Response(
                            {'error': f'Insufficient stock for {medication.name}. Available: {medication.current_stock}, Required: {quantity_to_dispense}'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                        
                except PrescriptionItem.DoesNotExist:
                    return Response(
                        {'error': f'Prescription item not found: {item_id}'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                except Exception as e:
                    logger.error(f"Error dispensing item {item_id}: {str(e)}")
                    continue
            
            if dispensed_count == 0:
                return Response(
                    {'error': 'No items were dispensed. Please check the items and try again.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if dispensed_count == total_items:
                queue_item.status = 'Dispensed'
            elif dispensed_count > 0:
                queue_item.status = 'Partially Dispensed'
            
            queue_item.save()
            queue_item.prescription.update_availability_status()
        
        return Response({
            'status': 'success', 
            'dispensed_items': dispensed_count,
            'total_items': total_items,
            'message': f'Successfully dispensed {dispensed_count} out of {total_items} items'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def substitute_medication(self, request, pk=None):
        queue_item = self.get_object()
        item_id = request.data.get('prescription_item_id')
        substitute_medication_id = request.data.get('substitute_medication_id')
        reason = request.data.get('reason')
        
        if not all([item_id, substitute_medication_id, reason]):
            return Response(
                {'error': 'Prescription item ID, substitute medication ID, and reason are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            try:
                item = queue_item.prescription.items.get(id=item_id)
                substitute_medication = Medication.objects.get(id=substitute_medication_id)
                
                if substitute_medication.current_stock < item.quantity:
                    return Response(
                        {'error': f'Insufficient stock for {substitute_medication.name}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                item.substituted_with = substitute_medication
                item.status = 'Substituted'
                item.substitution_reason = reason
                item.save()
                
                original_medication = item.medication
                StockTransaction.objects.create(
                    medication=original_medication,
                    type='Substitution',
                    quantity=0,
                    previous_stock=original_medication.current_stock,
                    new_stock=original_medication.current_stock,
                    performed_by=request.user.get_username() if request.user.is_authenticated else 'System',
                    visit=queue_item.prescription.visit,
                    prescription=queue_item.prescription,
                    notes=f'Medication substituted for {substitute_medication.name}'
                )
                
                return Response({'status': 'success'})
                
            except (PrescriptionItem.DoesNotExist, Medication.DoesNotExist) as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_404_NOT_FOUND
                )

class StockTransactionViewSet(viewsets.ModelViewSet):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    permission_classes = [AllowAny]