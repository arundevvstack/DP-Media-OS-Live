import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineEvent {
  id: string;
  type: 'COMMENT' | 'APPROVAL' | 'WORKFLOW_CHANGE' | 'FILE_UPLOAD' | 'MEETING' | 'SYSTEM_AUDIT';
  actor: { name: string; avatarUrl?: string };
  timestamp: Date;
  content: React.ReactNode;
}

interface UniversalTimelineProps {
  entityId: string;
  entityType: string;
  events: TimelineEvent[];
}

/**
 * Universal Timeline Component
 * Renders the unified feed of every action connected to a specific BaseEntity.
 */
export const UniversalTimeline: React.FC<UniversalTimelineProps> = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map(event => (
        <Card key={event.id} className="relative border-l-4 border-l-primary ml-4">
          <CardContent className="pt-4 pb-4 flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {event.actor.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">{event.actor.name}</span>
                <span className="text-xs text-muted-foreground">{event.timestamp.toLocaleString()}</span>
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-2">
                {event.type.replace('_', ' ')}
              </div>
              <div className="text-sm">
                {event.content}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
