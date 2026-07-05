export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";

export default function RecruitmentRootPage() {
  redirect("/hr-ops/recruitment/dashboard");
}

