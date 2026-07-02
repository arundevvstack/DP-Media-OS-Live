"use client";

import React from "react";
import { SlideData } from "@/app/(dashboard)/proposals/types";
import { cn } from "@/lib/utils";

const DP_RED = "#F03A47";
const DP_GRAY = "#F8F9FA";

function EditableText({
  value,
  isLiveEdit,
  onChange,
  className,
  as: Component = 'div',
  style
}: {
  value: string;
  isLiveEdit?: boolean;
  onChange?: (val: string) => void;
  className?: string;
  as?: any;
  style?: React.CSSProperties;
}) {
  if (!isLiveEdit) {
    return <Component className={className} style={style}>{value}</Component>;
  }
  return (
    <Component 
      className={cn(className, "outline-dashed outline-2 outline-blue-400 hover:outline-blue-500 cursor-text transition-all")}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        if (e.currentTarget.textContent !== value) {
           onChange?.(e.currentTarget.textContent || "");
        }
      }}
    >
      {value}
    </Component>
  );
}

export function SlidePreview({ slide, scale = 1, isLiveEdit = false, onChange }: { slide: SlideData; scale?: number; isLiveEdit?: boolean; onChange?: (slide: SlideData) => void }) {
  const updateSlide = (updates: Partial<SlideData>) => {
    if (onChange) onChange({ ...slide, ...updates } as SlideData);
  };

  return (
    <div 
      className="relative overflow-hidden bg-white shadow-md border shrink-0"
      style={{
        width: (1920 * scale) + "px",
        height: (1080 * scale) + "px",
      }}
    >
      <div 
        className="absolute top-0 left-0 bg-white"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <SlideRenderer slide={slide} isLiveEdit={isLiveEdit} onChange={updateSlide} />
        {slide.type !== 'cover' && slide.type !== 'thank_you' && <SlideFooter />}
        {(slide.type === 'cover' || slide.type === 'thank_you') && <SlideFooterRed />}
      </div>
    </div>
  );
}

function SlideFooter() {
  return (
    <div className="absolute bottom-[60px] left-[120px] right-[120px] flex justify-between items-end">
      <div className="text-[24px] text-slate-400 font-light">www.defineperspective.in</div>
      <div className="w-[80px] h-[80px] flex items-center justify-center font-bold text-[40px] tracking-tighter" style={{ backgroundColor: DP_RED, color: "white" }}>
        dp
      </div>
    </div>
  );
}

function SlideFooterRed() {
  return (
    <div className="absolute bottom-[60px] left-[120px] right-[120px] flex justify-between items-end">
      <div className="text-[24px] text-white/80 font-light">www.defineperspective.in</div>
      <div className="w-[80px] h-[80px] flex items-center justify-center font-bold text-[40px] tracking-tighter bg-white" style={{ color: DP_RED }}>
        dp
      </div>
    </div>
  );
}

function SlideTitle({ black, red, isLiveEdit, onBlackChange, onRedChange }: { black: string; red?: string; isLiveEdit?: boolean; onBlackChange?: (v: string) => void; onRedChange?: (v: string) => void }) {
  return (
    <h2 className="text-[80px] font-medium text-slate-900 mb-16 flex gap-4">
      <EditableText as="span" value={black} isLiveEdit={isLiveEdit} onChange={onBlackChange} />
      {red !== undefined && (
        <EditableText as="span" value={red} isLiveEdit={isLiveEdit} onChange={onRedChange} style={{ color: DP_RED, fontWeight: "bold" }} />
      )}
    </h2>
  );
}

