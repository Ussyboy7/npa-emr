// app/medical/page.tsx
import { redirect } from "next/navigation";

export default function MedicalRoot() {
  redirect("/nursing/dashboard");
}