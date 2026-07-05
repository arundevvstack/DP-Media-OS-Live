// @ts-nocheck
import React from 'react';
import prisma from "@/lib/prisma";
import { FileText, Download, Trash2, Plus, Upload } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function EmployeeDocuments({ employeeId, companyId }: { employeeId: string, companyId: string }) {
  const documents = await prisma.employeeDocument.findMany({
    where: { user_id: employeeId },
    orderBy: { created_at: 'desc' }
  });

  async function uploadDocument(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const url = formData.get('url') as string;

    await prisma.employeeDocument.create({
      data: {
        user_id: employeeId,
        company_id: companyId,
        name,
        type,
        url: url || '/placeholder-doc.pdf',
      }
    });
    revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
  }

  async function deleteDocument(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await prisma.employeeDocument.delete({ where: { id } });
    revalidatePath(`/hr-ops/hr/employees/${employeeId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Employee Documents</h3>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload New Document
        </h4>
        <form action={uploadDocument} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm">Document Name</label>
            <input type="text" name="name" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="e.g. Contract, ID Proof" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm">Document Type</label>
            <select name="type" required className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
              <option value="CONTRACT">Contract</option>
              <option value="ID_PROOF">ID Proof</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm">File URL (Mocked Upload)</label>
            <input type="text" name="url" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" placeholder="https://..." />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {documents.length > 0 ? documents.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{doc.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Download className="h-4 w-4" />
              </a>
              <form action={deleteDocument}>
                <input type="hidden" name="id" value={doc.id} />
                <button type="submit" className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )) : (
          <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
