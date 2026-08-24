import { NextRequest, NextResponse } from 'next/server';
import { ProposalsProposalIdConvertApiService } from '../../../../../../domains/projects/services/ProposalsProposalIdConvertApiService';

export async function POST(req: NextRequest, context: { params: Promise<{ proposalId: string }> }) {
  try {
    const result = await ProposalsProposalIdConvertApiService.handlePOST(req, context);
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

