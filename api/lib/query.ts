import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AggregateStats,
  CountryRecord,
  GlobeIndexEntry,
  PaginatedResponse,
} from '../../shared/types.js';

const ROOT = join(process.cwd(), 'data');

let encyclopedia: CountryRecord[] | null = null;
let globeIndex: GlobeIndexEntry[] | null = null;

function loadEncyclopedia(): CountryRecord[] {
  if (!encyclopedia) {
    encyclopedia = JSON.parse(readFileSync(join(ROOT, 'encyclopedia.json'), 'utf8')) as CountryRecord[];
  }
  return encyclopedia;
}

function loadGlobeIndex(): GlobeIndexEntry[] {
  if (!globeIndex) {
    globeIndex = JSON.parse(readFileSync(join(ROOT, 'globe-index.json'), 'utf8')) as GlobeIndexEntry[];
  }
  return globeIndex;
}

export interface ListQuery {
  page: number;
  pageSize: number;
  search: string;
  continent: string;
  region: string;
  language: string;
  popMin: number;
  popMax: number;
  sort: string;
  order: 'asc' | 'desc';
}

export function parseListQuery(q: Record<string, string | string[] | undefined>): ListQuery {
  const str = (k: string) => {
    const v = q[k];
    return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
  };
  return {
    page: Math.max(1, Number(str('page')) || 1),
    pageSize: Math.min(100, Math.max(1, Number(str('pageSize')) || 50)),
    search: str('search').trim().toLowerCase(),
    continent: str('continent'),
    region: str('region'),
    language: str('language').trim().toLowerCase(),
    popMin: Number(str('popMin')) || 0,
    popMax: Number(str('popMax')) || Infinity,
    sort: str('sort') || 'population',
    order: str('order') === 'asc' ? 'asc' : 'desc',
  };
}

export function filterCountries(query: ListQuery): PaginatedResponse<GlobeIndexEntry> {
  let rows = [...loadGlobeIndex()];

  if (query.search) {
    rows = rows.filter(
      (c) =>
        c.name.toLowerCase().includes(query.search) ||
        c.capital.toLowerCase().includes(query.search) ||
        c.code.toLowerCase().includes(query.search),
    );
  }
  if (query.continent) rows = rows.filter((c) => c.continent === query.continent);
  if (query.region) rows = rows.filter((c) => c.region === query.region);
  if (query.popMin > 0) rows = rows.filter((c) => c.population >= query.popMin);
  if (Number.isFinite(query.popMax)) rows = rows.filter((c) => c.population <= query.popMax);

  if (query.language) {
    const full = loadEncyclopedia();
    const langSet = new Set(
      full
        .filter((c) => c.languages.some((l) => l.toLowerCase().includes(query.language)))
        .map((c) => c.code),
    );
    rows = rows.filter((c) => langSet.has(c.code));
  }

  const sortKey = query.sort as keyof GlobeIndexEntry;
  rows.sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === 'number' && typeof bv === 'number') {
      return query.order === 'asc' ? av - bv : bv - av;
    }
    return query.order === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  const data = rows.slice(start, start + query.pageSize);

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  };
}

export function getByCode(code: string): CountryRecord | undefined {
  return loadEncyclopedia().find((c) => c.code === code.toUpperCase());
}

export function getCompare(a: string, b: string) {
  const ca = getByCode(a);
  const cb = getByCode(b);
  if (!ca || !cb) return null;
  return { a: ca, b: cb };
}

export function getAggregateStats(): AggregateStats {
  const all = loadEncyclopedia();
  const continents: Record<string, number> = {};
  for (const c of all) continents[c.continent] = (continents[c.continent] ?? 0) + 1;

  const topByPopulation = [...all]
    .sort((x, y) => y.population - x.population)
    .slice(0, 10)
    .map((c) => ({ code: c.code, name: c.name, value: c.population }));

  const topByGdp = [...all]
    .sort((x, y) => y.gdpPerCapita - x.gdpPerCapita)
    .slice(0, 10)
    .map((c) => ({ code: c.code, name: c.name, value: c.gdpPerCapita }));

  return {
    countryCount: all.length,
    totalPopulation: all.reduce((s, c) => s + c.population, 0),
    avgLifeExpectancy: +(all.reduce((s, c) => s + c.lifeExpectancy, 0) / all.length).toFixed(1),
    avgGdpPerCapita: Math.round(all.reduce((s, c) => s + c.gdpPerCapita, 0) / all.length),
    avgInternetUsers: +(all.reduce((s, c) => s + c.internetUsers, 0) / all.length).toFixed(1),
    continents,
    topByPopulation,
    topByGdp,
  };
}

export { loadEncyclopedia, loadGlobeIndex };