function SlideRenderer({ slide, isLiveEdit, onChange }: { slide: SlideData; isLiveEdit: boolean; onChange: (updates: Partial<SlideData>) => void }) {
  switch (slide.type) {
    case 'cover':
      return (
        <div className="w-full h-full flex flex-col justify-center px-[120px]" style={{ backgroundColor: DP_RED, color: "white" }}>
          <EditableText as="h1" className="text-[140px] font-bold leading-[1.1] mb-6" value={slide.title} isLiveEdit={isLiveEdit} onChange={v => onChange({ title: v })} />
          <EditableText as="p" className="text-[56px] font-light mb-24 opacity-90 max-w-[1400px]" value={slide.subtitle} isLiveEdit={isLiveEdit} onChange={v => onChange({ subtitle: v })} />
          <div>
            <p className="text-[36px] font-light opacity-80">Proposal for</p>
            <EditableText as="h2" className="text-[72px] font-bold mt-2" value={slide.clientName} isLiveEdit={isLiveEdit} onChange={v => onChange({ clientName: v })} />
            <div className="flex gap-2 text-[28px] mt-8 opacity-70">
              <span>Reference No:</span>
              <EditableText as="span" value={slide.referenceNo} isLiveEdit={isLiveEdit} onChange={v => onChange({ referenceNo: v })} />
            </div>
          </div>
        </div>
      );

    case 'executive_summary':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Executive" red="Summary" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-2 gap-20">
            <div>
              <h3 className="text-[40px] font-bold text-slate-800 mb-8">Overview</h3>
              <EditableText as="p" className="text-[32px] text-slate-600 leading-relaxed" value={slide.overview} isLiveEdit={isLiveEdit} onChange={v => onChange({ overview: v })} />
            </div>
            <div>
              <h3 className="text-[40px] font-bold text-slate-800 mb-8" style={{ color: DP_RED }}>Expected Outcome</h3>
              <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-200">
                <EditableText as="p" className="text-[36px] text-slate-700 leading-snug font-medium" value={slide.expectedOutcome} isLiveEdit={isLiveEdit} onChange={v => onChange({ expectedOutcome: v })} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'understanding':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Our" red="Understanding" isLiveEdit={isLiveEdit} />
          <EditableText as="p" className="text-[44px] text-slate-700 leading-snug mb-16 max-w-[1500px]" value={slide.overview} isLiveEdit={isLiveEdit} onChange={v => onChange({ overview: v })} />
          <div className="space-y-8 pl-8">
            {slide.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-8">
                <div className="w-5 h-5 rounded-full mt-5 shrink-0" style={{ backgroundColor: DP_RED }} />
                <EditableText as="p" className="text-[40px] text-slate-700 leading-snug flex-1" value={point} isLiveEdit={isLiveEdit} onChange={v => {
                  const newPts = [...slide.bulletPoints];
                  newPts[idx] = v;
                  onChange({ bulletPoints: newPts });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'objectives':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Project" red="Objectives" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-2 gap-12">
            {slide.goals.map((goal, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 flex gap-8 items-start">
                <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-[24px] font-bold shrink-0" style={{ backgroundColor: DP_RED }}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <EditableText as="h3" className="text-[36px] font-bold text-slate-800 mb-4" value={goal.title} isLiveEdit={isLiveEdit} onChange={v => {
                    const newGoals = [...slide.goals];
                    newGoals[idx].title = v;
                    onChange({ goals: newGoals });
                  }} />
                  <EditableText as="p" className="text-[28px] text-slate-600 leading-relaxed" value={goal.description} isLiveEdit={isLiveEdit} onChange={v => {
                    const newGoals = [...slide.goals];
                    newGoals[idx].description = v;
                    onChange({ goals: newGoals });
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'proposed_solution':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Proposed" red="Solution" isLiveEdit={isLiveEdit} />
          <EditableText as="p" className="text-[40px] text-slate-700 leading-snug mb-16 border-l-[8px] pl-10" style={{ borderColor: DP_RED }} value={slide.strategy} isLiveEdit={isLiveEdit} onChange={v => onChange({ strategy: v })} />
          <div className="grid grid-cols-3 gap-12">
            {slide.keyPillars.map((pillar, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 border-t-[8px]" style={{ borderTopColor: DP_RED }}>
                <EditableText as="h3" className="text-[32px] font-bold text-slate-800 mb-6" value={pillar.title} isLiveEdit={isLiveEdit} onChange={v => {
                  const newPillars = [...slide.keyPillars];
                  newPillars[idx].title = v;
                  onChange({ keyPillars: newPillars });
                }} />
                <EditableText as="p" className="text-[26px] text-slate-600 leading-relaxed" value={pillar.description} isLiveEdit={isLiveEdit} onChange={v => {
                  const newPillars = [...slide.keyPillars];
                  newPillars[idx].description = v;
                  onChange({ keyPillars: newPillars });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'scope':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Scope" red="Confirmation" isLiveEdit={isLiveEdit} />
          <div className="w-full bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
            <div className="flex text-white p-8" style={{ backgroundColor: DP_RED }}>
              <div className="w-1/3 text-[32px] font-bold pl-4">Requirement</div>
              <div className="w-1/6 text-[32px] font-bold text-center">Support</div>
              <div className="w-1/2 text-[32px] font-bold pl-12">Define Perspective Scope Comment</div>
            </div>
            <div className="divide-y divide-slate-100">
              {slide.requirements.map((req, idx) => (
                <div key={idx} className="flex p-8 items-center">
                  <EditableText as="div" className="w-1/3 text-[28px] text-slate-700 font-medium pl-4 pr-8" value={req.requirement} isLiveEdit={isLiveEdit} onChange={v => {
                    const newReqs = [...slide.requirements];
                    newReqs[idx].requirement = v;
                    onChange({ requirements: newReqs });
                  }} />
                  <EditableText as="div" className="w-1/6 text-[28px] font-bold text-center" style={{ color: (req.support || '').toUpperCase() === 'YES' ? '#10B981' : DP_RED }} value={req.support || 'N/A'} isLiveEdit={isLiveEdit} onChange={v => {
                    const newReqs = [...slide.requirements];
                    newReqs[idx].support = v;
                    onChange({ requirements: newReqs });
                  }} />
                  <EditableText as="div" className="w-1/2 text-[28px] text-slate-600 pl-12 pr-4" value={req.comment} isLiveEdit={isLiveEdit} onChange={v => {
                    const newReqs = [...slide.requirements];
                    newReqs[idx].comment = v;
                    onChange({ requirements: newReqs });
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'methodology':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Methodology &" red="Process" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-3 gap-16">
            {slide.steps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-200">
                <div className="flex items-center gap-8 mb-8">
                  <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-white text-[32px] font-bold shrink-0" style={{ backgroundColor: DP_RED }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <EditableText as="h3" className="text-[40px] font-bold text-slate-800 leading-tight" value={step.title} isLiveEdit={isLiveEdit} onChange={v => {
                    const newSteps = [...slide.steps];
                    newSteps[idx].title = v;
                    onChange({ steps: newSteps });
                  }} />
                </div>
                <EditableText as="p" className="text-[28px] text-slate-600 leading-relaxed" value={step.description} isLiveEdit={isLiveEdit} onChange={v => {
                  const newSteps = [...slide.steps];
                  newSteps[idx].description = v;
                  onChange({ steps: newSteps });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'deliverables':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Key" red="Deliverables" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-2 gap-x-20 gap-y-12">
            {slide.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="w-[16px] h-[60px] shrink-0 rounded-full" style={{ backgroundColor: DP_RED }} />
                <EditableText as="p" className="text-[36px] text-slate-700 font-medium flex-1" value={item} isLiveEdit={isLiveEdit} onChange={v => {
                  const newItems = [...slide.items];
                  newItems[idx] = v;
                  onChange({ items: newItems });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Project" red="Timeline" isLiveEdit={isLiveEdit} />
          <div className="space-y-8">
            {slide.milestones.map((ms, idx) => (
              <div key={idx} className="flex bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="w-[300px] flex flex-col justify-center items-center text-white p-8" style={{ backgroundColor: DP_RED }}>
                  <span className="text-[24px] font-light uppercase tracking-widest opacity-80 mb-2">Duration</span>
                  <EditableText as="span" className="text-[48px] font-bold text-center leading-none" value={ms.duration} isLiveEdit={isLiveEdit} onChange={v => {
                    const newMs = [...slide.milestones];
                    newMs[idx].duration = v;
                    onChange({ milestones: newMs });
                  }} />
                </div>
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <EditableText as="h3" className="text-[40px] font-bold text-slate-800 mb-4" value={ms.phase} isLiveEdit={isLiveEdit} onChange={v => {
                    const newMs = [...slide.milestones];
                    newMs[idx].phase = v;
                    onChange({ milestones: newMs });
                  }} />
                  <EditableText as="p" className="text-[28px] text-slate-600" value={ms.details} isLiveEdit={isLiveEdit} onChange={v => {
                    const newMs = [...slide.milestones];
                    newMs[idx].details = v;
                    onChange({ milestones: newMs });
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Team &" red="Responsibilities" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-3 gap-12">
            {slide.roles.map((r, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-200 text-center flex flex-col items-center">
                <div className="w-[120px] h-[120px] rounded-full bg-slate-100 border-[8px] flex items-center justify-center mb-8" style={{ borderColor: DP_RED }}>
                  <span className="text-[48px] font-black text-slate-300">{(r.role || '?').charAt(0)}</span>
                </div>
                <EditableText as="h3" className="text-[36px] font-bold text-slate-800 mb-4 w-full" value={r.role} isLiveEdit={isLiveEdit} onChange={v => {
                  const newRoles = [...slide.roles];
                  newRoles[idx].role = v;
                  onChange({ roles: newRoles });
                }} />
                <EditableText as="p" className="text-[26px] text-slate-600 leading-relaxed w-full" value={r.responsibility} isLiveEdit={isLiveEdit} onChange={v => {
                  const newRoles = [...slide.roles];
                  newRoles[idx].responsibility = v;
                  onChange({ roles: newRoles });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'commercials':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Commercial" red="Offer" isLiveEdit={isLiveEdit} />
          <div className="w-full bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
            <div className="flex text-white p-6" style={{ backgroundColor: DP_RED }}>
              <div className="w-[10%] text-[24px] font-bold pl-4">No.</div>
              <div className="w-[45%] text-[24px] font-bold">Description</div>
              <div className="w-[10%] text-[24px] font-bold text-center">Qty</div>
              <div className="w-[15%] text-[24px] font-bold text-right">Unit Rate</div>
              <div className="w-[20%] text-[24px] font-bold text-right pr-8">Total</div>
            </div>
            <div className="divide-y divide-slate-100">
              {slide.items.map((item, idx) => (
                <div key={idx} className="flex p-6 items-center">
                  <div className="w-[10%] text-[24px] font-bold text-slate-400 pl-4">{item.slNo}</div>
                  <EditableText as="div" className="w-[45%] text-[28px] font-medium text-slate-800 pr-4" value={item.description} isLiveEdit={isLiveEdit} onChange={v => {
                    const newItems = [...slide.items];
                    newItems[idx].description = v;
                    onChange({ items: newItems });
                  }} />
                  <div className="w-[10%] text-[24px] text-slate-600 text-center flex justify-center gap-2">
                    <EditableText as="span" value={String(item.qty)} isLiveEdit={isLiveEdit} onChange={v => {
                      const newItems = [...slide.items];
                      newItems[idx].qty = v;
                      onChange({ items: newItems });
                    }} /> 
                    <EditableText as="span" value={item.unit} isLiveEdit={isLiveEdit} onChange={v => {
                      const newItems = [...slide.items];
                      newItems[idx].unit = v;
                      onChange({ items: newItems });
                    }} />
                  </div>
                  <EditableText as="div" className="w-[15%] text-[24px] text-slate-600 text-right" value={item.unitRateInr} isLiveEdit={isLiveEdit} onChange={v => {
                    const newItems = [...slide.items];
                    newItems[idx].unitRateInr = v;
                    onChange({ items: newItems });
                  }} />
                  <EditableText as="div" className="w-[20%] text-[28px] font-bold text-slate-800 text-right pr-8" value={item.totalInr} isLiveEdit={isLiveEdit} onChange={v => {
                    const newItems = [...slide.items];
                    newItems[idx].totalInr = v;
                    onChange({ items: newItems });
                  }} />
                </div>
              ))}
            </div>
            {(slide.subtotalInr || slide.taxInr || slide.grandTotalInr) && (
              <div className="bg-slate-50 border-t border-slate-200">
                <div className="flex p-4 px-6 items-center justify-end text-[24px]">
                  <div className="w-[30%] text-right text-slate-500 pr-8">Subtotal</div>
                  <EditableText as="div" className="w-[20%] font-bold text-slate-700 text-right pr-8" value={slide.subtotalInr || "0"} isLiveEdit={isLiveEdit} onChange={v => onChange({ subtotalInr: v })} />
                </div>
                <div className="flex p-4 px-6 items-center justify-end text-[24px]">
                  <div className="w-[30%] text-right text-slate-500 pr-8">Tax ({slide.taxPercentage || "18"}%)</div>
                  <EditableText as="div" className="w-[20%] font-bold text-slate-700 text-right pr-8" value={slide.taxInr || "0"} isLiveEdit={isLiveEdit} onChange={v => onChange({ taxInr: v })} />
                </div>
                <div className="flex p-6 px-6 items-center justify-end text-[28px] bg-slate-100 border-t border-slate-200">
                  <div className="w-[30%] text-right font-bold text-slate-800 pr-8">Grand Total</div>
                  <EditableText as="div" className="w-[20%] font-black text-slate-900 text-right pr-8" value={slide.grandTotalInr || "0"} isLiveEdit={isLiveEdit} onChange={v => onChange({ grandTotalInr: v })} />
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'terms':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Terms &" red="Conditions" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-2 gap-x-20 gap-y-12">
            {slide.terms.map((term, idx) => (
              <div key={idx} className="flex items-start gap-6">
                <div className="w-4 h-4 rounded-full mt-4 shrink-0" style={{ backgroundColor: DP_RED }} />
                <EditableText as="p" className="text-[32px] text-slate-700 leading-snug flex-1" value={term} isLiveEdit={isLiveEdit} onChange={v => {
                  const newTerms = [...slide.terms];
                  newTerms[idx] = v;
                  onChange({ terms: newTerms });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'why_choose_us':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Why Choose" red="Define Perspective" isLiveEdit={isLiveEdit} />
          <div className="grid grid-cols-2 gap-12">
            {slide.reasons.map((reason, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200">
                <h3 className="text-[40px] font-bold text-slate-800 mb-6 flex items-center gap-6">
                  <span className="text-[48px]" style={{ color: DP_RED }}>★</span> 
                  <EditableText as="span" className="flex-1" value={reason.title} isLiveEdit={isLiveEdit} onChange={v => {
                    const newReasons = [...slide.reasons];
                    newReasons[idx].title = v;
                    onChange({ reasons: newReasons });
                  }} />
                </h3>
                <EditableText as="p" className="text-[28px] text-slate-600 leading-relaxed pl-16" value={reason.description} isLiveEdit={isLiveEdit} onChange={v => {
                  const newReasons = [...slide.reasons];
                  newReasons[idx].description = v;
                  onChange({ reasons: newReasons });
                }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'portfolio':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Relevant Portfolio &" red="Credentials" isLiveEdit={isLiveEdit} />
          <EditableText as="p" className="text-[40px] text-slate-700 leading-snug mb-16" value={slide.description} isLiveEdit={isLiveEdit} onChange={v => onChange({ description: v })} />
          <div className="w-full bg-white rounded-[40px] shadow-sm border border-slate-200 p-16 flex items-center justify-center">
            {/* The user's uploaded logo list image */}
            <img src="/client-logos.png" alt="Client Logos" className="w-full h-auto object-contain max-h-[500px]" />
          </div>
        </div>
      );

    case 'next_steps':
      return (
        <div className="w-full h-full px-[120px] py-[100px]" style={{ backgroundColor: DP_GRAY }}>
          <SlideTitle black="Next" red="Steps" isLiveEdit={isLiveEdit} />
          <div className="space-y-12 max-w-[1200px]">
            {slide.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-12">
                <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-white text-[48px] font-black shrink-0" style={{ backgroundColor: DP_RED }}>
                  {idx + 1}
                </div>
                <div className="bg-white flex-1 p-10 rounded-[32px] shadow-sm border border-slate-200">
                  <EditableText as="p" className="text-[40px] font-medium text-slate-800" value={step} isLiveEdit={isLiveEdit} onChange={v => {
                    const newSteps = [...slide.steps];
                    newSteps[idx] = v;
                    onChange({ steps: newSteps });
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'custom_content':
      return (
        <div className="w-full h-full px-[120px] py-[100px] flex flex-col" style={{ backgroundColor: DP_GRAY }}>
          {slide.title && <EditableText as="h2" className="text-[80px] font-medium text-slate-900 mb-16" value={slide.title} isLiveEdit={isLiveEdit} onChange={v => onChange({ title: v })} />}
          <div className="flex-1 flex gap-16 mt-8">
            <div className="w-1/2 relative bg-slate-200 rounded-[32px] overflow-hidden border border-slate-300 flex items-center justify-center">
              {slide.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[32px] text-slate-400 font-medium">Image Placeholder</span>
              )}
            </div>
            <div className="w-1/2 flex items-center">
              <EditableText as="p" className="text-[36px] text-slate-700 leading-relaxed whitespace-pre-wrap w-full" value={slide.textContent || "Enter your custom text here..."} isLiveEdit={isLiveEdit} onChange={v => onChange({ textContent: v })} />
            </div>
          </div>
        </div>
      );

    case 'thank_you':
      return (
        <div className="w-full h-full flex flex-col justify-center px-[120px]" style={{ backgroundColor: DP_RED, color: "white" }}>
          <h1 className="text-[140px] font-light leading-[1.1] mb-2">Thank You</h1>
          <EditableText as="h2" className="text-[140px] font-bold mb-24" value={slide.companyName} isLiveEdit={isLiveEdit} onChange={v => onChange({ companyName: v })} />
          <EditableText as="p" className="text-[56px] font-light opacity-90 max-w-[1500px] leading-snug" value={slide.closingRemark} isLiveEdit={isLiveEdit} onChange={v => onChange({ closingRemark: v })} />
        </div>
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <p className="text-[48px] text-slate-400 font-bold">Preview not available for this slide type.</p>
        </div>
      );
  }
}
