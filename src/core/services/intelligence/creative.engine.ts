// @ts-nocheck
import prisma from '@/lib/prisma';

export class CreativeEngine {
  static async analyzeCreative(projectId: string) {
    const assets = await prisma.aIAsset.findMany({ where: { production_id: projectId } });
    const reviews = await prisma.reviewSession.findMany({ where: { production_id: projectId } });
    const revisions = await prisma.revisionRequest.findMany({ where: { production_id: projectId } });

    return {
      assets_generated: assets.length,
      assets_approved: assets.filter(a => a.status === 'APPROVED').length,
      active_reviews: reviews.filter(r => r.status !== 'APPROVED' && r.status !== 'ARCHIVED').length,
      total_revisions: revisions.length,
      open_revisions: revisions.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length
    };
  }
}
