"use client";

import React from "react";
import { SlideData } from "@/app/(dashboard)/proposals/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

function swapItems<T>(arr: T[], idx1: number, idx2: number): T[] {
  const newArr = [...arr];
  [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
  return newArr;
}

function ArrayItemActions({
  idx,
  length,
  onMoveUp,
  onMoveDown,
  onDelete,
  className = ""
}: {
  idx: number,
  length: number,
  onMoveUp: () => void,
  onMoveDown: () => void,
  onDelete: () => void,
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-200" disabled={idx === 0} onClick={onMoveUp}>
        <ArrowUp className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-200" disabled={idx === length - 1} onClick={onMoveDown}>
        <ArrowDown className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={onDelete}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function SlideEditor({ slide, onChange }: { slide: SlideData; onChange: (updatedSlide: SlideData) => void }) {
  
  const updateField = (field: string, value: any) => {
    onChange({ ...slide, [field]: value } as SlideData);
  };

  switch (slide.type) {
    case 'cover':
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={slide.title} onChange={e => updateField('title', e.target.value)} />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={slide.subtitle} onChange={e => updateField('subtitle', e.target.value)} />
          </div>
          <div>
            <Label>Client Name</Label>
            <Input value={slide.clientName} onChange={e => updateField('clientName', e.target.value)} />
          </div>
          <div>
            <Label>Reference No</Label>
            <Input value={slide.referenceNo} onChange={e => updateField('referenceNo', e.target.value)} />
          </div>
        </div>
      );

    case 'executive_summary':
      return (
        <div className="space-y-4">
          <div>
            <Label>Overview</Label>
            <Textarea value={slide.overview} onChange={e => updateField('overview', e.target.value)} rows={6} />
          </div>
          <div>
            <Label>Expected Outcome</Label>
            <Textarea value={slide.expectedOutcome} onChange={e => updateField('expectedOutcome', e.target.value)} rows={4} />
          </div>
        </div>
      );

    case 'understanding':
      return (
        <div className="space-y-4">
          <div>
            <Label>Overview</Label>
            <Textarea value={slide.overview} onChange={e => updateField('overview', e.target.value)} rows={4} />
          </div>
          <div>
            <Label>Bullet Points</Label>
            {slide.bulletPoints.map((pt, idx) => (
              <div key={idx} className="flex gap-2 mt-2 items-center">
                <Input className="flex-1" value={pt} onChange={e => {
                  const newPts = [...slide.bulletPoints];
                  newPts[idx] = e.target.value;
                  updateField('bulletPoints', newPts);
                }} />
                <ArrayItemActions
                  idx={idx}
                  length={slide.bulletPoints.length}
                  onMoveUp={() => updateField('bulletPoints', swapItems(slide.bulletPoints, idx, idx - 1))}
                  onMoveDown={() => updateField('bulletPoints', swapItems(slide.bulletPoints, idx, idx + 1))}
                  onDelete={() => updateField('bulletPoints', slide.bulletPoints.filter((_, i) => i !== idx))}
                />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" onClick={() => updateField('bulletPoints', [...slide.bulletPoints, ""])}>
              <Plus className="h-4 w-4 mr-2" /> Add Point
            </Button>
          </div>
        </div>
      );

    case 'objectives':
      return (
        <div className="space-y-4">
          <Label>Goals</Label>
          {slide.goals.map((goal, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.goals.length}
                onMoveUp={() => updateField('goals', swapItems(slide.goals, idx, idx - 1))}
                onMoveDown={() => updateField('goals', swapItems(slide.goals, idx, idx + 1))}
                onDelete={() => updateField('goals', slide.goals.filter((_, i) => i !== idx))}
              />
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={goal.title} onChange={e => {
                  const newGoals = [...slide.goals];
                  newGoals[idx].title = e.target.value;
                  updateField('goals', newGoals);
                }} />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={goal.description} onChange={e => {
                  const newGoals = [...slide.goals];
                  newGoals[idx].description = e.target.value;
                  updateField('goals', newGoals);
                }} rows={2} />
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('goals', [...slide.goals, { title: "", description: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Goal
          </Button>
        </div>
      );

    case 'proposed_solution':
      return (
        <div className="space-y-4">
          <div>
            <Label>Strategy</Label>
            <Textarea value={slide.strategy} onChange={e => updateField('strategy', e.target.value)} rows={4} />
          </div>
          <Label>Key Pillars</Label>
          {slide.keyPillars.map((pillar, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.keyPillars.length}
                onMoveUp={() => updateField('keyPillars', swapItems(slide.keyPillars, idx, idx - 1))}
                onMoveDown={() => updateField('keyPillars', swapItems(slide.keyPillars, idx, idx + 1))}
                onDelete={() => updateField('keyPillars', slide.keyPillars.filter((_, i) => i !== idx))}
              />
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={pillar.title} onChange={e => {
                  const newPillars = [...slide.keyPillars];
                  newPillars[idx].title = e.target.value;
                  updateField('keyPillars', newPillars);
                }} />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={pillar.description} onChange={e => {
                  const newPillars = [...slide.keyPillars];
                  newPillars[idx].description = e.target.value;
                  updateField('keyPillars', newPillars);
                }} rows={2} />
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('keyPillars', [...slide.keyPillars, { title: "", description: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Pillar
          </Button>
        </div>
      );

    case 'scope':
      return (
        <div className="space-y-4">
          <Label>Scope Requirements</Label>
          {slide.requirements.map((req, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.requirements.length}
                onMoveUp={() => updateField('requirements', swapItems(slide.requirements, idx, idx - 1))}
                onMoveDown={() => updateField('requirements', swapItems(slide.requirements, idx, idx + 1))}
                onDelete={() => updateField('requirements', slide.requirements.filter((_, i) => i !== idx))}
              />
              <div>
                <Label className="text-xs">Requirement</Label>
                <Input value={req.requirement} onChange={e => {
                  const newReqs = [...slide.requirements];
                  newReqs[idx].requirement = e.target.value;
                  updateField('requirements', newReqs);
                }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Support (e.g. YES)</Label>
                  <Input value={req.support} onChange={e => {
                    const newReqs = [...slide.requirements];
                    newReqs[idx].support = e.target.value;
                    updateField('requirements', newReqs);
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Comment</Label>
                  <Input value={req.comment} onChange={e => {
                    const newReqs = [...slide.requirements];
                    newReqs[idx].comment = e.target.value;
                    updateField('requirements', newReqs);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('requirements', [...slide.requirements, { requirement: "", support: "YES", comment: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Requirement
          </Button>
        </div>
      );

    case 'methodology':
      return (
        <div className="space-y-4">
          <Label>Methodology Steps</Label>
          {slide.steps.map((step, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.steps.length}
                onMoveUp={() => updateField('steps', swapItems(slide.steps, idx, idx - 1))}
                onMoveDown={() => updateField('steps', swapItems(slide.steps, idx, idx + 1))}
                onDelete={() => updateField('steps', slide.steps.filter((_, i) => i !== idx))}
              />
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={step.title} onChange={e => {
                  const newSteps = [...slide.steps];
                  newSteps[idx].title = e.target.value;
                  updateField('steps', newSteps);
                }} />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={step.description} onChange={e => {
                  const newSteps = [...slide.steps];
                  newSteps[idx].description = e.target.value;
                  updateField('steps', newSteps);
                }} rows={2} />
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('steps', [...slide.steps, { title: "", description: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
        </div>
      );

    case 'deliverables':
      return (
        <div className="space-y-4">
          <Label>Key Deliverables</Label>
          {slide.items.map((pt, idx) => (
            <div key={idx} className="flex gap-2 mt-2 items-center">
              <Input className="flex-1" value={pt} onChange={e => {
                const newPts = [...slide.items];
                newPts[idx] = e.target.value;
                updateField('items', newPts);
              }} />
              <ArrayItemActions
                idx={idx}
                length={slide.items.length}
                onMoveUp={() => updateField('items', swapItems(slide.items, idx, idx - 1))}
                onMoveDown={() => updateField('items', swapItems(slide.items, idx, idx + 1))}
                onDelete={() => updateField('items', slide.items.filter((_, i) => i !== idx))}
              />
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('items', [...slide.items, ""])}>
            <Plus className="h-4 w-4 mr-2" /> Add Deliverable
          </Button>
        </div>
      );

    case 'timeline':
      return (
        <div className="space-y-4">
          <Label>Milestones</Label>
          {slide.milestones.map((ms, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.milestones.length}
                onMoveUp={() => updateField('milestones', swapItems(slide.milestones, idx, idx - 1))}
                onMoveDown={() => updateField('milestones', swapItems(slide.milestones, idx, idx + 1))}
                onDelete={() => updateField('milestones', slide.milestones.filter((_, i) => i !== idx))}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Phase</Label>
                  <Input value={ms.phase} onChange={e => {
                    const newMs = [...slide.milestones];
                    newMs[idx].phase = e.target.value;
                    updateField('milestones', newMs);
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Input value={ms.duration} onChange={e => {
                    const newMs = [...slide.milestones];
                    newMs[idx].duration = e.target.value;
                    updateField('milestones', newMs);
                  }} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Details</Label>
                <Textarea value={ms.details} onChange={e => {
                  const newMs = [...slide.milestones];
                  newMs[idx].details = e.target.value;
                  updateField('milestones', newMs);
                }} rows={2} />
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateField('milestones', [...slide.milestones, { phase: "", duration: "", details: "" }])}>
            <Plus className="h-4 w-4 mr-2" /> Add Milestone
          </Button>
        </div>
      );

    case 'custom_content':
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={slide.title} onChange={e => updateField('title', e.target.value)} />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input placeholder="https://..." value={slide.imageUrl} onChange={e => updateField('imageUrl', e.target.value)} />
          </div>
          <div>
            <Label>Text Block</Label>
            <Textarea value={slide.textContent} onChange={e => updateField('textContent', e.target.value)} rows={6} />
          </div>
        </div>
      );

    case 'commercials': {
      const updateCommercials = (newItems: any[], taxPercentageStr: string, updatedTitle: string) => {
        const taxPct = parseFloat(taxPercentageStr) || 0;
        let subtotal = 0;
        const calculatedItems = newItems.map((it, i) => {
          const qty = parseFloat(it.qty) || 0;
          let rateStr = (it.unitRateInr || "").toString().replace(/[^0-9.]/g, '');
          const rate = parseFloat(rateStr) || 0;
          const total = qty * rate;
          subtotal += total;
          
          return {
            ...it,
            slNo: String(i + 1),
            totalInr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)
          };
        });

        const tax = subtotal * (taxPct / 100);
        const grandTotal = subtotal + tax;
        
        const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

        onChange({
          ...slide,
          title: updatedTitle,
          items: calculatedItems,
          taxPercentage: taxPercentageStr,
          subtotalInr: formatCurrency(subtotal),
          taxInr: formatCurrency(tax),
          grandTotalInr: formatCurrency(grandTotal)
        } as SlideData);
      };

      return (
        <div className="space-y-4">
          <div>
            <Label>Slide Title</Label>
            <Input value={slide.title} onChange={e => updateCommercials(slide.items, slide.taxPercentage || "18", e.target.value)} />
          </div>
          <div>
            <Label>Tax Percentage (%)</Label>
            <Input type="number" value={slide.taxPercentage || "18"} onChange={e => updateCommercials(slide.items, e.target.value, slide.title)} />
          </div>
          <Label>Line Items</Label>
          {slide.items.map((item, idx) => (
            <div key={idx} className="p-4 border rounded-xl space-y-3 relative bg-slate-50">
              <ArrayItemActions
                className="absolute top-2 right-2"
                idx={idx}
                length={slide.items.length}
                onMoveUp={() => updateCommercials(swapItems(slide.items, idx, idx - 1), slide.taxPercentage || "18", slide.title)}
                onMoveDown={() => updateCommercials(swapItems(slide.items, idx, idx + 1), slide.taxPercentage || "18", slide.title)}
                onDelete={() => updateCommercials(slide.items.filter((_, i) => i !== idx), slide.taxPercentage || "18", slide.title)}
              />
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={item.description} onChange={e => {
                  const newItems = [...slide.items];
                  newItems[idx].description = e.target.value;
                  updateCommercials(newItems, slide.taxPercentage || "18", slide.title);
                }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" value={item.qty} onChange={e => {
                    const newItems = [...slide.items];
                    newItems[idx].qty = e.target.value;
                    updateCommercials(newItems, slide.taxPercentage || "18", slide.title);
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Input value={item.unit} onChange={e => {
                    const newItems = [...slide.items];
                    newItems[idx].unit = e.target.value;
                    updateCommercials(newItems, slide.taxPercentage || "18", slide.title);
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Rate (₹)</Label>
                  <Input value={item.unitRateInr} onChange={e => {
                    const newItems = [...slide.items];
                    newItems[idx].unitRateInr = e.target.value;
                    updateCommercials(newItems, slide.taxPercentage || "18", slide.title);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => updateCommercials([...slide.items, { slNo: "", description: "", unit: "Nos", qty: "1", unitRateInr: "0", totalInr: "0", unitRateUsd: "", totalUsd: "" }], slide.taxPercentage || "18", slide.title)}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      );
    }

    case 'team':
    case 'terms':
    case 'why_choose_us':
    case 'portfolio':
    case 'next_steps':
    case 'thank_you':
      return (
        <div className="p-4 text-center text-slate-500 text-sm">
          Basic editor supported for core slides. Form inputs for this slide type ({slide.type}) can be added later.
        </div>
      );

    default:
      return <div className="p-4 text-center text-slate-500">Editor not available for this slide type.</div>;
  }
}
