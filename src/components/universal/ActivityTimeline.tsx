"use client";

import React from "react";

interface ActivityEvent {
  id: string;
  action: string;
  user_id: string;
  created_at: Date;
  details?: string;
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-muted-foreground p-4 text-center">No activity recorded yet.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
            {i !== events.length - 1 && <div className="w-px h-full bg-border my-1" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">
              <span className="capitalize">{event.action.toLowerCase()}</span> by {event.user_id}
            </p>
            {event.details && (
              <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              {new Date(event.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
