import { conflict, forbidden, missing } from './errors.mjs';
import { effectivenessScope, text } from './validation.mjs';

const transitions = {
  assessControl: { from: 'submitted', to: 'control_assessed', role: 'effectiveness_control_assessor', event: 'effectiveness_control_assessed' },
  verifyEvidence: { from: 'control_assessed', to: 'evidence_verified', role: 'effectiveness_evidence_verifier', event: 'effectiveness_evidence_verified' },
  validateResult: { from: 'evidence_verified', to: 'result_validated', role: 'effectiveness_result_validator', event: 'effectiveness_result_validated' },
  certifyEffectiveness: { from: 'result_validated', to: 'effectiveness_certified', role: 'effectiveness_authority', event: 'effectiveness_certified' },
  closeControl: { from: 'effectiveness_certified', to: 'control_closed', role: 'effectiveness_registrar', event: 'effectiveness_control_closed' }
};

const timestamp = () => new Date().toISOString();
const requireRole = (actor, role) => {
  if (!actor?.id || actor.role !== role) throw forbidden(`role ${role} is required`);
};

export class AccessEffectivenessControlService {
  constructor(store) {
    this.store = store;
  }

  submit(input, actor, requestId) {
    requireRole(actor, 'evidence_owner');
    const database = this.store.read();
    const now = timestamp();
    const review = {
      id: crypto.randomUUID(),
      supplierId: text(input.supplierId, 'supplier id'),
      evidenceReference: text(input.evidenceReference, 'evidence reference'),
      controlReference: text(input.controlReference, 'control reference'),
      effectivenessScope: effectivenessScope(input.effectivenessScope),
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      events: [{ type: 'access_effectiveness_submitted', actorId: actor.id, requestId, at: now }]
    };
    database.accessEffectivenessControlReviews.push(review);
    this.store.write(database);
    return review;
  }

  transition(id, action, input, actor, requestId) {
    const policy = transitions[action];
    if (!policy) throw missing('action was not found');
    requireRole(actor, policy.role);
    const database = this.store.read();
    const review = database.accessEffectivenessControlReviews.find((entry) => entry.id === id);
    if (!review) throw missing('access-effectiveness control review was not found');
    if (review.status !== policy.from) throw conflict(`access-effectiveness control review must be ${policy.from}`);
    const note = text(input.note, 'note');
    const now = timestamp();
    review.status = policy.to;
    review.updatedAt = now;
    review.events.push({ type: policy.event, actorId: actor.id, requestId, note, at: now });
    database.accessEffectivenessControlReviews = database.accessEffectivenessControlReviews.map((entry) => entry.id === id ? review : entry);
    this.store.write(database);
    return review;
  }

  get(id) {
    const review = this.store.read().accessEffectivenessControlReviews.find((entry) => entry.id === id);
    if (!review) throw missing('access-effectiveness control review was not found');
    return review;
  }
}
