// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserDetails } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { companyId: company_id } = await getUserDetails();
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type"); // executive, financial, production, resource

    if (!projectId) return new NextResponse("Missing projectId", { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id: projectId, company_id },
      include: {
        Expense: true,
        DailyProductionLogs: true,
        ProjectMember: { include: { User: true } }
      }
    });

    if (!project) return new NextResponse("Project not found", { status: 404 });

    let csvContent = "";
    let filename = `${project.title.replace(/\\s+/g, '_')}_${type}_report.csv`;

    switch (type) {
      case 'financial':
        csvContent = "Date,Category,Amount,Status,Description\n";
        project.Expense.forEach(exp => {
          csvContent += `${new Date(exp.date).toLocaleDateString()},${exp.category},${exp.amount},${exp.status},"${(exp.description || '').replace(/"/g, '""')}"\n`;
        });
        break;
      
      case 'production':
        csvContent = "Date,Shoot Day,Unit,Location,Call Time,Wrap Time,Notes\n";
        project.DailyProductionLogs.forEach(log => {
          const call = log.call_time ? new Date(log.call_time).toLocaleTimeString() : '';
          const wrap = log.wrap_time ? new Date(log.wrap_time).toLocaleTimeString() : '';
          csvContent += `${new Date(log.date).toLocaleDateString()},${log.shoot_day},${log.unit},"${(log.location || '').replace(/"/g, '""')}",${call},${wrap},"${(log.notes || '').replace(/"/g, '""')}"\n`;
        });
        break;

      case 'resource':
        csvContent = "Name,Role,Email,Joined Date\n";
        project.ProjectMember.forEach(member => {
          csvContent += `"${member.User.first_name} ${member.User.last_name}",${member.role},${member.User.email},${new Date(member.created_at).toLocaleDateString()}\n`;
        });
        break;

      case 'executive':
      default:
        // Basic summary
        csvContent = "Metric,Value\n";
        csvContent += `Project Title,"${project.title}"\n`;
        csvContent += `Status,${project.status}\n`;
        csvContent += `Total Budget,${project.budget}\n`;
        csvContent += `Total Expenses,${project.Expense.reduce((sum, e) => sum + e.amount, 0)}\n`;
        csvContent += `Active Crew,${project.ProjectMember.length}\n`;
        break;
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    
    return new NextResponse(error.message, { status: 500 });
  }
}
