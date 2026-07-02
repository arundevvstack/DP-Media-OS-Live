"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Check, Target, Sparkles, Bot, Briefcase, Palette, Video, Calendar, Upload, Settings, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, X } from "lucide-react";
import { generateRequirementScope } from "@/ai/flows/generate-requirements";
import { cn } from "@/lib/utils";

const PROJECT_CATEGORIES = [
  "Advertising & Brand Films",
  "Product & E-commerce",
  "Social Media Content",
  "Corporate Videos",
  "Music & Entertainment",
  "Events & Live Streaming",
  "Real Estate & Architecture",
  "Documentary & Non-Fiction",
  "Fashion & Lifestyle",
  "Podcast & Interviews",
  "Educational Content",
  "Animation & Motion",
  "Post Production",
  "AI Generated Content",
  "Agency Retainers & Bundles"
];

const PRODUCTION_TYPES = [
  { id: "ai", label: "🤖 AI Production" },
  { id: "hybrid", label: "🎥 Hybrid Production (AI + Live)" },
  { id: "live", label: "🎬 Live Production" },
  { id: "photo", label: "🎨 Photography" },
  { id: "post", label: "🎭 Post Production Only" }
];

const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:5"];

const FINAL_DELIVERABLES = [
  "Script", "Storyboard", "Voice Over", "Photography", "Video", "Social Media Versions", "Master Export", "Source Files", "Project Files", "Thumbnail"
];

function CheckboxGroup({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(x => x !== opt));
    else onChange([...selected, opt]);
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map(opt => (
        <div key={opt} className="flex items-center space-x-2">
          <Checkbox id={opt} checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} />
          <label htmlFor={opt} className="text-sm font-medium leading-none">{opt}</label>
        </div>
      ))}
    </div>
  )
}

interface RequirementChartFormProps {
  prospectId: string;
  companyName: string;
  serviceVertical: string;
  industry: string;
  subVertical?: string;
  projectType?: string;
  notes?: string;
}

