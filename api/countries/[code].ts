import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getByCode } from '../lib/query.js';
import { setCors } from '../countries/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const code = String(req.query.code ?? '').toUpperCase();
  if (!code) return res.status(400).json({ error: 'Country code required' });

  const country = getByCode(code);
  if (!country) return res.status(404).json({ error: 'Country not found' });
  return res.status(200).json(country);
}
