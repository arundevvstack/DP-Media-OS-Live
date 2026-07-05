"use client";

import React, { useState } from 'react';
import { 
  Building2, Users, CalendarDays, Activity, 
  X, ChevronRight, CheckCircle2, UserCheck 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { addEmployeeAction, getDepartmentsAction, getDesignationsAction, getBranchesAction, getTeamsAction, getJobGradesAction, getShiftsAction, getPayrollGroupsAction, getEmploymentTypesAction } from '../actions'; // We'll create this

export function HRQuickActions() {
  const router = useRouter();
  const [activeWizard, setActiveWizard] = useState<string | null>(null);
  
  // Master Data State
  const [configData, setConfigData] = useState({
    departments: [] as any[],
    designations: [] as any[],
    branches: [] as any[],
    teams: [] as any[],
    jobGrades: [] as any[],
    shifts: [] as any[],
    payrollGroups: [] as any[],
    employmentTypes: [] as any[]
  });
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  React.useEffect(() => {
    if (activeWizard === 'employee') {
      setIsLoadingMasterData(true);
      Promise.all([
        getDepartmentsAction(),
        getDesignationsAction(),
        getBranchesAction(),
        getTeamsAction(),
        getJobGradesAction(),
        getShiftsAction(),
        getPayrollGroupsAction(),
        getEmploymentTypesAction()
      ]).then(([deps, desigs, branches, teams, jgs, shifts, pgs, ets]) => {
        setConfigData({
          departments: deps, designations: desigs, branches, teams, jobGrades: jgs, shifts, payrollGroups: pgs, employmentTypes: ets
        });
        setFormData(prev => ({
          ...prev,
          department: deps[0]?.name || '',
          designation: desigs[0]?.name || '',
          branch: branches[0]?.name || '',
          team: teams[0]?.name || '',
          jobGrade: jgs[0]?.name || '',
          shift: shifts[0]?.name || '',
          payrollGroup: pgs[0]?.name || '',
          employmentType: ets[0]?.name || ''
        }));
      }).finally(() => {
        setIsLoadingMasterData(false);
      });
    }
  }, [activeWizard]);
  
  // Add Employee State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    fullName: '', email: '', department: '', designation: '', branch: '', team: '', jobGrade: '', shift: '', payrollGroup: '', employmentType: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addEmployeeAction(formData);
      setSuccessMsg("Employee added successfully! Onboarding workflows triggered.");
      setTimeout(() => {
        setActiveWizard(null);
        setStep(1);
        setSuccessMsg("");
        setFormData({ fullName: '', email: '', department: '', designation: '', branch: '', team: '', jobGrade: '', shift: '', payrollGroup: '', employmentType: '' });
        router.refresh();
      }, 2000);
    } catch (err) {
      
      alert("Failed to add employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveWizard('employee')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
          >
            <Users className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm font-medium">Add Employee</span>
          </button>

          <button 
            onClick={() => router.push('/hr-ops/hr/employees')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
          >
            <UserCheck className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm font-medium">Directory</span>
          </button>
          
          <button 
            onClick={() => router.push('/hr-ops/hr/leave')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
          >
            <CalendarDays className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm font-medium">Manage Leave</span>
          </button>

          <button 
            onClick={() => router.push('/hr-ops/hr/payroll')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
          >
            <Activity className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm font-medium">Run Payroll</span>
          </button>

        </CardContent>
      </Card>

      {/* Employee Wizard Modal */}
      {activeWizard === 'employee' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold text-lg">Employee Onboarding Wizard</h2>
              <button onClick={() => setActiveWizard(null)} className="p-1 hover:bg-muted rounded-md"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              {successMsg ? (
                <div className="flex flex-col items-center py-8 text-emerald-500">
                  <CheckCircle2 className="h-12 w-12 mb-4" />
                  <p className="font-medium text-foreground">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">Full Name</label>
                        <input 
                          required
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary" 
                          placeholder="e.g. Jane Doe" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary" 
                          placeholder="jane@company.com" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-2 rounded-md font-medium"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {isLoadingMasterData ? (
                         <div className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-muted-foreground animate-pulse">Loading configuration data...</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-1">Department</label>
                            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Designation</label>
                            <select value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Branch</label>
                            <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.branches.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Team</label>
                            <select value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.teams.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Job Grade</label>
                            <select value={formData.jobGrade} onChange={e => setFormData({...formData, jobGrade: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.jobGrades.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Shift</label>
                            <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.shifts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Payroll Group</label>
                            <select value={formData.payrollGroup} onChange={e => setFormData({...formData, payrollGroup: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.payrollGroups.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Employment Type</label>
                            <select value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.employmentTypes.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                      <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
                        Completing this wizard will:
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Create a new User record</li>
                          <li>Trigger the 'employee.created' event via EventBus</li>
                          <li>Dispatch onboarding tasks via Automation Engine</li>
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => setStep(1)}
                          className="w-1/3 flex justify-center items-center gap-2 border border-border bg-background py-2 rounded-md font-medium"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting || isLoadingMasterData}
                          className="w-2/3 flex justify-center items-center gap-2 bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:opacity-50"
                        >
                          {isSubmitting ? "Processing..." : "Complete Setup"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
