export const dynamic = 'force-dynamic';
import React from 'react';
import prisma from '@/lib/prisma';
import { getUserDetails } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, FileText, TrendingUp, AlertTriangle, Building2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectFinancePage({ params }: { params: { projectId: string } }) {
  const { companyId: company_id } = await getUserDetails();
  const projectId = (await params).projectId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, company_id },
    include: {
      Budget: true,
      Expense: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!project) return notFound();

  const totalBudget = project.budget || 0;
  const spent = project.Budget?.spent_amount || 0;
  const remaining = project.Budget?.remaining_amount || (totalBudget - spent);
  const percentSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  
  const pendingExpenses = project.Expense.filter(e => e.status === 'PENDING');
  const approvedExpenses = project.Expense.filter(e => e.status === 'APPROVED');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance & Procurement</h2>
          <p className="text-muted-foreground">Manage budgets, expenses, and POs for this project.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
                <p className="text-3xl font-bold">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
                <p className={`text-xl font-bold ${remaining < totalBudget * 0.1 ? 'text-red-500' : 'text-green-500'}`}>
                  ${remaining.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: ${spent.toLocaleString()}</span>
                <span>{percentSpent.toFixed(1)}%</span>
              </div>
              <Progress value={percentSpent} className={`h-3 ${percentSpent > 90 ? 'bg-red-500/20' : ''}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/10 rounded-md"><AlertTriangle className="h-4 w-4 text-yellow-500" /></div>
                  <span className="text-sm font-medium">Pending Approval</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{pendingExpenses.length}</div>
                  <div className="text-xs text-muted-foreground">${pendingExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-md"><DollarSign className="h-4 w-4 text-green-500" /></div>
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{approvedExpenses.length}</div>
                  <div className="text-xs text-muted-foreground">${approvedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.Expense.length > 0 ? (
              <div className="space-y-4">
                {project.Expense.slice(0, 5).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{expense.category}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${expense.amount.toLocaleString()}</p>
                      <Badge variant={expense.status === 'APPROVED' ? 'default' : expense.status === 'PENDING' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              Procurement & Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Integrate with DP Media OS Finance Engine to issue Purchase Orders, hire freelancers, and manage vendor payouts.
            </p>
            <div className="space-y-3">
              <Link 
                href={`/finance-ops/expenses?project_id=${projectId}`} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Manage All Expenses</span>
                </div>
              </Link>
              <Link 
                href={`/finance-ops/freelancers?project_id=${projectId}`} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vendor Payouts</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}