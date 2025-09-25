# utils.py - Utility functions for prescription and pharmacy management

from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
import logging
from django.db.models import Sum, Count, F
from .models import Medication, MedicationBatch, StockTransaction, Prescription, PrescriptionItem

logger = logging.getLogger(__name__)

class FIFODispensing:
    """First In, First Out dispensing logic for medications"""
    
    def dispense_medication(self, medication, quantity, performed_by, prescription_item=None):
        """
        Dispense medication using FIFO logic
        
        Args:
            medication: Medication instance
            quantity: Number of tablets to dispense
            performed_by: User performing the dispensing
            prescription_item: PrescriptionItem instance (optional)
            
        Returns:
            tuple: (success: bool, batches_used: list)
        """
        try:
            with transaction.atomic():
                # Get available batches sorted by expiry date (FIFO)
                available_batches = medication.batches.filter(
                    remaining_tablets__gt=0,
                    expiry_date__gt=timezone.now().date(),
                    status='Active'
                ).order_by('expiry_date')
                
                # Check if we have enough stock
                total_available = sum(batch.remaining_tablets for batch in available_batches)
                if total_available < quantity:
                    logger.warning(f"Insufficient stock for {medication.name}. Need {quantity}, have {total_available}")
                    return False, []
                
                # Dispense from batches using FIFO
                remaining_to_dispense = quantity
                batches_used = []
                
                for batch in available_batches:
                    if remaining_to_dispense <= 0:
                        break
                    
                    # Calculate how much to take from this batch
                    quantity_from_batch = min(batch.remaining_tablets, remaining_to_dispense)
                    
                    # Update batch
                    batch.remaining_tablets -= quantity_from_batch
                    
                    # Update pack counts
                    tablets_used_total = batch.total_tablets - batch.remaining_tablets
                    new_opened_packs = max(0, (tablets_used_total + batch.pack_size - 1) // batch.pack_size - 
                                         (batch.total_tablets - batch.remaining_tablets - quantity_from_batch + batch.pack_size - 1) // batch.pack_size)
                    batch.opened_packs += new_opened_packs
                    batch.sealed_packs = max(0, batch.sealed_packs - new_opened_packs)
                    
                    # Update batch status
                    batch.status = update_batch_status(batch)
                    batch.save()
                    
                    # Track batch usage
                    batches_used.append({
                        'batch_id': str(batch.id),
                        'batch_number': batch.batch_number,
                        'quantity': quantity_from_batch,
                        'expiry_date': batch.expiry_date.isoformat()
                    })
                    
                    remaining_to_dispense -= quantity_from_batch
                
                # Update medication stock
                previous_stock = medication.current_stock
                medication.current_stock -= quantity
                medication.last_dispensed = timezone.now().date()
                medication.save()
                
                # Update medication status
                update_medication_status(medication)
                
                # Create stock transaction
                StockTransaction.objects.create(
                    medication=medication,
                    type='Dispensed',
                    quantity=-quantity,
                    previous_stock=previous_stock,
                    new_stock=medication.current_stock,
                    performed_by=performed_by,
                    prescription=prescription_item,
                    reason=f'Dispensed to patient via prescription {prescription_item.prescription.id if prescription_item else "N/A"}'
                )
                
                logger.info(f"Successfully dispensed {quantity} tablets of {medication.name}")
                return True, batches_used
                
        except Exception as e:
            logger.error(f"Error dispensing medication {medication.name}: {str(e)}")
            return False, []

def update_medication_status(medication):
    """Update medication status based on current conditions"""
    # Check for expired batches with remaining stock
    expired_batches = medication.batches.filter(
        remaining_tablets__gt=0,
        expiry_date__lt=timezone.now().date()
    )
    
    if expired_batches.exists():
        medication.status = 'Expired'
        medication.save()
        return medication.status
    
    # Check for near expiry (within 30 days)
    near_expiry_batches = medication.batches.filter(
        remaining_tablets__gt=0,
        expiry_date__lte=timezone.now().date() + timedelta(days=30),
        expiry_date__gt=timezone.now().date()
    )
    
    if medication.current_stock == 0:
        medication.status = 'Out of Stock'
    elif near_expiry_batches.exists():
        medication.status = 'Near Expiry'
    elif medication.current_stock <= medication.minimum_stock:
        medication.status = 'Low Stock'
    else:
        medication.status = 'In Stock'
    
    medication.save()
    return medication.status

def update_batch_status(batch):
    """Update batch status based on expiry date and remaining tablets"""
    today = timezone.now().date()
    days_until_expiry = (batch.expiry_date - today).days
    
    if days_until_expiry < 0:
        return 'Expired'
    elif days_until_expiry <= 30:
        return 'Near Expiry'
    elif batch.remaining_tablets == 0:
        return 'Depleted'
    else:
        return 'Active'

def calculate_estimated_completion_time(prescription):
    """Calculate estimated completion time for a prescription"""
    base_time = 15  # Base time in minutes
    
    # Add time based on number of items
    item_count = prescription.items.count()
    time_per_item = 5
    
    # Add extra time for complex items
    complex_items = prescription.items.filter(
        medication__prescription_required=True
    ).count()
    
    # Add time for out of stock items (substitutions needed)
    out_of_stock_items = prescription.items.filter(status='Out of Stock').count()
    
    total_minutes = (
        base_time + 
        (item_count * time_per_item) + 
        (complex_items * 5) + 
        (out_of_stock_items * 10)
    )
    
    return timezone.now() + timedelta(minutes=total_minutes)

def get_drug_interactions(medications):
    """Check for potential drug interactions"""
    interactions = []
    
    # Common drug interaction patterns
    interaction_patterns = [
        {
            'drug1_patterns': ['warfarin'],
            'drug2_patterns': ['aspirin', 'ibuprofen'],
            'severity': 'Major',
            'description': 'Increased risk of bleeding',
            'recommendation': 'Monitor INR closely and consider alternative pain management'
        },
        {
            'drug1_patterns': ['metformin'],
            'drug2_patterns': ['contrast'],
            'severity': 'Major',
            'description': 'Risk of lactic acidosis',
            'recommendation': 'Discontinue metformin 48 hours before contrast administration'
        },
        {
            'drug1_patterns': ['ace inhibitor', 'lisinopril', 'losartan'],
            'drug2_patterns': ['ibuprofen', 'nsaid'],
            'severity': 'Moderate',
            'description': 'NSAIDs may reduce effectiveness of ACE inhibitors/ARBs',
            'recommendation': 'Monitor blood pressure and consider alternative pain relief'
        },
        {
            'drug1_patterns': ['digoxin'],
            'drug2_patterns': ['amiodarone'],
            'severity': 'Major',
            'description': 'Increased digoxin levels leading to toxicity',
            'recommendation': 'Reduce digoxin dose and monitor levels closely'
        },
        {
            'drug1_patterns': ['lithium'],
            'drug2_patterns': ['furosemide', 'thiazide'],
            'severity': 'Major',
            'description': 'Increased risk of lithium toxicity',
            'recommendation': 'Monitor lithium levels and adjust dose as needed'
        }
    ]
    
    # Check each pair of medications
    for i, med1 in enumerate(medications):
        for med2 in medications[i+1:]:
            med1_name = med1.name.lower()
            med2_name = med2.name.lower()
            
            for pattern in interaction_patterns:
                # Check if med1 matches drug1 pattern and med2 matches drug2 pattern
                if (any(p in med1_name for p in pattern['drug1_patterns']) and
                    any(p in med2_name for p in pattern['drug2_patterns'])) or \
                   (any(p in med2_name for p in pattern['drug1_patterns']) and
                    any(p in med1_name for p in pattern['drug2_patterns'])):
                    
                    interactions.append({
                        'drug1': med1.name,
                        'drug2': med2.name,
                        'severity': pattern['severity'],
                        'description': pattern['description'],
                        'recommendation': pattern['recommendation']
                    })
    
    return interactions

def generate_prescription_summary(prescription):
    """Generate a summary of the prescription for reporting"""
    items = prescription.items.all()
    
    summary = {
        'prescription_id': str(prescription.id),
        'patient_name': f"{prescription.patient.surname} {prescription.patient.first_name}",
        'patient_mrn': prescription.patient.patient_id,
        'prescribed_by': prescription.prescribed_by.name if prescription.prescribed_by else 'Unknown',
        'prescription_date': prescription.created_at.isoformat(),
        'total_items': items.count(),
        'status': prescription.status,
        'medications': []
    }
    
    for item in items:
        med_info = {
            'name': item.medication.name,
            'strength': item.medication.strength,
            'dosage': item.dosage,
            'frequency': item.frequency,
            'duration': item.duration,
            'quantity': item.quantity,
            'instructions': item.instructions,
            'status': item.status,
            'dispensed_quantity': item.dispensed_quantity,
            'dispensed_date': item.dispensed_date.isoformat() if item.dispensed_date else None,
            'dispensed_by': item.dispensed_by.name if item.dispensed_by else None
        }
        
        if item.substituted_with:
            med_info['substitution'] = {
                'original': item.medication.name,
                'substitute': item.substituted_with.name,
                'reason': item.substitution_reason if hasattr(item, 'substitution_reason') else 'Stock unavailable',
                'approved_by': item.dispensed_by.name if item.dispensed_by else 'System'
            }
        
        summary['medications'].append(med_info)
    
    return summary

def check_medication_alerts(medication):
    """Check for various medication alerts"""
    alerts = []
    today = timezone.now().date()
    
    # Stock level alerts
    if medication.current_stock == 0:
        alerts.append({
            'type': 'critical',
            'message': f'{medication.name} is out of stock',
            'action_required': 'Reorder immediately'
        })
    elif medication.current_stock <= medication.minimum_stock:
        alerts.append({
            'type': 'warning',
            'message': f'{medication.name} stock is below minimum level',
            'action_required': 'Consider reordering soon'
        })
    
    # Expiry alerts
    near_expiry_batches = medication.batches.filter(
        remaining_tablets__gt=0,
        expiry_date__lte=today + timedelta(days=30),
        expiry_date__gt=today
    ).order_by('expiry_date')
    
    if near_expiry_batches.exists():
        batch = near_expiry_batches.first()
        days_until_expiry = (batch.expiry_date - today).days
        alerts.append({
            'type': 'warning',
            'message': f'Batch {batch.batch_number} expires in {days_until_expiry} days',
            'action_required': 'Use this batch first (FIFO)'
        })
    
    # Expired batches with stock
    expired_batches = medication.batches.filter(
        remaining_tablets__gt=0,
        expiry_date__lt=today
    )
    
    if expired_batches.exists():
        alerts.append({
            'type': 'critical',
            'message': f'{expired_batches.count()} expired batch(es) with remaining stock',
            'action_required': 'Remove expired stock immediately'
        })
    
    return alerts

def optimize_inventory_levels(medication):
    """Suggest optimal inventory levels based on usage patterns"""
    # Calculate average monthly usage
    if medication.monthly_usage > 0:
        avg_monthly = medication.monthly_usage
    else:
        # Fallback calculation based on recent transactions
        recent_dispensing = StockTransaction.objects.filter(
            medication=medication,
            type='Dispensed',
            created_at__gte=timezone.now() - timedelta(days=90)
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # Estimate monthly usage from 3-month data
        avg_monthly = abs(recent_dispensing) // 3 if recent_dispensing else 10
    
    # Suggest minimum stock (2 months supply)
    suggested_minimum = avg_monthly * 2
    
    # Suggest maximum stock (6 months supply, considering shelf life)
    suggested_maximum = avg_monthly * 6
    
    # Consider pack sizes for practical ordering
    pack_size = medication.pack_size
    suggested_minimum = ((suggested_minimum + pack_size - 1) // pack_size) * pack_size
    suggested_maximum = ((suggested_maximum + pack_size - 1) // pack_size) * pack_size
    
    recommendations = {
        'current_minimum': medication.minimum_stock,
        'suggested_minimum': suggested_minimum,
        'current_maximum': medication.maximum_stock,
        'suggested_maximum': suggested_maximum,
        'monthly_usage': avg_monthly,
        'reorder_point': suggested_minimum + (avg_monthly // 2),  # Reorder when 2.5 months left
    }
    
    return recommendations

class InventoryAnalytics:
    """Class for inventory analytics and reporting"""
    
    @staticmethod
    def get_usage_trends(medication, days=90):
        """Get usage trends for a medication"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        transactions = StockTransaction.objects.filter(
            medication=medication,
            type='Dispensed',
            created_at__date__range=[start_date, end_date]
        ).values('created_at__date').annotate(
            daily_usage=Sum('quantity')
        ).order_by('created_at__date')
        
        return list(transactions)
    
    @staticmethod
    def get_slow_moving_items(days=180):
        """Identify slow-moving inventory items"""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Medications with no dispensing activity in the specified period
        recent_activity = StockTransaction.objects.filter(
            type='Dispensed',
            created_at__gte=cutoff_date
        ).values_list('medication_id', flat=True)
        
        slow_moving = Medication.objects.exclude(
            id__in=recent_activity
        ).filter(current_stock__gt=0)
        
        return slow_moving
    
    @staticmethod
    def get_fast_moving_items(days=30):
        """Identify fast-moving inventory items"""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        fast_moving = StockTransaction.objects.filter(
            type='Dispensed',
            created_at__gte=cutoff_date
        ).values('medication').annotate(
            total_dispensed=Sum('quantity'),
            transaction_count=Count('id')
        ).filter(
            total_dispensed__gt=100  # Adjust threshold as needed
        ).order_by('-total_dispensed')
        
        return fast_moving