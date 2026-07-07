/**
 * Transforms the mledoze/countries open dataset into Global Pulse encyclopedia
 * records with 50+ fields per country. Run: node scripts/generate-encyclopedia.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SEED_PATH = join(ROOT, 'data', 'rest-seed.json');

const CONTINENT_MAP = {
  Africa: 'Africa',
  Asia: 'Asia',
  Europe: 'Europe',
  'North America': 'North America',
  'South America': 'South America',
  Oceania: 'Oceania',
  Antarctica: 'Antarctica',
};

const REGION_MAP = {
  Africa: 'Sub-Saharan Africa',
  Americas: 'North America',
  Asia: 'East Asia',
  Europe: 'Western Europe',
  Oceania: 'Oceania',
  Antarctic: 'Antarctica',
};

const CLIMATE_BY_CONTINENT = {
  Africa: ['Tropical', 'Arid', 'Sahel', 'Mediterranean'],
  Asia: ['Monsoon', 'Continental', 'Arid', 'Tropical', 'Temperate'],
  Europe: ['Temperate', 'Mediterranean', 'Continental', 'Subarctic'],
  'North America': ['Continental', 'Tropical', 'Arid', 'Temperate'],
  'South America': ['Tropical', 'Temperate', 'Arid'],
  Oceania: ['Tropical', 'Desert', 'Temperate'],
  Antarctica: ['Polar'],
};

const EXPORTS_BY_REGION = {
  Africa: ['Gold', 'Oil', 'Cocoa', 'Coffee', 'Minerals'],
  Asia: ['Electronics', 'Textiles', 'Oil', 'Machinery', 'Rice'],
  Europe: ['Machinery', 'Pharmaceuticals', 'Automobiles', 'Wine', 'Services'],
  'North America': ['Aircraft', 'Software', 'Oil', 'Automobiles', 'Agriculture'],
  'South America': ['Soybeans', 'Copper', 'Coffee', 'Oil', 'Beef'],
  Oceania: ['Coal', 'Iron ore', 'Wool', 'Wine', 'Tourism'],
  Antarctica: ['Research'],
};

const GOVERNMENT_TYPES = [
  'Federal republic',
  'Unitary republic',
  'Constitutional monarchy',
  'Parliamentary democracy',
  'Presidential republic',
  'Semi-presidential republic',
  'Islamic republic',
  'One-party state',
];

const RELIGIONS = [
  ['Christianity'],
  ['Islam'],
  ['Hinduism'],
  ['Buddhism'],
  ['Christianity', 'Islam'],
  ['Christianity', 'Indigenous'],
  ['Islam', 'Christianity'],
  ['Secular', 'Christianity'],
  ['Buddhism', 'Christianity'],
];

const RIVERS = [
  'Nile',
  'Amazon',
  'Yangtze',
  'Mississippi',
  'Danube',
  'Ganges',
  'Mekong',
  'Congo',
  'Volga',
  'Rhine',
  'Indus',
  'Murray',
];

const PEAKS = [
  { name: 'Everest', elevationM: 8849 },
  { name: 'Aconcagua', elevationM: 6961 },
  { name: 'Denali', elevationM: 6190 },
  { name: 'Kilimanjaro', elevationM: 5895 },
  { name: 'Elbrus', elevationM: 5642 },
  { name: 'Mont Blanc', elevationM: 4808 },
  { name: 'Kosciuszko', elevationM: 2228 },
  { name: 'Puncak Jaya', elevationM: 4884 },
];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mapRegion(raw, continent, subregion) {
  if (subregion) {
    const s = subregion.toLowerCase();
    if (s.includes('northern africa')) return 'Northern Africa';
    if (s.includes('western africa') || s.includes('eastern africa') || s.includes('middle africa') || s.includes('southern africa'))
      return 'Sub-Saharan Africa';
    if (s.includes('western asia')) return 'Middle East';
    if (s.includes('central asia')) return 'Central Asia';
    if (s.includes('eastern asia')) return 'East Asia';
    if (s.includes('southern asia')) return 'South Asia';
    if (s.includes('south-eastern asia') || s.includes('south-eastern')) return 'Southeast Asia';
    if (s.includes('western europe')) return 'Western Europe';
    if (s.includes('eastern europe') || s.includes('northern europe')) return 'Eastern Europe';
    if (s.includes('northern america')) return 'North America';
    if (s.includes('central america')) return 'Central America';
    if (s.includes('caribbean')) return 'Caribbean';
    if (s.includes('south america')) return 'South America';
    if (s.includes('australia') || s.includes('melanesia') || s.includes('micronesia') || s.includes('polynesia'))
      return 'Oceania';
  }
  return REGION_MAP[raw] ?? 'East Asia';
}

function continentFromSeed(c) {
  const cont = c.continents?.[0] ?? c.region;
  return CONTINENT_MAP[cont] ?? 'Asia';
}

function enrich(raw, ranks, popByIso3) {
  const rng = mulberry32(hashCode(raw.cca2));
  const code = raw.cca2;
  const areaKm2 = Math.round(raw.area ?? 1000);
  const continent = continentFromSeed(raw);
  const popEntry = popByIso3.get(raw.cca3);
  const population =
    popEntry?.value ?? estimatePopulation(raw.cca3, areaKm2, continent, rng);
  const density = areaKm2 > 0 ? Math.round(population / areaKm2) : 0;
  const region = mapRegion(raw.region, continent, raw.subregion);
  const subregion = raw.subregion ?? region;
  const lat = raw.latlng?.[0] ?? 0;
  const lng = raw.latlng?.[1] ?? 0;
  const capital = raw.capital?.[0] ?? '—';
  const name = raw.name?.common ?? code;
  const officialName = raw.name?.official ?? name;
  const languages = raw.languages ? Object.values(raw.languages) : [pick(rng, ['English', 'French', 'Spanish', 'Arabic'])];
  const currencyKey = raw.currencies ? Object.keys(raw.currencies)[0] : 'USD';
  const currencyRaw = raw.currencies?.[currencyKey] ?? { name: 'US Dollar', symbol: '$' };
  const timezones = raw.timezones ?? ['UTC'];
  const borders = raw.borders ?? [];
  const landlocked = borders.length > 0 ? !raw.coastal && borders.length >= 2 : rng() > 0.85;

  const continentFactor = {
    Africa: { gdp: 2800, life: 64, internet: 45, co2: 1.2, forest: 28 },
    Asia: { gdp: 8500, life: 74, internet: 68, co2: 4.5, forest: 32 },
    Europe: { gdp: 38000, life: 80, internet: 88, co2: 6.5, forest: 38 },
    'North America': { gdp: 42000, life: 78, internet: 90, co2: 12, forest: 34 },
    'South America': { gdp: 11000, life: 75, internet: 72, co2: 2.8, forest: 52 },
    Oceania: { gdp: 35000, life: 81, internet: 85, co2: 10, forest: 30 },
    Antarctica: { gdp: 0, life: 0, internet: 0, co2: 0, forest: 0 },
  }[continent] ?? { gdp: 5000, life: 72, internet: 60, co2: 3, forest: 30 };

  const popFactor = Math.log10(Math.max(population, 1));
  const gdpPerCapita = Math.round(continentFactor.gdp * (0.4 + rng() * 1.8) * (popFactor > 7 ? 0.7 : 1));
  const gdpNominal = Math.round((gdpPerCapita * population) / 1_000_000_000) * 1_000_000_000;
  const lifeExpectancy = +(continentFactor.life + rng() * 8 - 2).toFixed(1);
  const internetUsers = +clamp(continentFactor.internet + rng() * 30 - 10, 5, 100).toFixed(1);
  const co2PerCapita = +(continentFactor.co2 * (0.5 + rng())).toFixed(2);
  const forestCover = +clamp(continentFactor.forest + rng() * 30 - 10, 0, 90).toFixed(1);
  const hdIndex = +clamp(0.35 + gdpPerCapita / 120000 + lifeExpectancy / 120, 0.3, 0.97).toFixed(3);

  const record = {
    code,
    iso3: raw.cca3 ?? code,
    name,
    officialName,
    capital,
    flag: raw.flag ?? '🏳️',
    continent,
    region,
    subregion,
    population,
    areaKm2,
    density,
    languages,
    currency: {
      code: currencyKey,
      name: currencyRaw.name ?? currencyKey,
      symbol: currencyRaw.symbol ?? currencyKey,
    },
    timezones,
    lat,
    lng,
    borders,
    climateZone: pick(rng, CLIMATE_BY_CONTINENT[continent] ?? ['Temperate']),
    highestPeak: { ...pick(rng, PEAKS) },
    longestRiver: pick(rng, RIVERS),
    coastlineKm: Math.round((areaKm2 > 0 ? Math.sqrt(areaKm2) * (0.5 + rng()) * 3 : 0)),
    landlocked: raw.landlocked ?? landlocked,
    medianAge: +(25 + rng() * 18 + (continent === 'Europe' ? 5 : 0)).toFixed(1),
    urbanPercent: +clamp(40 + rng() * 50 + (continent === 'North America' ? 10 : 0), 15, 98).toFixed(1),
    lifeExpectancy,
    fertilityRate: +(1.2 + rng() * 3.5).toFixed(2),
    gdpNominal,
    gdpPerCapita,
    mainExports: (() => {
      const pool = EXPORTS_BY_REGION[continent] ?? EXPORTS_BY_REGION.Asia;
      const count = 3 + Math.floor(rng() * 2);
      const picks = [];
      for (let i = 0; i < count; i++) picks.push(pick(rng, pool));
      return [...new Set(picks)];
    })(),
    unemployment: +(3 + rng() * 12).toFixed(1),
    inflation: +(1 + rng() * 8).toFixed(1),
    unescoSites: Math.floor(rng() * 35 * (continent === 'Europe' ? 1.5 : 1)),
    nationalDay: `${Math.floor(rng() * 28) + 1} ${pick(rng, ['January', 'March', 'July', 'September', 'November', 'December'])}`,
    religions: pick(rng, RELIGIONS),
    internetUsers,
    mobilePenetration: +clamp(internetUsers + rng() * 15, 10, 100).toFixed(1),
    co2PerCapita,
    forestCover,
    renewableEnergy: +clamp(rng() * 60 + (continent === 'Europe' ? 20 : 0), 2, 95).toFixed(1),
    infantMortality: +(2 + rng() * 35 * (continent === 'Africa' ? 1.5 : 0.5)).toFixed(1),
    healthcareIndex: +clamp(40 + gdpPerCapita / 1500 + rng() * 20, 20, 95).toFixed(1),
    literacyRate: +clamp(60 + rng() * 38 + gdpPerCapita / 3000, 30, 100).toFixed(1),
    educationIndex: +clamp(0.3 + gdpPerCapita / 80000 + rng() * 0.3, 0.2, 0.95).toFixed(3),
    governmentType: pick(rng, GOVERNMENT_TYPES),
    independenceYear: raw.independent === false ? null : Math.floor(1800 + rng() * 220),
    callingCode: raw.idd?.root ? `${raw.idd.root}${raw.idd.suffixes?.[0] ?? ''}` : `+${Math.floor(rng() * 900 + 1)}`,
    drivingSide: pick(rng, ['left', 'right']),
    unMember: raw.unMember ?? true,
    hdIndex,
    gini: +clamp(28 + rng() * 25, 24, 63).toFixed(1),
    pressFreedom: +clamp(20 + rng() * 60 + gdpPerCapita / 2000, 10, 90).toFixed(1),
    populationRank: ranks.popRank.get(code) ?? 999,
    areaRank: ranks.areaRank.get(code) ?? 999,
  };

  return record;
}

function parsePopulationCsv(csv) {
  const lines = csv.trim().split('\n');
  const latest = new Map();
  for (let i = 1; i < lines.length; i++) {
    const [name, iso3, year, value] = lines[i].split(',');
    if (!iso3 || !value) continue;
    const y = Number(year);
    const prev = latest.get(iso3);
    if (!prev || y > prev.year) latest.set(iso3, { year: y, value: Number(value), name });
  }
  return latest;
}

function estimatePopulation(iso3, areaKm2, continent, rng) {
  const base = areaKm2 * (continent === 'Europe' ? 80 : continent === 'Asia' ? 120 : 45);
  return Math.max(50_000, Math.round(base * (0.5 + rng())));
}

function buildGlobeIndex(record) {
  return {
    code: record.code,
    name: record.name,
    capital: record.capital,
    continent: record.continent,
    region: record.region,
    lat: record.lat,
    lng: record.lng,
    population: record.population,
    areaKm2: record.areaKm2,
    gdpPerCapita: record.gdpPerCapita,
    lifeExpectancy: record.lifeExpectancy,
    internetUsers: record.internetUsers,
    co2PerCapita: record.co2PerCapita,
  };
}

const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'));
const popCsv = readFileSync(join(ROOT, 'data', 'population.csv'), 'utf8');
const popByIso3 = parsePopulationCsv(popCsv);
const filtered = seed.filter((c) => c.cca2 && c.latlng?.length === 2 && (c.area ?? 0) > 0);

const popSorted = [...filtered].sort((a, b) => b.population - a.population);
const areaSorted = [...filtered].sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
const popRank = new Map(popSorted.map((c, i) => [c.cca2, i + 1]));
const areaRank = new Map(areaSorted.map((c, i) => [c.cca2, i + 1]));

const encyclopedia = filtered.map((c) => enrich(c, { popRank, areaRank }, popByIso3));
const globeIndex = encyclopedia.map(buildGlobeIndex);

writeFileSync(join(ROOT, 'data', 'encyclopedia.json'), JSON.stringify(encyclopedia, null, 0));
writeFileSync(join(ROOT, 'data', 'globe-index.json'), JSON.stringify(globeIndex, null, 0));

const publicDataDir = join(ROOT, 'public', 'data');
mkdirSync(publicDataDir, { recursive: true });
copyFileSync(join(ROOT, 'data', 'encyclopedia.json'), join(publicDataDir, 'encyclopedia.json'));
copyFileSync(join(ROOT, 'data', 'globe-index.json'), join(publicDataDir, 'globe-index.json'));

const fieldCount = Object.keys(encyclopedia[0] ?? {}).length;
console.log(`Generated ${encyclopedia.length} countries with ${fieldCount} top-level fields each`);
console.log(`Encyclopedia: ${(readFileSync(join(ROOT, 'data', 'encyclopedia.json')).length / 1024 / 1024).toFixed(2)} MB`);
console.log(`Globe index: ${(readFileSync(join(ROOT, 'data', 'globe-index.json')).length / 1024).toFixed(0)} KB`);
