/** Shared types used by the Vercel API layer and the React frontend. */

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'Antarctica';

export type Region =
  | 'Northern Africa'
  | 'Sub-Saharan Africa'
  | 'Middle East'
  | 'Central Asia'
  | 'East Asia'
  | 'South Asia'
  | 'Southeast Asia'
  | 'Western Europe'
  | 'Eastern Europe'
  | 'North America'
  | 'Central America'
  | 'Caribbean'
  | 'South America'
  | 'Oceania'
  | 'Antarctica';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export interface PeakInfo {
  name: string;
  elevationM: number;
}

/** Full encyclopedia record — 50+ fields per country. */
export interface CountryRecord {
  code: string;
  iso3: string;
  name: string;
  officialName: string;
  capital: string;
  flag: string;
  continent: Continent;
  region: Region;
  subregion: string;
  population: number;
  areaKm2: number;
  density: number;
  languages: string[];
  currency: CurrencyInfo;
  timezones: string[];
  lat: number;
  lng: number;
  borders: string[];
  climateZone: string;
  highestPeak: PeakInfo;
  longestRiver: string;
  coastlineKm: number;
  landlocked: boolean;
  medianAge: number;
  urbanPercent: number;
  lifeExpectancy: number;
  fertilityRate: number;
  gdpNominal: number;
  gdpPerCapita: number;
  mainExports: string[];
  unemployment: number;
  inflation: number;
  unescoSites: number;
  nationalDay: string;
  religions: string[];
  internetUsers: number;
  mobilePenetration: number;
  co2PerCapita: number;
  forestCover: number;
  renewableEnergy: number;
  infantMortality: number;
  healthcareIndex: number;
  literacyRate: number;
  educationIndex: number;
  governmentType: string;
  independenceYear: number | null;
  callingCode: string;
  drivingSide: 'left' | 'right';
  unMember: boolean;
  hdIndex: number;
  gini: number;
  pressFreedom: number;
  populationRank: number;
  areaRank: number;
}

export type MetricScale = 'linear' | 'log' | 'sqrt';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  shortLabel: string;
  description: string;
  unit: string;
  scale: MetricScale;
  gradient: readonly [string, string];
  format: (value: number) => string;
}

/** Lightweight index entry for globe rendering and filters. */
export interface GlobeIndexEntry {
  code: string;
  name: string;
  capital: string;
  continent: Continent;
  region: Region;
  lat: number;
  lng: number;
  population: number;
  areaKm2: number;
  gdpPerCapita: number;
  lifeExpectancy: number;
  internetUsers: number;
  co2PerCapita: number;
}

/** Metric keys that can be visualized on the globe choropleth-style. */
export type MetricKey =
  | 'population'
  | 'areaKm2'
  | 'density'
  | 'gdpPerCapita'
  | 'lifeExpectancy'
  | 'internetUsers'
  | 'co2PerCapita'
  | 'hdIndex'
  | 'unescoSites'
  | 'forestCover';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AggregateStats {
  countryCount: number;
  totalPopulation: number;
  avgLifeExpectancy: number;
  avgGdpPerCapita: number;
  avgInternetUsers: number;
  continents: Record<string, number>;
  topByPopulation: { code: string; name: string; value: number }[];
  topByGdp: { code: string; name: string; value: number }[];
}
