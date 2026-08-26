import { inputError } from './errors.mjs';

export const text = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) throw inputError(`${name} is required`);
  return value.trim();
};

export const effectivenessScope = (value) => {
  value = text(value, 'effectiveness scope');
  if (!['access_control', 'export_control', 'exception_control'].includes(value)) throw inputError('effectiveness scope is invalid');
  return value;
};

export const actor = (headers) => ({ id: headers['x-actor-id'], role: headers['x-actor-role'] });
