import { z } from "zod";

export const patientRegistrationSchema = z.object({
  category: z.enum([
    "Employee",
    "Employee Dependent",
    "Retiree",
    "Retiree Dependent",
    "Non-NPA",
  ]),
  personalNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(0),
  gender: z.enum(["Male", "Female"]),
  division: z.string().optional(),
  location: z.string().optional(),
  employeeType: z.enum(["Officer", "Staff"]).optional(),
  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinPhone: z.string().min(1, "Next of kin phone is required"),
});

export type PatientRegistrationSchema = z.infer<typeof patientRegistrationSchema>;
