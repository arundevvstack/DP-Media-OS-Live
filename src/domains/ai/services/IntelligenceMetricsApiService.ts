import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logAIEvent } from "@/lib/ai-telemetry";

export class IntelligenceMetricsApiService {
    static async handleGET() {
    }
}
const MOCK_METRICS = {
  projectedRevenue: '₹24,50,000',
  revenueGrowth: '+18.4%',
  activeRisks: 2,
  utilizationRate: '88%',
  proposalConversion: '84%',
  // extended
  totalRevenue: 0,
  outstandingRevenue: 0,
  monthlyRevenue: 0,
  activeProjects: 0,
  delayedProjects: 0,
  teamUtilization: 88,
  objectiveCompletionRate: 84,
  prospectConversionRate: 84,
  isMock: true,
};