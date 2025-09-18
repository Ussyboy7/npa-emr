// lib/api-utils.ts
export const mapPatientToBackend = (patient: any) => {
  return {
    patient_id: patient.patientId,
    patient_type: patient.patientType,
    dependent_type: patient.dependentType,
    personal_number: patient.personalNumber,
    title: patient.title,
    surname: patient.surname,
    first_name: patient.firstName,
    last_name: patient.lastName,
    type: patient.type,
    division: patient.division,
    location: patient.location,
    marital_status: patient.maritalStatus,
    gender: patient.gender,
    date_of_birth: patient.dateOfBirth,
    age: patient.age,
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
    residential_address: patient.residentialAddress,
    state_of_residence: patient.stateOfResidence,
    permanent_address: patient.permanentAddress,
    state_of_origin: patient.stateOfOrigin,
    local_government_area: patient.localGovernmentArea,
    blood_group: patient.bloodGroup,
    genotype: patient.genotype,
    non_npa_type: patient.nonNpaType,
    nok_first_name: patient.nextOfKin?.firstName,
    nok_last_name: patient.nextOfKin?.lastName,
    nok_relationship: patient.nextOfKin?.relationship,
    nok_address: patient.nextOfKin?.address,
    nok_phone: patient.nextOfKin?.phone,
  };
};

export const mapPatientFromBackend = (data: any) => {
  return {
    patientId: data.patient_id,
    patientType: data.patient_type,
    dependentType: data.dependent_type,
    personalNumber: data.personal_number,
    title: data.title,
    surname: data.surname,
    firstName: data.first_name,
    lastName: data.last_name,
    type: data.type,
    division: data.division,
    location: data.location,
    maritalStatus: data.marital_status,
    gender: data.gender,
    dateOfBirth: data.date_of_birth,
    age: data.age,
    email: data.email,
    phone: data.phone,
    address: data.address,
    residentialAddress: data.residential_address,
    stateOfResidence: data.state_of_residence,
    permanentAddress: data.permanent_address,
    stateOfOrigin: data.state_of_origin,
    localGovernmentArea: data.local_government_area,
    bloodGroup: data.blood_group,
    genotype: data.genotype,
    nonNpaType: data.non_npa_type,
    nextOfKin: data.nok_first_name ? {
      firstName: data.nok_first_name,
      lastName: data.nok_last_name,
      relationship: data.nok_relationship,
      address: data.nok_address,
      phone: data.nok_phone,
    } : undefined,
  };
};

export const mapVisitToBackend = (visit: any) => {
  return {
    patient_id: visit.patientId,
    patient_name: visit.patientName,
    personal_number: visit.personalNumber,
    visit_date: visit.visitDate,
    visit_time: visit.visitTime,
    visit_location: visit.visitLocation,
    visit_type: visit.visitType,
    clinic: visit.clinic,
    priority: visit.priority,
    special_instructions: visit.specialInstructions,
    status: visit.status,
  };
};

export const mapVisitFromBackend = (data: any) => {
  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    personalNumber: data.personal_number,
    visitDate: data.visit_date,
    visitTime: data.visit_time,
    visitLocation: data.visit_location,
    visitType: data.visit_type,
    clinic: data.clinic,
    priority: data.priority,
    specialInstructions: data.special_instructions,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};