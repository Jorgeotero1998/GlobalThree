import type { VercelRequest, VercelResponse } from '@vercel/node';
import { filterCountries, parseListQuery } from '../lib/query.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const result = filterCountries(parseListQuery(req.query as Record<string, string | string[] | undefined>));
  return res.status(200).json(result);
}

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
}
