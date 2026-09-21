export interface ModelPricingRaw {
  input?: number;
  output?: number;
  cache_read?: number;
  cache_write?: number;
}

export interface ApiResponse {
  exact: Record<string, ModelPricingRaw>;
  default?: ModelPricingRaw;
  _meta?: {
    units?: string;
  };
}

export interface ProviderInfo {
  key: string;
  label: string;
  icon: string;
  count?: number;
}

export interface ModelItem {
  id: string;
  model: string;
  shortName: string;
  provider: ProviderInfo;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export type SortColumn = 'model' | 'inputOutput' | 'cache';
export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}
