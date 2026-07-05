export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";

export default function AttendanceRootPage() {
  redirect("/hr-ops/hr/attendance/dashboard");
}

