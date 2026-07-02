'use server';
/**
 * @fileOverview AI Proposal Architect flow for generating high-premium sales presentations.
 * Generates a 16-slide JSON array for the slide deck builder.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SlideData } from '@/app/(dashboard)/proposals/types';

const GenerateProposalContentInputSchema = z.object({
  prospect_name: z.string(),
  company_name: z.string(),
  industry: z.string(),
  project_name: z.string(),
  objective: z.string(),
  scope_of_work: z.string(),
  deliverables: z.array(z.string()),
  timeline: z.string(),
  budget: z.string().optional(),
});
export type GenerateProposalContentInput = z.infer<typeof GenerateProposalContentInputSchema>;

// We can define the Zod schema exactly matching our SlideData interfaces to guarantee structural integrity.
const SlideOutputSchema = z.object({
  slides: z.array(z.any()).describe('An array of exactly 16 slide objects matching the requested structure.')
});

export type GenerateProposalContentOutput = { slides: SlideData[] };

function generateMockProposal(input: GenerateProposalContentInput): GenerateProposalContentOutput {
  const company = input.company_name || "Client";
  const project = input.project_name || "Project";
  
  return {
    slides: [
      {
        id: "slide_1",
        type: "cover",
        title: "Strategic Proposal",
        subtitle: `Prepared for ${company}`,
        clientName: company,
        referenceNo: `PRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
      },
      {
        id: "slide_2",
        type: "executive_summary",
        overview: `Executive summary for ${project}`,
        expectedOutcome: "High ROI and market dominance."
      },
      {
        id: "slide_3",
        type: "understanding",
        overview: input.objective || "We understand your goals.",
        bulletPoints: ["Market expansion", "Brand alignment", "Conversion rate optimization"]
      },
      {
        id: "slide_4",
        type: "objectives",
        goals: [{ title: "Primary Goal", description: "To achieve X within Y months." }]
      },
      {
        id: "slide_5",
        type: "proposed_solution",
        strategy: "A comprehensive digital transformation.",
        keyPillars: [{ title: "Pillar 1", description: "Implementation of X." }]
      },
      {
        id: "slide_6",
        type: "scope",
        requirements: [{ requirement: "Core delivery", support: "YES", comment: "Included in base package" }]
      },
      {
        id: "slide_7",
        type: "methodology",
        steps: [{ title: "Phase 1: Discovery", description: "Deep dive into business metrics." }]
      },
      {
        id: "slide_8",
        type: "deliverables",
        items: input.deliverables?.length ? input.deliverables : ["Strategy Document", "Final Assets"]
      },
      {
        id: "slide_9",
        type: "timeline",
        milestones: [{ phase: "Kickoff", duration: "Week 1", details: "Initial alignment" }]
      },
      {
        id: "slide_10",
        type: "team",
        roles: [{ role: "Creative Director", responsibility: "Oversee visual quality" }]
      },
      {
        id: "slide_11",
        type: "commercials",
        title: "Investment Structure",
        items: [{ slNo: "1", description: "Base Scope", unit: "LOT", qty: "1", unitRateInr: "500000", totalInr: "500000", unitRateUsd: "6000", totalUsd: "6000" }]
      },
      {
        id: "slide_12",
        type: "terms",
        terms: ["50% advance payment required to commence work.", "Pricing is valid for 30 days."]
      },
      {
        id: "slide_13",
        type: "why_choose_us",
        reasons: [{ title: "Industry Experts", description: "Years of specialized experience." }]
      },
      {
        id: "slide_14",
        type: "next_steps",
        steps: ["Review this proposal", "Sign SLA", "Project Kickoff"]
      },
      {
        id: "slide_15",
        type: "portfolio",
        description: "Define Perspective works across TVCs, brand films, AI commercials, and premium video production for iconic brands across India and beyond.",
        logos: []
      },
      {
        id: "slide_16",
        type: "thank_you",
        companyName: "Define Perspective",
        closingRemark: "We look forward to partnering with you."
      }
    ] as SlideData[]
  };
}

export async function generateProposalContent(
  input: GenerateProposalContentInput
): Promise<GenerateProposalContentOutput> {
  const hasKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasKey) {
    console.warn("GEMINI_API_KEY not set. Using premium preview proposal template.");
    return generateMockProposal(input);
  }
  try {
    return await generateProposalContentFlow(input);
  } catch (error) {
    console.error("Genkit AI Generation failed:", error);
    console.warn("Falling back to premium preview proposal template gracefully.");
    return generateMockProposal(input);
  }
}

const proposalContentPrompt = ai.definePrompt({
  name: 'proposalContentPrompt',
  input: { schema: GenerateProposalContentInputSchema },
  output: { schema: SlideOutputSchema },
  prompt: `You are an elite Business Analyst and CMO for "Define Perspective", a premium creative media and digital marketing agency.
Your task is to generate a highly professional, strategic 16-slide presentation deck based on the provided prospect data.

INPUT DATA:
- Client Company: {{{company_name}}}
- Prospect Name: {{{prospect_name}}}
- Industry: {{{industry}}}
- Project Name: {{{project_name}}}
- Objective: {{{objective}}}
- Scope of Work: {{{scope_of_work}}}
- Deliverables: {{#each deliverables}}- {{this}}\n{{/each}}
- Timeline: {{{timeline}}}
- Budget: {{#if budget}}{{{budget}}}{{else}}Standard Agency Rates{{/if}}

INSTRUCTIONS:
1. Act as a top-tier CMO. Do not use generic boilerplate. Synthesize the input data to create compelling, persuasive copy tailored specifically to the client's industry and project goals.
2. Generate EXACTLY 16 slides in the specified order.
3. Your output MUST be a JSON object containing a "slides" array.
4. Provide genuine-sounding, well-thought-out data for methodology, timelines, and strategy based on the project type.

REQUIRED SLIDE FORMATS (Ensure 'id' is "slide_1", "slide_2", etc.):
1. { "id": "slide_1", "type": "cover", "title": "...", "subtitle": "...", "clientName": "...", "referenceNo": "..." }
2. { "id": "slide_2", "type": "executive_summary", "overview": "...", "expectedOutcome": "..." }
3. { "id": "slide_3", "type": "understanding", "overview": "...", "bulletPoints": ["...", "..."] }
4. { "id": "slide_4", "type": "objectives", "goals": [{ "title": "...", "description": "..." }] }
5. { "id": "slide_5", "type": "proposed_solution", "strategy": "...", "keyPillars": [{ "title": "...", "description": "..." }] }
6. { "id": "slide_6", "type": "scope", "requirements": [{ "requirement": "...", "support": "YES", "comment": "..." }] }
7. { "id": "slide_7", "type": "methodology", "steps": [{ "title": "...", "description": "..." }] }
8. { "id": "slide_8", "type": "deliverables", "items": ["...", "..."] }
9. { "id": "slide_9", "type": "timeline", "milestones": [{ "phase": "...", "duration": "...", "details": "..." }] }
10. { "id": "slide_10", "type": "team", "roles": [{ "role": "...", "responsibility": "..." }] }
11. { "id": "slide_11", "type": "commercials", "title": "...", "items": [{ "slNo": "1", "description": "...", "unit": "LOT", "qty": "1", "unitRateInr": "...", "totalInr": "...", "unitRateUsd": "...", "totalUsd": "..." }] }
12. { "id": "slide_12", "type": "terms", "terms": ["...", "..."] }
13. { "id": "slide_13", "type": "why_choose_us", "reasons": [{ "title": "...", "description": "..." }] }
14. { "id": "slide_14", "type": "next_steps", "steps": ["...", "..."] }
15. { "id": "slide_15", "type": "portfolio", "description": "Define Perspective works across TVCs, brand films, AI commercials, and premium video production for iconic brands across India and beyond.", "logos": [] }
16. { "id": "slide_16", "type": "thank_you", "companyName": "Define Perspective", "closingRemark": "..." }
`,
});

const generateProposalContentFlow = ai.defineFlow(
  {
    name: 'generateProposalContentFlow',
    inputSchema: GenerateProposalContentInputSchema,
    outputSchema: SlideOutputSchema,
  },
  async (input) => {
    const { output } = await proposalContentPrompt(input);
    return output as GenerateProposalContentOutput;
  }
);
