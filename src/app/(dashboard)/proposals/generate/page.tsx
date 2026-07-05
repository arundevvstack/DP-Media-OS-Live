"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save, CheckCircle2, Plus, Layout, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { toast } from "@/hooks/use-toast";
import { SlideData } from "@/app/(dashboard)/proposals/types";
import { SlidePreview } from "@/components/proposals/SlidePreview";
import { SlideEditor } from "@/components/proposals/SlideEditor";

function GenerateProposalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prospectId = searchParams.get("prospectId");
  
  const { companyId, isLoading: isTenantLoading } = useTenant();
  const [loading, setLoading] = useState(true);
  const [requirement, setRequirement] = useState<any>(null);
  
  const [proposalData, setProposalData] = useState({
    title: "",
    proposal_number: `PRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
  });
  
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLiveEdit, setIsLiveEdit] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!prospectId) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/crm/prospect/${prospectId}/requirement`)
      .then(res => res.json())
      .then(resData => {
        if (resData.requirement) {
          setRequirement(resData.requirement);
          const req = resData.requirement;
          
          setProposalData(prev => ({
            ...prev,
            title: `Proposal for ${req.project_details?.project_name || 'Project'}`,
          }));
          
          // Call AI generation if not already seeded
          import("@/ai/flows/generate-proposal-content").then(async ({ generateProposalContent }) => {
            try {
              const input = {
                prospect_name: req.client_details?.contact_name || "Valued Client",
                company_name: req.client_details?.company_name || "Client Company",
                industry: req.client_details?.industry || "Corporate",
                project_name: req.project_details?.project_name || "Strategic Project",
                objective: req.objective || "Achieve business goals",
                scope_of_work: req.project_details?.project_name || "Comprehensive delivery",
                deliverables: req.deliverables?.length ? req.deliverables : ["Strategy Document", "Final Assets"],
                timeline: req.project_details?.duration || "Standard Timeline",
                budget: req.project_details?.budget || "TBD"
              };
              
              const result = await generateProposalContent(input);
              if (result && result.slides) {
                setSlides(result.slides);
                setActiveSlideId(result.slides[0]?.id || null);
              }
            } catch (err) {
              console.error("AI Gen Failed", err);
              toast({ variant: "destructive", title: "AI Error", description: "Failed to generate AI proposal." });
            } finally {
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [prospectId]);

  const handleSave = async () => {
    if (!companyId || !prospectId || !requirement) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospectId,
          requirement_id: requirement.id,
          title: proposalData.title,
          proposal_number: proposalData.proposal_number,
          content: JSON.stringify(slides), // Save JSON as content
          status: "draft"
        })
      });
      
      if (!response.ok) throw new Error("Failed to save proposal");
      
      toast({ title: "Proposal Saved", description: "Your presentation deck is now saved in drafts." });
      router.push(`/proposals`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (isTenantLoading || loading) return (
    <div className="p-12 text-center h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#EE3F46] mb-6" />
      <h2 className="text-2xl font-bold text-slate-800">Generating Strategic Proposal...</h2>
      <p className="text-slate-500 mt-2 max-w-md mx-auto">Please wait while our AI Proposal Architect analyzes the requirement and generates 16 custom presentation slides tailored to this prospect.</p>
    </div>
  );

  if (!prospectId) {
    return <div className="p-12 text-center text-muted-foreground">No prospect ID provided. <Button variant="link" onClick={() => router.push('/proposals')}>Go back</Button></div>;
  }

  const activeSlide = slides.find(s => s.id === activeSlideId);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-white shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-xl font-bold">{proposalData.title || 'Untitled Proposal'}</h1>
          <p className="text-xs text-muted-foreground">{slides.length} slides • Preloaded from CRM</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
          <Button className="bg-primary text-white font-bold" onClick={handleSave} disabled={saving}><CheckCircle2 className="h-4 w-4 mr-2" /> Save & Continue</Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar thumbnails */}
        <div className="w-64 border-r bg-slate-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-sm">Slides</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
              const newSlideId = `slide_${Date.now()}`;
              const newSlide = {
                id: newSlideId,
                type: 'custom_content',
                title: 'Custom Title',
                imageUrl: '',
                textContent: ''
              } as const;
              setSlides([...slides, newSlide as any]);
              setActiveSlideId(newSlideId);
            }}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {slides.map((s, idx) => (
              <div 
                key={s.id}
                draggable
                onDragStart={(e) => {
                  setDraggedSlideIndex(idx);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSlideIndex !== null && draggedSlideIndex !== idx) {
                    const newSlides = [...slides];
                    const draggedSlide = newSlides[draggedSlideIndex];
                    newSlides.splice(draggedSlideIndex, 1);
                    newSlides.splice(idx, 0, draggedSlide);
                    setSlides(newSlides);
                  }
                  setDraggedSlideIndex(null);
                }}
                onDragEnd={() => setDraggedSlideIndex(null)}
                onClick={() => setActiveSlideId(s.id)}
                className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${activeSlideId === s.id ? 'border-[#EE3F46] ring-2 ring-[#EE3F46]/20' : 'border-transparent hover:border-slate-300'} ${draggedSlideIndex === idx ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
              >
                <div className="bg-white pointer-events-none">
                  <SlidePreview slide={s} scale={0.12} />
                </div>
                <div className="p-1 text-xs text-center bg-slate-100 font-medium text-slate-600 flex justify-between items-center px-2">
                  <span>{idx + 1}. {s.type}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" title="Duplicate Slide" onClick={(e) => {
                      e.stopPropagation();
                      const newSlides = [...slides];
                      const duplicatedSlide = JSON.parse(JSON.stringify(slides[idx]));
                      duplicatedSlide.id = `slide_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                      newSlides.splice(idx + 1, 0, duplicatedSlide);
                      setSlides(newSlides);
                      setActiveSlideId(duplicatedSlide.id);
                    }}><Copy className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" disabled={idx === 0} onClick={(e) => {
                      e.stopPropagation();
                      const newSlides = [...slides];
                      [newSlides[idx - 1], newSlides[idx]] = [newSlides[idx], newSlides[idx - 1]];
                      setSlides(newSlides);
                    }}><ArrowUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200" disabled={idx === slides.length - 1} onClick={(e) => {
                      e.stopPropagation();
                      const newSlides = [...slides];
                      [newSlides[idx + 1], newSlides[idx]] = [newSlides[idx], newSlides[idx + 1]];
                      setSlides(newSlides);
                    }}><ArrowDown className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
           <div className="absolute top-4 right-4 z-10">
             <Button 
               variant={isLiveEdit ? "default" : "outline"} 
               className={isLiveEdit ? "bg-[#EE3F46] hover:bg-[#EE3F46]/90" : "bg-white"}
               onClick={() => setIsLiveEdit(!isLiveEdit)}
             >
               {isLiveEdit ? "Exit Live Edit" : "Enable Live Edit"}
             </Button>
           </div>
           <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
             {activeSlide ? (
               <div className="shadow-2xl ring-4 ring-transparent transition-all" style={isLiveEdit ? { boxShadow: "0 0 0 4px #EE3F4633, 0 25px 50px -12px rgba(0, 0, 0, 0.25)" } : {}}>
                 <SlidePreview 
                   slide={activeSlide} 
                   scale={0.45} 
                   isLiveEdit={isLiveEdit} 
                   onChange={(updated) => {
                     setSlides(slides.map(s => s.id === updated.id ? updated : s));
                   }} 
                 />
               </div>
             ) : (
               <div className="text-slate-400 flex flex-col items-center">
                 <Layout className="h-12 w-12 mb-4 opacity-50" />
                 <p>Select a slide to edit</p>
               </div>
             )}
           </div>
        </div>

        {/* Right Sidebar Form */}
        <div className="w-96 border-l bg-white flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-sm">Edit Slide</span>
            {activeSlide && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                if (confirm("Are you sure you want to delete this slide?")) {
                  const newSlides = slides.filter(s => s.id !== activeSlideId);
                  setSlides(newSlides);
                  setActiveSlideId(newSlides.length > 0 ? newSlides[0].id : null);
                }
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeSlide ? (
              <SlideEditor 
                slide={activeSlide} 
                onChange={(updated) => {
                  setSlides(slides.map(s => s.id === updated.id ? updated : s));
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center mt-10">No slide selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateProposalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>}>
      <GenerateProposalContent />
    </Suspense>
  );
}

