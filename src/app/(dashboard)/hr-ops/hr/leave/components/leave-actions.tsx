"use client";

import React, { useState } from 'react';
import { Plus, X, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitLeaveRequest } from '../actions'; // We will create this

export function LeaveActions() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLeaveRequest(formData);
      setIsModalOpen(false);
      setFormData({ type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
      router.refresh();
    } catch (error) {
      
      alert("Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors">
          <CalendarDays className="h-4 w-4" />
          Leave Policy
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Request Leave
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold text-lg">New Leave Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-muted rounded-md"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Leave Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Start Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">End Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Reason (Optional)</label>
                  <textarea 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary resize-none h-24" 
                    placeholder="Provide additional details..." 
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 flex justify-center items-center gap-2 border border-border bg-background py-2 rounded-md font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-2/3 flex justify-center items-center gap-2 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
