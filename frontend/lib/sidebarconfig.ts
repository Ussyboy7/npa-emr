// lib/sidebarconfig.ts
import {
  Home,
  UserPlus,
  Users,
  FilePlus,
  FileText,
  Activity,
  ClipboardCheck,
  Stethoscope,
  Shield,
  Pill,
  Eye,
  FlaskConical,
  UsersIcon,
  TestTubesIcon,
  File,
  Folder,
  Settings,
  Store,
  Syringe,
  BandageIcon,
  NotebookIcon,
  ListStartIcon,
  TestTube2Icon,
} from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>; // icon component type
}

export interface SidebarModule {
  name: string;
  items: SidebarItem[];
}

export const sidebarModules: SidebarModule[] = [
  {
  name: "Test",
  items: [
    { name: "Test", href: "/test", icon: TestTubesIcon },
  ],
},
  
  {
    name: "Medical Records",
    items: [
      { name: "Dashboard", href: "/medical-records/dashboard", icon: Home },
      { name: "Register Patient", href: "/medical-records/register-patient", icon: UserPlus },
      { name: "Manage Patient", href: "/medical-records/manage-patient", icon: Users },
      { name: "Manage Dependents", href: "/medical-records/manage-dependents", icon: Users },
      { name: "Create Visit", href: "/medical-records/create-visit", icon: FilePlus },
      { name: "Manage Visit", href: "/medical-records/manage-visit", icon: FileText },
      { name: "Reports", href: "/medical-records/reports", icon: Activity },
    ],
  },


{
name: "Nursing",
  items: [
    { name: "Dashboard", href: "/nursing/dashboard", icon: Home },
    { name: "Patient Pool Queue", href: "/nursing/pool-queue", icon: NotebookIcon },
    { name: "Patient Vitals", href: "/nursing/patient-vitals", icon: ClipboardCheck },
    { name: "Consultation Room Status", href: "/nursing/consultation-status", icon: Stethoscope },
    { name: "Wards", href: "/nursing/wards", icon: Shield },
    { name: "Injection", href: "/nursing/injection", icon: Syringe },
    { name: "Dressing", href: "/nursing/dressing", icon: BandageIcon },
  ],
},

{
  name: "Consultation",
  items: [
    { name: "Dashboard", href: "/consultation/dashboard", icon: Home },
    { name: "Pool Queue", href: "/consultation/pool-queue", icon: Stethoscope },
    { name: "Start-Consultation", href: "/consultation/start-consultation", icon: ListStartIcon },
    { name: "Discharged Patients", href: "/consultation/discharged", icon: Users },
    { name: "Patients Waiting Lab", href: "/consultation/waiting-lab", icon: FlaskConical },
    { name: "Review Patient", href: "/consultation/review", icon: ClipboardCheck },
    { name: "Ward", href: "/consultation/ward", icon: Eye },
  ],
},
{
  name: "Lab",
  items: [
    { name: "Dashboard", href: "/lab/dashboard", icon: Home },
    { name: "Pool Queue", href: "/lab/pool-queue", icon: Stethoscope },
    { name: "Sample Collection", href: "/lab/sample-collection", icon: TestTube2Icon },
    { name: "Record Lab Results", href: "/lab/record-results", icon: FilePlus },
    { name: "Complete Test", href: "/lab/complete-test", icon: ClipboardCheck },
    { name: "Uncompleted Test", href: "/lab/uncompleted-test", icon: ClipboardCheck },
  ],
},
{
  name: "Pharmacy",
  items: [
    { name: "Dashboard", href: "/pharmacy/dashboard", icon: Home },
    { name: "Pool Queue", href: "/pharmacy/pool-queue", icon: Stethoscope },
    { name: "Inventory", href: "/pharmacy/inventory", icon: Store },
    { name: "Dispense History", href: "/pharmacy/dispense-history", icon: Folder },

  ],
},

{
  name: "User Management",
  items: [
    { name: "Users", href: "/user-management/users", icon: UsersIcon },
    { name: "Modules", href: "/user-management/modules", icon: UsersIcon },
    { name: "Roles & Permission", href: "/user-management/roles", icon: UsersIcon },
  ],
},


];