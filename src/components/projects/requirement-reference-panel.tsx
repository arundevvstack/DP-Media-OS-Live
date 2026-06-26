import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

const renderRequirementValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
        <ExternalLink className="h-3 w-3" /> Link
      </a>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {value.map((v, i) => <Badge key={i} variant="secondary" className="font-bold text-xs">{v}</Badge>)}
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="space-y-3 mt-2 pl-3 border-l-2 border-border/50">
        {Object.entries(value).map(([k, v]) => {
          if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) return null;
          return (
            <div key={k} className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider block">
                {k.replace(/_/g, ' ')}
              </span>
              <div className="text-sm font-medium text-foreground">
                {renderRequirementValue(v)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
};

interface RequirementReferencePanelProps {
  requirement: any;
}

export function RequirementReferencePanel({ requirement }: RequirementReferencePanelProps) {
  return (
    <TabsContent value="requirement" className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-5xl space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Requirement Reference</h2>
            <p className="text-muted-foreground mt-1">
              Approved Requirement Chart from the initial Proposal. 
              This is read-only for production reference.
            </p>
          </div>
        </div>
        
        {requirement ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dynamically render sections excluding metadata */}
            {Object.entries(requirement).filter(([k, v]) => {
              const exclude = ['id', 'company_id', 'prospect_id', 'project_id', 'created_at', 'updated_at', 'status', 'completeness_score'];
              return !exclude.includes(k) && v !== null && v !== '' && (typeof v !== 'object' || Object.keys(v as object).length > 0);
            }).map(([key, value]) => {
              if (typeof value === 'object' && !Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-4 col-span-1 md:col-span-2">
                    <h3 className="text-sm font-black text-primary uppercase tracking-wider border-b pb-2">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(value as object).map(([subKey, subVal]) => {
                        if (subVal === null || subVal === '' || (Array.isArray(subVal) && subVal.length === 0)) return null;
                        return (
                          <div key={subKey} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider block mb-1.5">
                              {subKey.replace(/_/g, ' ')}
                            </span>
                            <div className="text-sm font-medium text-foreground">
                              {renderRequirementValue(subVal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={key} className="bg-muted/30 p-5 rounded-xl border border-border/50 col-span-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider block mb-2">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="text-sm font-medium text-foreground leading-relaxed">
                    {renderRequirementValue(value)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Requirements Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">There is no requirement chart linked to this project workspace.</p>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
