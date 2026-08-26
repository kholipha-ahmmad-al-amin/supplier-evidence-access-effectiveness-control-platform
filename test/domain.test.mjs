import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AccessEffectivenessControlService } from '../src/domain.mjs';
import { AtomicStore } from '../src/store.mjs';

class MemoryStore {
  constructor() {
    this.database = { accessEffectivenessControlReviews: [] };
    this.writes = 0;
  }
  read() { return structuredClone(this.database); }
  write(data) { this.database = structuredClone(data); this.writes += 1; }
}

const owner = { id: 'owner-835', role: 'evidence_owner' };
const input = {
  supplierId: 'SUP-835',
  evidenceReference: 'EVD-835',
  controlReference: 'CTL-835-ACCESS-01',
  effectivenessScope: 'access_control'
};
const chain = [
  { action: 'assessControl', role: 'effectiveness_control_assessor' },
  { action: 'verifyEvidence', role: 'effectiveness_evidence_verifier' },
  { action: 'validateResult', role: 'effectiveness_result_validator' },
  { action: 'certifyEffectiveness', role: 'effectiveness_authority' },
  { action: 'closeControl', role: 'effectiveness_registrar' }
];

describe('AccessEffectivenessControlService', () => {
  it('records a complete independently controlled access-effectiveness control lifecycle', () => {
    const store = new MemoryStore();
    const service = new AccessEffectivenessControlService(store);
    let review = service.submit(input, owner, 'request-submit-835');
    for (const step of chain) {
      review = service.transition(review.id, step.action, { note: `${step.action} completed` }, { id: step.role, role: step.role }, `request-${step.action}-835`);
    }
    expect(review.status).toBe('control_closed');
    expect(review.events.map((event) => event.type)).toContain('effectiveness_control_closed');
    expect(store.writes).toBe(6);
  });

  it('rejects invalid effectiveness scopes before persistence', () => {
    const store = new MemoryStore();
    const service = new AccessEffectivenessControlService(store);
    expect(() => service.submit({ ...input, effectivenessScope: 'other' }, owner, 'request-invalid-835')).toThrow('effectiveness scope is invalid');
    expect(store.writes).toBe(0);
  });

  it('preserves state when an actor lacks the required role', () => {
    const store = new MemoryStore();
    const service = new AccessEffectivenessControlService(store);
    const review = service.submit(input, owner, 'request-role-835');
    expect(() => service.transition(review.id, 'assessControl', { note: 'attempt' }, owner, 'request-role-denied-835')).toThrow('role effectiveness_control_assessor is required');
    expect(service.get(review.id).status).toBe('submitted');
    expect(store.writes).toBe(1);
  });

  it('creates an empty collection when the data file is absent', () => {
    const directory = mkdtempSync(join(tmpdir(), 'access-effectiveness-control-'));
    try {
      const store = new AtomicStore(join(directory, 'data', 'access-effectiveness-control-reviews.json'));
      expect(store.read()).toEqual({ accessEffectivenessControlReviews: [] });
      store.write({ accessEffectivenessControlReviews: [] });
      expect(store.read()).toEqual({ accessEffectivenessControlReviews: [] });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
