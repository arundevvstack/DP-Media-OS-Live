export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";

export default function LeaveRootPage() {
  redirect("/hr-ops/hr/leave/dashboard");
}

