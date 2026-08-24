import { describe, it, expect, beforeEach } from 'vitest';
import { IncidentTracker } from '../observation/IncidentTracker';

describe('Phase 3G - Incident Tracker (Production)', () => {
  beforeEach(() => {
    IncidentTracker.clear();
  });

  it('Classifies and records incidents with rollback triggers', () => {
    IncidentTracker.track({
      severity: 'CRITICAL',
      rootCause: 'Redis Crash',
      affectedQueue: 'notifications',
      rollbackTriggered: true
    });

    const incidents = IncidentTracker.getIncidents();
    expect(incidents.length).toBe(1);
    expect(incidents[0].severity).toBe('CRITICAL');
    expect(incidents[0].rollbackTriggered).toBe(true);
    expect(incidents[0].id).toBeDefined();
    expect(incidents[0].timestamp).toBeDefined();
  });
});
