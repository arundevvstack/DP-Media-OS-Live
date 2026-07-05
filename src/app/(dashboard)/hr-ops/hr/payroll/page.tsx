export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";

export default function PayrollRootPage() {
  redirect("/hr-ops/hr/payroll/dashboard");
}