export function RequirementChartForm({ prospectId, companyName, serviceVertical, industry, subVertical, projectType, notes }: RequirementChartFormProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [generatingScope, setGeneratingScope] = useState(false);
  
  // WIZARD STATE
  const [activeStep, setActiveStep] = useState(0);

  const renderDropdownWithCustom = (
    label: string, 
    value: string, 
    options: string[], 
    onChange: (val: string) => void
  ) => {
    const isCustom = value && !options.includes(value) && value !== "Custom" && value !== "";
    const showCustom = isCustom || value === "Custom";
    
    return (
      <div className="space-y-3">
        <Label>{label}</Label>
        {!showCustom ? (
          <Select value={value || ""} onValueChange={v => {
            if (v === "Custom") {
              onChange("Custom"); 
            } else {
              onChange(v);
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              <SelectItem value="Custom">Custom / Other</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2">
            <Input 
              value={value === "Custom" ? "" : value} 
              onChange={e => onChange(e.target.value)} 
              placeholder={`Enter custom ${label.toLowerCase()}...`}
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={() => onChange("")} title="Back to presets">
              <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </Button>
          </div>
        )}
      </div>
    );
  };


  useEffect(() => {
    fetch(`/api/v1/crm/prospect/${prospectId}/requirement`)
      .then(res => res.json())
      .then((resData) => {
        const dbReq = resData.requirement || {};
        
        let mappedProdType = "";
        const pt = projectType?.toLowerCase() || "";
        if (pt.includes("ai")) mappedProdType = "ai";
        else if (pt.includes("hybrid")) mappedProdType = "hybrid";
        else if (pt.includes("normal") || pt.includes("standard") || pt.includes("production")) mappedProdType = "live";
        
        const mergedData = {
          ...dbReq,
          client_details: {
            ...dbReq.client_details,
            client_name: dbReq.client_details?.client_name || companyName
          },
          project_details: {
            ...dbReq.project_details,
            project_category: dbReq.project_details?.project_category || serviceVertical,
            project_type: dbReq.project_details?.project_type || subVertical,
            production_type: dbReq.project_details?.production_type || mappedProdType
          },
          objective: dbReq.objective || notes,
          notes: dbReq.notes || notes,
          completeness_score: dbReq.completeness_score || 0,
          items_checked: dbReq.items_checked || 0
        };

        setData(mergedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [prospectId, companyName, serviceVertical, subVertical, projectType, notes]);

  const debouncedSave = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (newData: any) => {
        setSaveStatus("saving");
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          setSaving(true);
          try {
            await fetch(`/api/v1/crm/prospect/${prospectId}/requirement`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newData)
            });
            setLastSaved(new Date());
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          } catch (e) {
            console.error(e);
          } finally {
            setSaving(false);
          }
        }, 1500);
      };
    })(),
    [prospectId]
  );

  const updateField = (category: string, field: string, value: any) => {
    setData((prev: any) => {
      const updated = { ...prev };
      
      if (category === 'root') {
        updated[field] = value;
      } else {
        if (!updated[category]) updated[category] = {};
        updated[category] = { ...updated[category], [field]: value };
      }
      
      // Calculate Completeness
      let score = 0;
      let itemsChecked = 0;
      
      if (updated.client_details?.client_name) { score += 10; itemsChecked++; }
      if (updated.project_details?.project_name && updated.objective) { score += 10; itemsChecked++; }
      if (updated.timeline?.delivery_date) { score += 10; itemsChecked++; }
      if (updated.project_details?.project_category) { score += 10; itemsChecked++; }
      if (updated.project_details?.production_type) { score += 10; itemsChecked++; }
      if (updated.assets?.brand_guidelines || updated.assets?.reference_links || updated.assets?.custom_asset_links || updated.assets?.none_required) { score += 10; itemsChecked++; }
      if (updated.universal_deliverables?.list?.length > 0) { score += 10; itemsChecked++; }
      
      const prodType = updated.project_details?.production_type;
      if (prodType === 'ai') {
        if (updated.ai_style) score += 10;
        if (updated.notes) score += 10; // Prompt notes
        if (updated.production_requirements?.voice_over || updated.production_requirements?.ai_language) score += 10;
      } else if (prodType === 'hybrid') {
        if (updated.live_shoot_details?.locations) score += 15;
        if (updated.hybrid_details?.ai_components?.length > 0) score += 15;
      } else if (prodType === 'live') {
        if (updated.live_shoot_details?.locations) score += 15;
        if (updated.live_shoot_details?.crew) score += 15;
      } else if (prodType === 'photo') {
        if (updated.photography_details?.shoot_type) score += 15;
        if (updated.photography_details?.number_of_photos) score += 15;
      } else if (prodType === 'post') {
        if (updated.post_production_details?.editing_style) score += 15;
        if (updated.post_production_details?.motion_graphics || updated.post_production_details?.vfx) score += 15;
      } else {
        score += 30; // Fallback so score can reach 100 if prod type is missing
      }
      
      updated.completeness_score = Math.min(100, score);
      updated.items_checked = itemsChecked;
      
      debouncedSave(updated);
      return updated;
    });
  };

  const handleNext = () => {
    if (activeStep === 0 && (!data?.project_details?.project_category || !data?.project_details?.production_type)) {
      toast({ variant: "destructive", title: "Missing Info", description: "Select Category and Production Type to continue." });
      return;
    }
    setActiveStep(prev => Math.min(prev + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-12 text-center flex flex-col items-center justify-center h-[50vh]"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" /></div>;
  if (!data) return <div>Failed to load requirement chart.</div>;

  const prodType = data.project_details?.production_type || "";

  const steps = [
    { label: "Production Strategy", icon: Target },
    { label: "Core Details", icon: Briefcase },
    { label: "Production Specs", icon: Video }
  ];

  const hasClient = !!(data.client_details?.client_name);
  const hasProject = !!(data.project_details?.project_name);
  const hasTimeline = !!(data.timeline?.delivery_date);
  const hasAssets = !!(data.assets?.reference_links || data.assets?.brand_guidelines || data.assets?.custom_asset_links || (data.assets?.uploaded_files?.length > 0));
  const assetsNotRequired = !!data.assets?.none_required;
  const assetsStatusOk = hasAssets || assetsNotRequired;

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto px-4 md:px-8 pt-8">
      {/* Top Header & Completeness (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 flex flex-col justify-center space-y-5 p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
                {data.completeness_score >= 100 ? (
                  <Sparkles className="h-6 w-6 text-emerald-500" />
                ) : (
                  <Target className="h-6 w-6 text-primary" /> 
                )}
                Requirement Analysis
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {data.completeness_score >= 100 ? "All required information has been successfully provided." : "Complete all necessary information to proceed."}
              </p>
            </div>
            <div className="flex flex-col items-end">
              {data.completeness_score >= 100 ? (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 shadow-sm font-bold text-xl uppercase tracking-wider animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-5 w-5" /> Finished
                </div>
              ) : (
                <span className="text-4xl font-black text-primary tracking-tighter drop-shadow-sm">{Math.round(data.completeness_score || 0)}%</span>
              )}
            </div>
          </div>
          
          <Progress value={data.completeness_score || 0} className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50" indicatorColor={data.completeness_score >= 100 ? "bg-emerald-500" : "bg-primary"} />
          
          <div className="flex flex-wrap gap-6 pt-2">
            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${hasClient ? 'text-emerald-600' : 'text-slate-400'}`}>
              {hasClient ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} Client
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${hasProject ? 'text-emerald-600' : 'text-slate-400'}`}>
              {hasProject ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} Project
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${hasTimeline ? 'text-emerald-600' : 'text-slate-400'}`}>
              {hasTimeline ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} Timeline
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${assetsStatusOk ? 'text-emerald-600' : 'text-amber-500'}`}>
              {assetsStatusOk ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} {assetsNotRequired ? 'Assets Not Required' : hasAssets ? 'Assets Provided' : 'Assets Missing'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-center space-y-3 z-10">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
              {saveStatus === "saving" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : saveStatus === "saved" ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <Save className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Sync Status</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {saveStatus === "saving" && "Saving changes..."}
                {saveStatus === "saved" && "All changes saved"}
                {saveStatus === "idle" && lastSaved && `Last saved ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                {saveStatus === "idle" && !lastSaved && "Waiting to save"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-center px-4 py-8 gap-4 md:gap-6 w-full max-w-4xl mx-auto">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isPast = idx < activeStep;
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center w-full md:w-auto">
              <div className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 shrink-0",
                isActive ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(225,29,72,0.3)] ring-4 ring-primary/10" 
                  : isPast ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-slate-50 text-slate-400 border border-slate-100"
              )}>
                {isPast ? <Check className="w-6 h-6" /> : <Icon className={cn("w-6 h-6", isActive ? "animate-in zoom-in duration-300" : "")} />}
              </div>
              <span className={cn(
                "ml-5 font-bold text-base whitespace-nowrap transition-colors duration-300",
                isActive ? "text-slate-900 dark:text-slate-50" : isPast ? "text-emerald-600" : "text-slate-400"
              )}>{step.label}</span>
              {idx < steps.length - 1 && <div className={cn("hidden md:block h-[2px] w-12 lg:w-24 mx-6 lg:mx-8 transition-colors duration-500 rounded-full", isPast ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-800")} />}
            </div>
          )
        })}
      </div>

      <div className="min-h-[500px] mt-6">
        {/* Step 0: Classification */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="shadow-lg rounded-3xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-8 border-b border-primary/10">
                <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-primary/10 rounded-xl"><Target className="h-6 w-6 text-primary" /></div>
                  1. Project Category
                </h3>
                <p className="text-muted-foreground text-base mt-2 ml-14">Select the overarching vertical for this project.</p>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {PROJECT_CATEGORIES.map(cat => (
                  <div 
                    key={cat} 
                    onClick={() => updateField('project_details', 'project_category', cat)}
                    className={cn(
                      "p-3 text-center rounded-xl border-2 cursor-pointer transition-all font-semibold text-sm",
                      data.project_details?.project_category === cat 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-slate-200 hover:border-primary/30"
                    )}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-lg rounded-3xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-8 border-b border-primary/10">
                <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800 dark:text-slate-100">
                  <div className="p-2 bg-primary/10 rounded-xl"><Video className="h-6 w-6 text-primary" /></div>
                  2. Production Workflow
                </h3>
                <p className="text-muted-foreground text-base mt-2 ml-14">This determines the dynamic fields you'll need to fill out.</p>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCTION_TYPES.map(type => (
                  <div 
                    key={type.id} 
                    onClick={() => updateField('project_details', 'production_type', type.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 font-semibold",
                      prodType === type.id 
                        ? "border-primary bg-primary/5 text-primary shadow-md scale-[1.02]" 
                        : "border-slate-200 hover:border-primary/30"
                    )}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Step 1: Core Info & Deliverables */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="shadow-md rounded-3xl border-slate-200/60 dark:border-slate-800 bg-white p-8">
              <h3 className="font-bold text-lg border-b pb-2 mb-6">Common Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3"><Label>Client Name</Label><Input value={data.client_details?.client_name || ""} onChange={e => updateField('client_details', 'client_name', e.target.value)} /></div>
                <div className="space-y-3"><Label>Project Name</Label><Input value={data.project_details?.project_name || ""} onChange={e => updateField('project_details', 'project_name', e.target.value)} /></div>
                <div className="space-y-3"><Label>Project Objective</Label><Input value={data.objective || ""} onChange={e => updateField('root', 'objective', e.target.value)} /></div>
                <div className="space-y-3"><Label>Project Type (Sub-category)</Label><Input value={data.project_details?.project_type || ""} onChange={e => updateField('project_details', 'project_type', e.target.value)} /></div>
                <div className="space-y-3"><Label>Duration</Label><Input value={data.timeline?.duration || ""} onChange={e => updateField('timeline', 'duration', e.target.value)} /></div>
                <div className="space-y-3"><Label>Deadline</Label><Input type="date" value={data.timeline?.delivery_date || ""} onChange={e => updateField('timeline', 'delivery_date', e.target.value)} /></div>
                <div className="space-y-3"><Label>Aspect Ratio</Label>
                  <Select value={data.technical_specs?.aspect_ratio || ""} onValueChange={v => updateField('technical_specs', 'aspect_ratio', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{ASPECT_RATIOS.map(ar => <SelectItem key={ar} value={ar}>{ar}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3"><Label>Reference Links</Label><Input value={data.assets?.reference_links || ""} onChange={e => updateField('assets', 'reference_links', e.target.value)} /></div>
                <div className="space-y-3"><Label>Brand Guidelines</Label><Input value={data.assets?.brand_guidelines || ""} onChange={e => updateField('assets', 'brand_guidelines', e.target.value)} /></div>
                <div className="space-y-3"><Label>Notes</Label><Textarea value={data.notes || ""} onChange={e => updateField('root', 'notes', e.target.value)} /></div>
              </div>
            </Card>

            <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
              <h3 className="font-bold text-lg border-b pb-2 mb-6">Universal Deliverables</h3>
              <CheckboxGroup options={FINAL_DELIVERABLES} selected={data.universal_deliverables?.list || []} onChange={v => updateField('universal_deliverables', 'list', v)} />
            </Card>

            <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
              <div className="flex justify-between items-center border-b pb-2 mb-6">
                <h3 className="font-bold text-lg">Client Assets</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="no-assets" 
                    checked={data.assets?.none_required || false}
                    onCheckedChange={(c) => updateField('assets', 'none_required', c)}
                  />
                  <Label htmlFor="no-assets" className="text-sm font-semibold cursor-pointer">Not Required / None</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label>Asset Links (Google Drive, Dropbox, etc.)</Label>
                  <Input 
                    value={data.assets?.custom_asset_links || ""} 
                    onChange={e => updateField('assets', 'custom_asset_links', e.target.value)} 
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="space-y-3">
                  <Label>Upload Files</Label>
                  <div 
                    onClick={() => document.getElementById('asset-upload')?.click()} 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Click to select files</p>
                    <input 
                      id="asset-upload" 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).map(f => f.name);
                        const existing = data.assets?.uploaded_files || [];
                        updateField('assets', 'uploaded_files', [...existing, ...files]);
                        toast({ title: "Files added", description: `${files.length} file(s) ready for upload.` });
                      }}
                    />
                  </div>
                  {data.assets?.uploaded_files?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-muted-foreground">Selected Files:</Label>
                      <div className="flex flex-wrap gap-2">
                        {data.assets.uploaded_files.map((file: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                            {file}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-500" 
                              onClick={() => {
                                const updatedFiles = data.assets.uploaded_files.filter((_: any, i: number) => i !== idx);
                                updateField('assets', 'uploaded_files', updatedFiles);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Dynamic Production Specs */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {prodType === 'ai' && (
              <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Bot className="h-5 w-5 text-primary" /> AI Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label>AI Style</Label>
                    <Select value={data.ai_style || ""} onValueChange={v => updateField('root', 'ai_style', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Realistic">Realistic</SelectItem><SelectItem value="Stylized">Stylized</SelectItem><SelectItem value="Animation">Animation</SelectItem><SelectItem value="Cinematic">Cinematic</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 md:col-span-2"><Label>AI Assets Required</Label>
                    <CheckboxGroup options={["Images", "Video", "Avatar", "Voice", "Music", "Motion Graphics"]} selected={data.ai_assets_required || []} onChange={v => updateField('root', 'ai_assets_required', v)} />
                  </div>
                  <div className="space-y-3 md:col-span-2"><Label>Prompt Notes</Label><Textarea value={data.notes || ""} onChange={e => updateField('root', 'notes', e.target.value)} /></div>
                  
                  {renderDropdownWithCustom(
                    "Voice Over", 
                    data.production_requirements?.voice_over || "", 
                    ["AI Male", "AI Female", "Human Male", "Human Female", "None"], 
                    v => updateField('production_requirements', 'voice_over', v)
                  )}
                  {renderDropdownWithCustom(
                    "Subtitles", 
                    data.production_requirements?.subtitles || "", 
                    ["Yes (English)", "Yes (Multi-language)", "No"], 
                    v => updateField('production_requirements', 'subtitles', v)
                  )}
                  {renderDropdownWithCustom(
                    "AI Language", 
                    data.production_requirements?.ai_language || "", 
                    ["English (US)", "English (UK)", "Spanish", "French", "German"], 
                    v => updateField('production_requirements', 'ai_language', v)
                  )}
                </div>
              </Card>
            )}

            {prodType === 'hybrid' && (
              <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Video className="h-5 w-5 text-primary" /> Hybrid Production (Live Shoot)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label>Locations</Label><Input value={data.live_shoot_details?.locations || ""} onChange={e => updateField('live_shoot_details', 'locations', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Crew</Label><Input value={data.live_shoot_details?.crew || ""} onChange={e => updateField('live_shoot_details', 'crew', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Equipment</Label><Input value={data.live_shoot_details?.equipment || ""} onChange={e => updateField('live_shoot_details', 'equipment', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Shoot Days</Label><Input value={data.live_shoot_details?.shoot_days || ""} onChange={e => updateField('live_shoot_details', 'shoot_days', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Actors</Label><Input value={data.live_shoot_details?.actors || ""} onChange={e => updateField('live_shoot_details', 'actors', e.target.value)} /></div>
                </div>
                <h3 className="font-bold text-xl flex items-center gap-2 mt-8 mb-6"><Bot className="h-5 w-5 text-primary" /> Hybrid Production (AI Components)</h3>
                <CheckboxGroup options={["AI Cleanup", "AI Enhancement", "AI VFX", "AI Voice", "AI Background"]} selected={data.hybrid_details?.ai_components || []} onChange={v => updateField('hybrid_details', 'ai_components', v)} />
              </Card>
            )}

            {prodType === 'live' && (
              <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Video className="h-5 w-5 text-primary" /> Live Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label>Shoot Days</Label><Input value={data.live_shoot_details?.shoot_days || ""} onChange={e => updateField('live_shoot_details', 'shoot_days', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Locations</Label><Input value={data.live_shoot_details?.locations || ""} onChange={e => updateField('live_shoot_details', 'locations', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Crew</Label><Input value={data.live_shoot_details?.crew || ""} onChange={e => updateField('live_shoot_details', 'crew', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Equipment</Label><Input value={data.live_shoot_details?.equipment || ""} onChange={e => updateField('live_shoot_details', 'equipment', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Lighting</Label><Input value={data.live_shoot_details?.lighting || ""} onChange={e => updateField('live_shoot_details', 'lighting', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Camera</Label><Input value={data.live_shoot_details?.camera || ""} onChange={e => updateField('live_shoot_details', 'camera', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Drone</Label><Input value={data.live_shoot_details?.drone || ""} onChange={e => updateField('live_shoot_details', 'drone', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Talent</Label><Input value={data.live_shoot_details?.talent || ""} onChange={e => updateField('live_shoot_details', 'talent', e.target.value)} /></div>
                  <div className="space-y-3 md:col-span-2"><Label>Permissions</Label><Input value={data.live_shoot_details?.permissions || ""} onChange={e => updateField('live_shoot_details', 'permissions', e.target.value)} /></div>
                </div>
              </Card>
            )}

            {prodType === 'photo' && (
              <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Palette className="h-5 w-5 text-primary" /> Photography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label>Shoot Type</Label>
                    <Select value={data.photography_details?.shoot_type || ""} onValueChange={v => updateField('photography_details', 'shoot_type', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Product">Product</SelectItem><SelectItem value="Fashion">Fashion</SelectItem><SelectItem value="Corporate">Corporate</SelectItem><SelectItem value="Event">Event</SelectItem><SelectItem value="Food">Food</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3"><Label>Number of Photos</Label><Input type="number" value={data.photography_details?.number_of_photos || ""} onChange={e => updateField('photography_details', 'number_of_photos', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Retouching</Label><Input value={data.photography_details?.retouching || ""} onChange={e => updateField('photography_details', 'retouching', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Album Required</Label>
                    <Select value={data.photography_details?.album || "No"} onValueChange={v => updateField('photography_details', 'album', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {prodType === 'post' && (
              <Card className="shadow-md rounded-3xl border-slate-200/60 p-8 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Settings className="h-5 w-5 text-primary" /> Post Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label>Editing Style</Label><Input value={data.post_production_details?.editing_style || ""} onChange={e => updateField('post_production_details', 'editing_style', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Motion Graphics</Label><Input value={data.post_production_details?.motion_graphics || ""} onChange={e => updateField('post_production_details', 'motion_graphics', e.target.value)} /></div>
                  <div className="space-y-3"><Label>VFX</Label><Input value={data.post_production_details?.vfx || ""} onChange={e => updateField('post_production_details', 'vfx', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Color Grade</Label><Input value={data.post_production_details?.color_grade || ""} onChange={e => updateField('post_production_details', 'color_grade', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Sound Design</Label><Input value={data.post_production_details?.sound_design || ""} onChange={e => updateField('post_production_details', 'sound_design', e.target.value)} /></div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={handlePrev} disabled={activeStep === 0} className="rounded-xl font-bold px-6 h-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {activeStep === 2 ? (
          <Button 
            onClick={async () => {
              const updated = { ...data, status: 'approved' };
              setData(updated);
              setSaveStatus("saving");
              try {
                await fetch(`/api/v1/crm/prospect/${prospectId}/requirement`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated)
                });
                setLastSaved(new Date());
                setSaveStatus("saved");
                toast({ title: "Requirement Chart Completed!", description: "You can now proceed to Proposal Generation." });
                setTimeout(() => setSaveStatus("idle"), 2000);
              } catch (e: any) {
                toast({ variant: "destructive", title: "Error Saving", description: e.message });
              }
            }} 
            className="rounded-xl font-bold px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={data.completeness_score < 100}
          >
            {data.completeness_score < 100 ? "Complete Required Fields" : <><CheckCircle2 className="w-4 h-4 mr-2" /> Save & Complete</>}
          </Button>
        ) : (
          <Button onClick={handleNext} className="rounded-xl font-bold px-8 h-12">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
