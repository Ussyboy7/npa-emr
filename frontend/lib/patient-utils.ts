// lib/patient-utils.ts
export const generatePatientId = (
  patientType: string,
  sponsorId?: string,
  dependentNumber?: number
): string => {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  
  switch (patientType) {
    case 'employee':
      return `e-${uniqueId}`;
    case 'retiree':
      return `r-${uniqueId}`;
    case 'employee_dependent':
      if (!sponsorId || !dependentNumber) {
        throw new Error('Sponsor ID and dependent number are required for employee dependents');
      }
      return `ed-${sponsorId}-${dependentNumber}`;
    case 'retiree_dependent':
      if (!sponsorId || !dependentNumber) {
        throw new Error('Sponsor ID and dependent number are required for retiree dependents');
      }
      return `rd-${sponsorId}-${dependentNumber}`;
    case 'non_npa':
      return `n-${uniqueId}`;
    default:
      throw new Error(`Unknown patient type: ${patientType}`);
  }
};

export const parsePatientId = (patientId: string) => {
  const parts = patientId.split('-');
  const prefix = parts[0];
  
  switch (prefix) {
    case 'e':
      return { type: 'employee', id: patientId };
    case 'r':
      return { type: 'retiree', id: patientId };
    case 'ed':
      return { 
        type: 'employee_dependent', 
        id: patientId,
        sponsorId: parts[1],
        dependentNumber: parseInt(parts[2])
      };
    case 'rd':
      return { 
        type: 'retiree_dependent', 
        id: patientId,
        sponsorId: parts[1],
        dependentNumber: parseInt(parts[2])
      };
    case 'n':
      return { type: 'non_npa', id: patientId };
    default:
      throw new Error(`Invalid patient ID format: ${patientId}`);
  }
};