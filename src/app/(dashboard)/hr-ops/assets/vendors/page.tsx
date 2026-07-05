import React from "react";
import prisma from "@/lib/prisma";
import { Building2, Plus, Phone, Mail } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function VendorsPage() {
  const vendors = await prisma.equipmentVendor.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { Equipments: true } } }
  });

  async function createVendor(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const contact_person = formData.get('contact_person') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';
    
    await prisma.equipmentVendor.create({
      data: { company_id, name, contact_person, email, phone }
    });
    
    revalidatePath('/hr-ops/assets/vendors');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage hardware suppliers, lessors, and AMC service providers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Onboard Vendor
          </h3>
          <form action={createVendor} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor / Supplier Name <span className="text-destructive">*</span></label>
              <input type="text" name="name" required placeholder="e.g. Dell Enterprise, B&H Photo" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <input type="text" name="contact_person" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input type="email" name="email" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone / Support Line</label>
              <input type="text" name="phone" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 mt-2">
              Register Vendor
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Approved Suppliers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Assets Managed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendors.length > 0 ? vendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{vendor.name}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground space-y-1">
                      {vendor.contact_person && <p className="font-medium text-foreground">{vendor.contact_person}</p>}
                      {vendor.email && <p className="text-xs flex items-center gap-1.5"><Mail className="h-3 w-3" /> {vendor.email}</p>}
                      {vendor.phone && <p className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3" /> {vendor.phone}</p>}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {vendor._count.Equipments} Asset(s)
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No vendors registered yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
