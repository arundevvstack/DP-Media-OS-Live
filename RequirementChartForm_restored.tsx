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
import { Loader2, Save, Check, Target, Sparkles, Bot, Briefcase, Palette, Video, Calendar, Upload, Settings, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { generateRequirementScope } from "@/ai/flows/generate-requirements";
import { cn } from "@/lib/utils";

const PROJECT_CATEGORIES = [
  "Advertisement", "Corporate", "Documentary", "Biography", "Fashion", "Product", 
  "Real Estate", "Social Media", "Event", "Educational", "Music Video", "Short Film", 
  "CGI", "Animation", "Photography", "Other"
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
}

export function RequirementChartForm({ prospectId, companyName, serviceVertical, industry }: RequirementChartFormProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [generatingScope, setGeneratingScope] = useState(false);
  
  // WIZARD STATE
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetch(`/api/v1/crm/prospect/${prospectId}/requirement`)
      .then(res => res.json())
      .then((resData) => {
        if (resData.requirement) setData(resData.requirement);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [prospectId]);

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
      
      const hasClient = updated.client_details?.client_name;
      if (hasClient) { score += 15; itemsChecked++; }
      
      const hasProject = updated.project_details?.project_name && updated.objective;
      if (hasProject) { score += 15; itemsChecked++; }
      
      const hasTimeline = updated.timeline?.delivery_date;
      if (hasTimeline) { score += 15; itemsChecked++; }

      const hasCategory = updated.project_details?.project_category;
      if (hasCategory) { score += 15; itemsChecked++; }

      const hasProdType = updated.project_details?.production_type;
      if (hasProdType) { score += 15; itemsChecked++; }
      
      const hasAssets = updated.assets?.brand_guidelines || updated.assets?.reference_links;
      if (hasAssets) { score += 25; itemsChecked++; }
      
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
    { label: "Classification", icon: Target },
    { label: "Core Details", icon: Briefcase },
    { label: "Production Specs", icon: Video }
  ];

  const hasClient = !!(data.client_details?.client_name);
  const hasProject = !!(data.project_details?.project_name);
  const hasTimeline = !!(data.timeline?.delivery_date);
  const hasAssets = !!(data.assets?.reference_links);

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto px-4 md:px-8 pt-4">
      {/* Top Header & Completeness (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col justify-center space-y-4 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Requirement Completeness</h2>
            <span className="text-3xl font-black text-primary drop-shadow-sm">{Math.round(data.completeness_score || 0)}%</span>
          </div>
          <Progress value={data.completeness_score || 0} className="h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-wrap gap-4 pt-2">
            <div className={`flex items-center gap-2 text-sm font-medium ${hasClient ? 'text-emerald-600' : 'text-slate-400'}`}>{hasClient ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Client</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${hasProject ? 'text-emerald-600' : 'text-slate-400'}`}>{hasProject ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Project</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${hasTimeline ? 'text-emerald-600' : 'text-slate-400'}`}>{hasTimeline ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Timeline</div>
            <div className={`flex items-center gap-2 text-sm font-medium ${hasAssets ? 'text-emerald-600' : 'text-amber-500'}`}>{hasAssets ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} Assets Missing</div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-right space-y-1">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Auto-Save Status</h3>
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-2">
              {saveStatus === "saving" && <><Loader2 className="h-4 w-4 animate-spin text-primary" /> Saving...</>}
              {saveStatus === "saved" && <><Check className="h-4 w-4 text-emerald-500" /> Saved</>}
              {saveStatus === "idle" && lastSaved && `Saved at ${lastSaved.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between px-2 overflow-x-auto gap-4">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isPast = idx < activeStep;
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-sm shrink-0",
                isActive ? "bg-primary text-white scale-110" : isPast ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
              )}>
                {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "ml-3 font-semibold text-sm whitespace-nowrap",
                isActive ? "text-slate-800 dark:text-slate-100" : isPast ? "text-emerald-600" : "text-slate-400"
              )}>{step.label}</span>
              {idx < steps.length - 1 && <div className={cn("h-1 w-12 md:w-24 mx-4 rounded-full transition-colors", isPast ? "bg-emerald-200" : "bg-slate-100 dark:bg-slate-800")} />}
            </div>
          )
        })}
      </div>

      <div className="min-h-[500px]">
        {/* Step 0: Classification */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="shadow-lg rounded-3xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="font-bold text-xl flex items-center gap-2 text-primary">1. Project Category</h3>
                <p className="text-muted-foreground text-sm mt-1">Select the business category for this project.</p>
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
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="font-bold text-xl flex items-center gap-2 text-primary">2. Production Type</h3>
                <p className="text-muted-foreground text-sm mt-1">This determines the production workflow.</p>
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
              <h3 className="font-bold text-lg border-b pb-2 mb-6">Client Assets</h3>
              <div onClick={() => toast({ title: "Coming soon", description: "File upload integration pending." })} className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Click to upload Client Assets (Images, Videos, PDFs, ZIP, Brand Kit)</p>
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
                  <div className="space-y-3"><Label>Voice Over</Label><Input value={data.production_requirements?.voice_over || ""} onChange={e => updateField('production_requirements', 'voice_over', e.target.value)} /></div>
                  <div className="space-y-3"><Label>Subtitles</Label><Input value={data.production_requirements?.subtitles || ""} onChange={e => updateField('production_requirements', 'subtitles', e.target.value)} /></div>
                  <div className="space-y-3"><Label>AI Language</Label><Input value={data.production_requirements?.ai_language || ""} onChange={e => updateField('production_requirements', 'ai_language', e.target.value)} /></div>
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

