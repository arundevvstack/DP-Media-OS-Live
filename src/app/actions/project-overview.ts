"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectOverview(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      stages: { orderBy: { order: 'asc' } },
      objectives: { orderBy: { created_at: 'asc' } },
      assets: { orderBy: { created_at: 'desc' } },
      invoices: { orderBy: { created_at: 'desc' } },
      expenses: { orderBy: { date: 'desc' } },
      timeline_events: { orderBy: { created_at: 'desc' } },
      ProductionComment: { orderBy: { created_at: 'asc' } },
      Team: true,
      Company: true
    }
  });

  return project;
}

export async function addReviewAnnotation(projectId: string, assetId: string, timestamp: string, comment: string, authorId: string) {
  const newComment = await prisma.productionComment.create({
    data: {
      project_id: projectId,
      asset_id: assetId, // Assuming we add asset_id or shot_id
      content: `${timestamp} - ${comment}`,
      author_id: authorId,
    }
  });

  // Insert into ActivityLog
  await prisma.activityLog.create({
    data: {
      company_id: newComment.project_id || authorId, // Quick fallback
      project_id: projectId,
      user_id: authorId,
      user_name: authorId, // We should lookup user
      action: "ASSET_ANNOTATED",
      details: `Added annotation: ${comment}`,
    }
  });

  // Emit EventBus
  const { EventBus } = await import('@/lib/event-bus');
  await EventBus.emit("ASSET_ANNOTATED" as any, {
    project_id: projectId,
    asset_id: assetId,
    comment_id: newComment.id,
    timestamp
  });

  return newComment;
}
