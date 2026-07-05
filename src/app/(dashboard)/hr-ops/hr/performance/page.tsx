export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";

export default function PerformanceRootPage() {
  redirect("/hr-ops/hr/performance/dashboard");
}

