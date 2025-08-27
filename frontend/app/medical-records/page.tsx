// app/medical/page.tsx
import { redirect } from "next/navigation";

export default function MedicalRoot() {
  redirect("/medical/dashboard");
}