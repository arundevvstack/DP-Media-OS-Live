// @ts-nocheck
import React from "react";
import prisma from "@/lib/prisma";
import { CalendarCheck, ShieldAlert, Video, Truck, Play } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function BookingsPage() {
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, department: true }
  });

  const availableEquipments = await prisma.equipment.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { name: 'asc' }
  });

  const activeBookings = await prisma.equipmentBooking.findMany({
    include: {
      Equipment: true,
      User: { select: { fullName: true, department: true } },
      Project: { select: { name: true } }
    },
    orderBy: { start_date: 'asc' }
  });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true }
  });

  async function createBooking(formData: FormData) {
    'use server';
    const user_id = formData.get('user_id') as string;
    const equipment_id = formData.get('equipment_id') as string;
    const project_id = formData.get('project_id') as string || null;
    const start_date = new Date(formData.get('start_date') as string);
    const end_date = new Date(formData.get('end_date') as string);
    const purpose = formData.get('purpose') as string;
    
    // Create booking
    await prisma.equipmentBooking.create({
      data: { user_id, equipment_id, project_id, start_date, end_date, purpose, status: 'PENDING' }
    });

    revalidatePath('/hr-ops/assets/bookings');
  }

  async function approveBooking(formData: FormData) {
    'use server';
    const booking_id = formData.get('booking_id') as string;
    const equipment_id = formData.get('equipment_id') as string;

    await prisma.equipmentBooking.update({
      where: { id: booking_id },
      data: { status: 'APPROVED' }
    });

    await prisma.equipment.update({
      where: { id: equipment_id },
      data: { status: 'BOOKED' }
    });

    revalidatePath('/hr-ops/assets/bookings');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1500px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Bookings</h1>
          <p className="text-muted-foreground mt-1">Reserve studios, vehicles, and media gear for projects and shoots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Booking Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" /> Reserve Equipment
          </h3>
          <form action={createBooking} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Requesting Employee <span className="text-destructive">*</span></label>
              <select name="user_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Asset <span className="text-destructive">*</span></label>
              <select name="equipment_id" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- Select Asset --</option>
                {availableEquipments.map(eq => <option key={eq.id} value={eq.id}>[{eq.asset_tag}] {eq.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link to Media Project</label>
              <select name="project_id" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                <option value="">-- None (Internal Use) --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input type="date" name="start_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <input type="date" name="end_date" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <textarea name="purpose" rows={2} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"></textarea>
            </div>

            <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
              Submit Request
            </button>
          </form>
        </div>

        {/* Calendar / List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" /> Upcoming Reservations
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeBookings.length > 0 ? activeBookings.map(b => (
                    <tr key={b.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{b.Equipment.name}</p>
                        {b.Project && <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 text-primary">{b.Project.name}</p>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {b.User.fullName}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium space-y-1">
                        <p>{b.start_date.toLocaleDateString()}</p>
                        <p className="text-muted-foreground">to {b.end_date.toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status === 'PENDING' ? (
                          <form action={approveBooking}>
                            <input type="hidden" name="booking_id" value={b.id} />
                            <input type="hidden" name="equipment_id" value={b.equipment_id} />
                            <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/90">
                              Approve
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processed</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                        <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No active reservations.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
