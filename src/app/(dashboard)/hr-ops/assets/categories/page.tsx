import React from "react";
import prisma from "@/lib/prisma";
import { FolderTree, Settings, MoreVertical, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function CategoriesPage() {
  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { Equipments: true } } }
  });

  async function createCategory(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const company_id = (await prisma.company.findFirst())?.id || 'default';
    
    await prisma.equipmentCategory.create({
      data: { company_id, name }
    });
    
    revalidatePath('/hr-ops/assets/categories');
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Categories</h1>
          <p className="text-muted-foreground mt-1">Manage asset classifications for hardware, studio gear, and vehicles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> New Category
          </h3>
          <form action={createCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <input type="text" name="name" required placeholder="e.g. Cinema Cameras, Workstations" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80">
              Create Category
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" /> Enterprise Taxonomy
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FolderTree className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat._count.Equipments} Asset(s)</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                No categories defined.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
