import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.mjs';
import { AccessEffectivenessControlService } from '../src/domain.mjs';

class MemoryStore {
  constructor() { this.database = { accessEffectivenessControlReviews: [] }; }
  read() { return structuredClone(this.database); }
  write(data) { this.database = structuredClone(data); }
}

const headers = {
  'x-actor-id': 'owner-http-835',
  'x-actor-role': 'evidence_owner',
  'x-request-id': 'request-http-835'
};
const body = {
  supplierId: 'SUP-835',
  evidenceReference: 'EVD-835',
  controlReference: 'CTL-835-ACCESS-01',
  effectivenessScope: 'access_control'
};

describe('access-effectiveness control HTTP transport', () => {
  it('returns a valid client request identifier for accepted submission', async () => {
    const app = createApp(new AccessEffectivenessControlService(new MemoryStore()));
    const response = await request(app).post('/access-effectiveness-control-reviews').set(headers).send(body);
    expect(response.status).toBe(201);
    expect(response.headers['x-request-id']).toBe(headers['x-request-id']);
    expect(response.body.status).toBe('submitted');
  });

  it('returns a structured 422 error for invalid input', async () => {
    const app = createApp(new AccessEffectivenessControlService(new MemoryStore()));
    const response = await request(app).post('/access-effectiveness-control-reviews').set(headers).send({ ...body, effectivenessScope: 'invalid' });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('invalid_input');
    expect(response.body.error.requestId).toBe(headers['x-request-id']);
  });
});
