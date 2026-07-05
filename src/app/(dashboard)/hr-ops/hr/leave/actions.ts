"use server";

import prisma from "@/lib/prisma";

export async function submitLeaveRequest(data: { type: string; start_date: string; end_date: string; reason: string }) {
  const company = await prisma.company.findFirst();
  if (!company) throw new Error("Company not found");

  const user = await prisma.user.findFirst({ where: { company_id: company.id } });
  if (!user) throw new Error("No users found to request leave for");

  const requestId = crypto.randomUUID();
  try {
    await prisma.$executeRaw`
      INSERT INTO "LeaveRequest" (id, company_id, user_id, type, start_date, end_date, status, reason, created_at, updated_at)
      VALUES (${requestId}, ${company.id}, ${user.id}, ${data.type}, ${new Date(data.start_date)}, ${new Date(data.end_date)}, 'Pending', ${data.reason}, NOW(), NOW())
    `;
  } catch (error) {
    throw new Error("Failed to create leave request in DB");
  }

  // Create activity log
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: "LEAVE_REQUESTED",
      entity_type: "LeaveRequest",
      entity_id: requestId,
      user_id: user.id,
      user_name: user.fullName,
      company_id: company.id,
      details: JSON.stringify({
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date
      })
    }
  });

  return { success: true, requestId };
}
