import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCompare } from './lib/query.js';
import { setCors } from './countries/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const a = String(req.query.a ?? '').toUpperCase();
  const b = String(req.query.b ?? '').toUpperCase();
  if (!a || !b) return res.status(400).json({ error: 'Query params a and b required' });

  const result = getCompare(a, b);
  if (!result) return res.status(404).json({ error: 'One or both countries not found' });
  return res.status(200).json(result);
}
