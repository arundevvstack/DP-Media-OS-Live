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
import { Loader2, Save, Check, Target, Sparkles, Bot, Briefcase, Palette, Video, Calendar, Upload, Settings, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, X, ChevronsUpDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  "Master Video (4K/UHD)",
  "Master Video (1080p/HD)",
  "Vertical Cutdowns (9:16)",
  "Square Cutdowns (1:1)",
  "Teaser / Trailer (15s/30s)",
  "Textless Master (Clean Version)",
  "Subtitles (SRT/VTT Files)",
  "Subtitles (Burned-in)",
  "Raw Footage (Unedited/Log)",
  "Audio Stems (Dialog, Music, SFX)",
  "Final Audio Mixdown (WAV/MP3)",
  "Source Project Files (Premiere, Ae, DaVinci)",
  "Motion Graphics / Toolkit (.mogrt)",
  "Photography (Edited/Retouched)",
  "Photography (RAW Files)",
  "Thumbnails / Cover Art",
  "Behind the Scenes (BTS) Video",
  "GIFs / Looping Assets",
  "Final Script / Transcripts",
  "B-Roll / Highlight Package"
];

function MultiSelectCombobox({ 
  options, 
  selected, 
  onChange,
  placeholder = "Select or type to add custom..."
}: { 
  options: string[], 
  selected: string[], 
  onChange: (val: string[]) => void,
  placeholder?: string
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(x => x !== opt));
    else onChange([...selected, opt]);
  }

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newVal = inputValue.trim();
      if (!selected.includes(newVal)) {
        onChange([...selected, newVal]);
      }
      setInputValue("");
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 rounded-full border border-primary/20 transition-all">
              {item}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 rounded-full" onClick={() => handleUnselect(item)} />
            </Badge>
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between rounded-xl bg-slate-50/50 text-slate-500 font-normal border-slate-200 hover:bg-slate-100 transition-colors">
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden" align="start">
          <div className="flex flex-col w-full">
            <div className="flex items-center border-b px-2">
              <Input 
                placeholder="Search or type custom..." 
                className="border-0 focus-visible:ring-0 shadow-none h-10 px-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {inputValue.trim() !== "" && !options.includes(inputValue.trim()) && !selected.includes(inputValue.trim()) && (
                <div 
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-primary font-medium"
                  onClick={() => {
                    onChange([...selected, inputValue.trim()]);
                    setInputValue("");
                  }}
                >
                  <Plus className="w-4 h-4" /> Add "{inputValue.trim()}"
                </div>
              )}
              {options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase())).map(opt => {
                const isSelected = selected.includes(opt);
                return (
                  <div 
                    key={opt}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    onClick={() => toggle(opt)}
                  >
                    <span className={isSelected ? "font-semibold text-primary" : ""}>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                )
              })}
              {options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && inputValue.trim() === "" && (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No matching options.</div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
  onComplete?: () => void;
}

export function RequirementChartForm({ prospectId, companyName, serviceVertical, industry, subVertical, projectType, notes, onComplete }: RequirementChartFormProps) {
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
      <div className="space-y-2.5">
        <Label className="text-slate-500">{label}</Label>
        {!showCustom ? (
          <Select value={value || ""} onValueChange={v => {
            if (v === "Custom") {
              onChange("Custom"); 
            } else {
              onChange(v);
            }
          }}>
            <SelectTrigger className="rounded-xl bg-slate-50/50"><SelectValue placeholder="Select..." /></SelectTrigger>
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
              className="rounded-xl bg-slate-50/50"
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
        if (updated.ai_style) score += 15;
        if (updated.production_requirements?.voice_over || updated.production_requirements?.ai_language) score += 15;
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
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 md:px-6 pt-4">
      {/* Top Header & Completeness (Always Visible) */}
      <div className="flex flex-col p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
              {data.completeness_score >= 100 ? (
                <Sparkles className="h-5 w-5 text-emerald-500" />
              ) : (
                <Target className="h-5 w-5 text-primary" /> 
              )}
              Requirement Analysis
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-xs text-slate-500">
                {data.completeness_score >= 100 ? "All required information provided." : "Complete necessary information."}
              </p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                {saveStatus === "saving" ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : saveStatus === "saved" ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Save className="h-3 w-3 text-slate-400" />
                )}
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : "Waiting"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {data.completeness_score >= 100 ? (
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm font-bold text-sm uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" /> Finished
              </div>
            ) : (
              <span className="text-3xl font-black text-primary tracking-tighter drop-shadow-sm">{Math.round(data.completeness_score || 0)}%</span>
            )}
          </div>
        </div>
        
        <Progress value={data.completeness_score || 0} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50" indicatorColor={data.completeness_score >= 100 ? "bg-emerald-500" : "bg-primary"} />
        
        <div className="flex flex-wrap gap-5 pt-4">
          <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ${hasClient ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasClient ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Client
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ${hasProject ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasProject ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Project
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ${hasTimeline ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasTimeline ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Timeline
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300 ${assetsStatusOk ? 'text-emerald-600' : 'text-amber-500'}`}>
            {assetsStatusOk ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {assetsNotRequired ? 'Assets Not Required' : hasAssets ? 'Assets Provided' : 'Assets Missing'}
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
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 shrink-0",
                isActive ? "bg-primary text-white scale-110 shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-2 ring-primary/10" 
                  : isPast ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-slate-50 text-slate-400 border border-slate-100"
              )}>
                {isPast ? <Check className="w-5 h-5" /> : <Icon className={cn("w-5 h-5", isActive ? "animate-in zoom-in duration-300" : "")} />}
              </div>
              <span className={cn(
                "ml-3 font-bold text-sm whitespace-nowrap transition-colors duration-300",
                isActive ? "text-slate-900 dark:text-slate-50" : isPast ? "text-emerald-600" : "text-slate-400"
              )}>{step.label}</span>
              {idx < steps.length - 1 && <div className={cn("hidden md:block h-[1px] w-8 lg:w-16 mx-4 transition-colors duration-500", isPast ? "bg-emerald-300" : "bg-slate-200 dark:bg-slate-800")} />}
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        {/* Step 0: Classification */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-1.5 bg-primary/10 rounded-lg"><Target className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">1. Project Category</h3>
                  <p className="text-muted-foreground text-xs">Select the overarching vertical for this project.</p>
                </div>
              </div>
              <div className="p-6 flex flex-wrap gap-2.5">
                {PROJECT_CATEGORIES.map(cat => (
                  <div 
                    key={cat} 
                    onClick={() => updateField('project_details', 'project_category', cat)}
                    className={cn(
                      "px-3 py-2 rounded-lg border cursor-pointer transition-all font-medium text-xs",
                      data.project_details?.project_category === cat 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-slate-200 hover:border-primary/30 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50"
                    )}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-sm rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-1.5 bg-primary/10 rounded-lg"><Video className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">2. Production Workflow</h3>
                  <p className="text-muted-foreground text-xs">This determines the dynamic fields you'll need to fill out.</p>
                </div>
              </div>
              <div className="p-6 flex flex-wrap gap-3">
                {PRODUCTION_TYPES.map(type => (
                  <div 
                    key={type.id} 
                    onClick={() => updateField('project_details', 'production_type', type.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 font-medium text-sm",
                      prodType === type.id 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-slate-200 hover:border-primary/30 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50"
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
            <Card className="shadow-sm rounded-2xl border-slate-200/60 dark:border-slate-800 bg-white p-6">
              <h3 className="font-bold text-xl flex items-center gap-2 border-b pb-3 mb-6 text-slate-800 dark:text-slate-100">
                <Briefcase className="w-5 h-5 text-primary" /> Core Information
              </h3>
              
              <div className="space-y-8">
                {/* Identity Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Identity & Objectives
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5"><Label className="text-slate-500">Client Name</Label><Input value={data.client_details?.client_name || ""} onChange={e => updateField('client_details', 'client_name', e.target.value)} className="rounded-xl bg-slate-50/50" /></div>
                    <div className="space-y-2.5"><Label className="text-slate-500">Project Name</Label><Input value={data.project_details?.project_name || ""} onChange={e => updateField('project_details', 'project_name', e.target.value)} className="rounded-xl bg-slate-50/50" /></div>
                    
                    {renderDropdownWithCustom(
                      "Project Type (Sub-category)", 
                      data.project_details?.project_type || "", 
                      ["Commercial", "Explainer Video", "Promo", "Documentary", "Music Video", "Short Film", "Social Reel", "Corporate Overview", "Training/Educational"], 
                      v => updateField('project_details', 'project_type', v)
                    )}
                    
                    {renderDropdownWithCustom(
                      "Project Objective", 
                      data.objective || "", 
                      ["Brand Awareness", "Lead Generation", "Product Launch", "Educational/Training", "Event Coverage", "Internal Comms", "Sales Enablement"], 
                      v => updateField('root', 'objective', v)
                    )}
                  </div>
                </div>

                {/* Timeline & Formatting */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Timeline & Format
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderDropdownWithCustom(
                      "Duration", 
                      data.timeline?.duration || "", 
                      ["15 Seconds", "30 Seconds", "60 Seconds", "90 Seconds", "2-3 Minutes", "5+ Minutes", "Feature Length"], 
                      v => updateField('timeline', 'duration', v)
                    )}
                    <div className="space-y-2.5"><Label className="text-slate-500">Deadline</Label><Input type="date" value={data.timeline?.delivery_date || ""} onChange={e => updateField('timeline', 'delivery_date', e.target.value)} className="rounded-xl bg-slate-50/50" /></div>
                    <div className="space-y-2.5"><Label className="text-slate-500">Aspect Ratio</Label>
                      <Select value={data.technical_specs?.aspect_ratio || ""} onValueChange={v => updateField('technical_specs', 'aspect_ratio', v)}>
                        <SelectTrigger className="rounded-xl bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{ASPECT_RATIOS.map(ar => <SelectItem key={ar} value={ar}>{ar}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* References */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> References & Notes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5"><Label className="text-slate-500">Reference Links</Label><Input value={data.assets?.reference_links || ""} onChange={e => updateField('assets', 'reference_links', e.target.value)} className="rounded-xl bg-slate-50/50" placeholder="YouTube, Vimeo, etc." /></div>
                    <div className="space-y-2.5"><Label className="text-slate-500">Brand Guidelines</Label><Input value={data.assets?.brand_guidelines || ""} onChange={e => updateField('assets', 'brand_guidelines', e.target.value)} className="rounded-xl bg-slate-50/50" placeholder="Link to guidelines..." /></div>
                    <div className="space-y-2.5 md:col-span-2"><Label className="text-slate-500">Additional Notes</Label><Textarea value={data.notes || ""} onChange={e => updateField('root', 'notes', e.target.value)} className="rounded-xl bg-slate-50/50 min-h-[80px]" placeholder="Any other specific requirements..." /></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
              <h3 className="font-bold text-xl flex items-center gap-2 border-b pb-3 mb-6 text-slate-800 dark:text-slate-100">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Universal Deliverables
              </h3>
              <MultiSelectCombobox options={FINAL_DELIVERABLES} selected={data.universal_deliverables?.list || []} onChange={v => updateField('universal_deliverables', 'list', v)} placeholder="Search standard deliverables or add custom..." />
            </Card>

            <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
              <div className="flex justify-between items-center border-b pb-3 mb-6">
                <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Upload className="w-5 h-5 text-primary" /> Client Assets
                </h3>
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
                <div className="space-y-2.5">
                  <Label className="text-slate-500">Asset Links (Google Drive, Dropbox, etc.)</Label>
                  <Input 
                    value={data.assets?.custom_asset_links || ""} 
                    onChange={e => updateField('assets', 'custom_asset_links', e.target.value)} 
                    placeholder="https://drive.google.com/..."
                    className="rounded-xl bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-slate-500">Upload Files</Label>
                  <div 
                    onClick={() => document.getElementById('asset-upload')?.click()} 
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload files</p>
                    <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
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
              <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Bot className="h-5 w-5 text-primary" /> AI Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5"><Label className="text-slate-500">AI Style</Label>
                    <Select value={data.ai_style || ""} onValueChange={v => updateField('root', 'ai_style', v)}>
                      <SelectTrigger className="rounded-xl bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Realistic">Realistic</SelectItem><SelectItem value="Stylized">Stylized</SelectItem><SelectItem value="Animation">Animation</SelectItem><SelectItem value="Cinematic">Cinematic</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5 md:col-span-2"><Label className="text-slate-500">AI Assets Required</Label>
                    <MultiSelectCombobox options={["Images", "Video", "Avatar", "Voice", "Music", "Motion Graphics"]} selected={data.ai_assets_required || []} onChange={v => updateField('root', 'ai_assets_required', v)} placeholder="Select assets..." />
                  </div>
                  <div className="space-y-2.5 md:col-span-2"><Label className="text-slate-500">Prompt Notes</Label><Textarea value={data.notes || ""} onChange={e => updateField('root', 'notes', e.target.value)} className="rounded-xl bg-slate-50/50 min-h-[80px]" /></div>
                  
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
              <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Video className="h-5 w-5 text-primary" /> Hybrid Production (Live Shoot)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderDropdownWithCustom("Locations", data.live_shoot_details?.locations || "", ["Studio", "On-Location (Indoor)", "On-Location (Outdoor)", "Multiple Locations", "TBD"], v => updateField('live_shoot_details', 'locations', v))}
                  {renderDropdownWithCustom("Crew", data.live_shoot_details?.crew || "", ["Skeleton Crew (1-2)", "Small Crew (3-5)", "Full Crew (6+)", "TBD"], v => updateField('live_shoot_details', 'crew', v))}
                  {renderDropdownWithCustom("Equipment", data.live_shoot_details?.equipment || "", ["Basic", "Standard", "Cinema Grade", "TBD"], v => updateField('live_shoot_details', 'equipment', v))}
                  {renderDropdownWithCustom("Shoot Days", data.live_shoot_details?.shoot_days || "", ["1 Day", "2 Days", "3 Days", "4+ Days", "TBD"], v => updateField('live_shoot_details', 'shoot_days', v))}
                  {renderDropdownWithCustom("Actors", data.live_shoot_details?.actors || "", ["None", "Employees/Real People", "1-2 Actors", "Large Cast", "Voiceover Only"], v => updateField('live_shoot_details', 'actors', v))}
                </div>
                <h3 className="font-bold text-xl flex items-center gap-2 mt-8 mb-6"><Bot className="h-5 w-5 text-primary" /> Hybrid Production (AI Components)</h3>
                <MultiSelectCombobox options={["AI Cleanup", "AI Enhancement", "AI VFX", "AI Voice", "AI Background"]} selected={data.hybrid_details?.ai_components || []} onChange={v => updateField('hybrid_details', 'ai_components', v)} placeholder="Select AI components..." />
              </Card>
            )}

            {prodType === 'live' && (
              <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Video className="h-5 w-5 text-primary" /> Live Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderDropdownWithCustom("Shoot Days", data.live_shoot_details?.shoot_days || "", ["1 Day", "2 Days", "3 Days", "4+ Days", "TBD"], v => updateField('live_shoot_details', 'shoot_days', v))}
                  {renderDropdownWithCustom("Locations", data.live_shoot_details?.locations || "", ["Studio", "On-Location (Indoor)", "On-Location (Outdoor)", "Multiple Locations", "TBD"], v => updateField('live_shoot_details', 'locations', v))}
                  {renderDropdownWithCustom("Crew", data.live_shoot_details?.crew || "", ["Skeleton Crew (1-2)", "Small Crew (3-5)", "Full Crew (6+)", "TBD"], v => updateField('live_shoot_details', 'crew', v))}
                  {renderDropdownWithCustom("Equipment", data.live_shoot_details?.equipment || "", ["Basic", "Standard", "Cinema Grade", "TBD"], v => updateField('live_shoot_details', 'equipment', v))}
                  {renderDropdownWithCustom("Lighting", data.live_shoot_details?.lighting || "", ["Natural", "Basic Kit", "Full Grid", "TBD"], v => updateField('live_shoot_details', 'lighting', v))}
                  {renderDropdownWithCustom("Camera", data.live_shoot_details?.camera || "", ["Mirrorless", "Cinema Camera (RED/ARRI)", "Multi-cam", "TBD"], v => updateField('live_shoot_details', 'camera', v))}
                  {renderDropdownWithCustom("Drone", data.live_shoot_details?.drone || "", ["None", "FPV", "Standard Drone", "Heavy Lift"], v => updateField('live_shoot_details', 'drone', v))}
                  {renderDropdownWithCustom("Talent", data.live_shoot_details?.talent || "", ["None", "Employees/Real People", "1-2 Actors", "Large Cast", "Voiceover Only"], v => updateField('live_shoot_details', 'talent', v))}
                  {renderDropdownWithCustom("Permissions", data.live_shoot_details?.permissions || "", ["Client Handled", "Agency Handled", "None Required"], v => updateField('live_shoot_details', 'permissions', v))}
                </div>
              </Card>
            )}

            {prodType === 'photo' && (
              <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Palette className="h-5 w-5 text-primary" /> Photography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5"><Label className="text-slate-500">Shoot Type</Label>
                    <Select value={data.photography_details?.shoot_type || ""} onValueChange={v => updateField('photography_details', 'shoot_type', v)}>
                      <SelectTrigger className="rounded-xl bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Product">Product</SelectItem><SelectItem value="Fashion">Fashion</SelectItem><SelectItem value="Corporate">Corporate</SelectItem><SelectItem value="Event">Event</SelectItem><SelectItem value="Food">Food</SelectItem></SelectContent>
                    </Select>
                  </div>
                  {renderDropdownWithCustom("Number of Photos", data.photography_details?.number_of_photos || "", ["10-20", "20-50", "50-100", "100+"], v => updateField('photography_details', 'number_of_photos', v))}
                  {renderDropdownWithCustom("Retouching", data.photography_details?.retouching || "", ["Basic", "Standard", "High-end/Magazine"], v => updateField('photography_details', 'retouching', v))}
                  <div className="space-y-2.5"><Label className="text-slate-500">Album Required</Label>
                    <Select value={data.photography_details?.album || "No"} onValueChange={v => updateField('photography_details', 'album', v)}>
                      <SelectTrigger className="rounded-xl bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {prodType === 'post' && (
              <Card className="shadow-sm rounded-2xl border-slate-200/60 p-6 bg-white">
                <h3 className="font-bold text-xl flex items-center gap-2 mb-6"><Settings className="h-5 w-5 text-primary" /> Post Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderDropdownWithCustom("Editing Style", data.post_production_details?.editing_style || "", ["Fast-paced", "Cinematic", "Corporate/Clean", "Documentary style", "Trendy/Social"], v => updateField('post_production_details', 'editing_style', v))}
                  {renderDropdownWithCustom("Motion Graphics", data.post_production_details?.motion_graphics || "", ["None", "Basic Text/Lower Thirds", "Moderate (Animations/Charts)", "Heavy (Full 2D/3D)"], v => updateField('post_production_details', 'motion_graphics', v))}
                  {renderDropdownWithCustom("VFX", data.post_production_details?.vfx || "", ["None", "Basic Cleanup", "Advanced VFX (CGI/Compositing)"], v => updateField('post_production_details', 'vfx', v))}
                  {renderDropdownWithCustom("Color Grade", data.post_production_details?.color_grade || "", ["Standard", "Stylized/Creative", "Match Reference", "HDR"], v => updateField('post_production_details', 'color_grade', v))}
                  {renderDropdownWithCustom("Sound Design", data.post_production_details?.sound_design || "", ["Basic Mixing", "Advanced Foley/SFX", "Original Score", "Stock Music Only"], v => updateField('post_production_details', 'sound_design', v))}
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
                toast({ title: "Requirement Chart Completed!", description: "Ready for Proposal Generation." });
                setTimeout(() => {
                  setSaveStatus("idle");
                  if (onComplete) onComplete();
                }, 1000);
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
