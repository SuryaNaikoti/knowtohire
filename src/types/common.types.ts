export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR';
