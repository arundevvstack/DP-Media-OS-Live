import { NextRequest, NextResponse } from 'next/server';
import { ProjectsProjectIdAssetsAssetIdReviewApiService } from '../../../../../../../../domains/projects/services/ProjectsProjectIdAssetsAssetIdReviewApiService';

export async function POST(req: Request, { params }: { params: { projectId: string, assetId: string } }) {
  try {
    const result = await ProjectsProjectIdAssetsAssetIdReviewApiService.handlePOST(req, { params });
    return NextResponse.json(result.payload, { status: result.status || 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

