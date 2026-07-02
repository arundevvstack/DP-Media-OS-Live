export type SlideType = 
  | 'cover' 
  | 'executive_summary' 
  | 'understanding' 
  | 'objectives' 
  | 'proposed_solution' 
  | 'scope' 
  | 'methodology' 
  | 'deliverables' 
  | 'timeline' 
  | 'team' 
  | 'commercials' 
  | 'terms' 
  | 'why_choose_us' 
  | 'portfolio' 
  | 'next_steps' 
  | 'thank_you'
  | 'custom_content';

export interface BaseSlide {
  id: string;
  type: SlideType;
}

export interface CoverSlide extends BaseSlide {
  type: 'cover';
  title: string;
  subtitle: string;
  clientName: string;
  referenceNo: string;
}

export interface ExecutiveSummarySlide extends BaseSlide {
  type: 'executive_summary';
  overview: string;
  expectedOutcome: string;
}

export interface UnderstandingSlide extends BaseSlide {
  type: 'understanding';
  overview: string;
  bulletPoints: string[];
}

export interface ObjectivesSlide extends BaseSlide {
  type: 'objectives';
  goals: { title: string; description: string }[];
}

export interface ProposedSolutionSlide extends BaseSlide {
  type: 'proposed_solution';
  strategy: string;
  keyPillars: { title: string; description: string }[];
}

export interface ScopeSlide extends BaseSlide {
  type: 'scope';
  requirements: { requirement: string; support: string; comment: string }[];
}

export interface MethodologySlide extends BaseSlide {
  type: 'methodology';
  steps: { title: string; description: string }[];
}

export interface DeliverablesSlide extends BaseSlide {
  type: 'deliverables';
  items: string[];
}

export interface TimelineSlide extends BaseSlide {
  type: 'timeline';
  milestones: { phase: string; duration: string; details: string }[];
}

export interface TeamSlide extends BaseSlide {
  type: 'team';
  roles: { role: string; responsibility: string }[];
}

export interface CommercialsSlide extends BaseSlide {
  type: 'commercials';
  title: string;
  items: { slNo: string; description: string; unit: string; qty: string; unitRateInr: string; totalInr: string; unitRateUsd: string; totalUsd: string }[];
  note?: string;
  subtotalInr?: string;
  subtotalUsd?: string;
  taxInr?: string;
  taxUsd?: string;
  grandTotalInr?: string;
  grandTotalUsd?: string;
  taxPercentage?: string;
}

export interface TermsSlide extends BaseSlide {
  type: 'terms';
  terms: string[];
}

export interface WhyChooseUsSlide extends BaseSlide {
  type: 'why_choose_us';
  reasons: { title: string; description: string }[];
}

export interface PortfolioSlide extends BaseSlide {
  type: 'portfolio';
  description: string;
  logos: string[]; // URLs or identifiers for logos
}

export interface NextStepsSlide extends BaseSlide {
  type: 'next_steps';
  steps: string[];
}

export interface ThankYouSlide extends BaseSlide {
  type: 'thank_you';
  companyName: string;
  closingRemark: string;
}

export interface CustomContentSlide extends BaseSlide {
  type: 'custom_content';
  title: string;
  imageUrl: string;
  textContent: string;
}

export type SlideData = 
  | CoverSlide 
  | ExecutiveSummarySlide
  | UnderstandingSlide 
  | ObjectivesSlide
  | ProposedSolutionSlide
  | ScopeSlide 
  | MethodologySlide 
  | DeliverablesSlide
  | TimelineSlide
  | TeamSlide
  | CommercialsSlide 
  | TermsSlide 
  | WhyChooseUsSlide
  | PortfolioSlide 
  | NextStepsSlide 
  | ThankYouSlide
  | CustomContentSlide;
