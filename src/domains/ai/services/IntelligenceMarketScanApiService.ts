import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { discoverMarketLeads } from "@/ai/flows/market-flows";
import { marketOpportunityRepository } from "@/domains/crm/repositories/MarketOpportunityRepository";
import { industryTrendRepository } from "@/domains/platform/repositories/IndustryTrendRepository";
import { marketLeadRepository } from "@/domains/crm/repositories/MarketLeadRepository";
import { marketAlertRepository } from "@/domains/platform/repositories/MarketAlertRepository";
import { marketAlertRepository } from "@/domains/platform/repositories/MarketAlertRepository";

export class IntelligenceMarketScanApiService {
    static async handlePOST(request: Request) {
    }
}
const prisma = new PrismaClient();
async function runMarketScan(companyId: string, industry: string, region: string, jobId: string) {
  try {
    console.log(`[Market Scan] Starting job ${jobId} for ${industry} in ${region}`);
    
    // 1. Trigger Genkit Flow
    const aiOutput = await discoverMarketLeads({ industry, region });

    // 2. Save Gaps
    for (const gap of aiOutput.gaps) {
      await marketOpportunityRepository.create({
        data: {
          company_id: companyId,
          industry,
          region,
          gap_description: gap.gap_description,
          severity: gap.severity,
          ad_style: gap.ad_style,
          impact_score: gap.impact_score,
          status: 'open',
        }
      });
    }

    // 3. Save Trends
    for (const trend of aiOutput.trends) {
      await industryTrendRepository.create({
        data: {
          company_id: companyId,
          title: trend.title,
          source: trend.source,
          velocity_score: trend.velocity_score,
          viral_format: trend.viral_format,
          upcoming_prediction: trend.upcoming_prediction,
        }
      });
    }

    // 4. Save Leads
    for (const lead of aiOutput.leads) {
      await marketLeadRepository.create({
        data: {
          company_id: companyId,
          company_name: lead.company_name,
          industry: lead.industry,
          website: lead.website,
          marketing_quality: lead.marketing_quality,
          brand_quality: lead.brand_quality,
          services_needed: lead.services_needed,
          growth_potential: lead.growth_potential,
          estimated_budget: lead.estimated_budget,
          ai_readiness: lead.ai_readiness,
          opportunity_score: lead.opportunity_score,
          score_label: lead.score_label,
          scores: {
            create: {
              revenue_potential: Math.floor(Math.random() * 100), // mock subscore
              ai_readiness: lead.ai_readiness,
              marketing_maturity: Math.floor(Math.random() * 100),
              urgency: Math.floor(Math.random() * 100),
              competition_score: Math.floor(Math.random() * 100),
              conversion_probability: lead.opportunity_score / 100,
              final_score: lead.opportunity_score,
            }
          }
        }
      });
    }

    // 5. Generate Alert
    await marketAlertRepository.create({
      data: {
        company_id: companyId,
        type: 'lead',
        message: `Market scan complete: Discovered ${aiOutput.leads.length} new high-potential leads in ${industry}.`,
      }
    });

    console.log(`[Market Scan] Job ${jobId} complete.`);
  } catch (err) {
    console.error(`[Market Scan] Job ${jobId} execution error:`, err);
    // Generate failure alert
    await marketAlertRepository.create({
      data: {
        company_id: companyId,
        type: 'gap',
        message: `Market scan failed due to an error. Please try again.`,
      }
    });
  }
}