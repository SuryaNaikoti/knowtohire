export const LOCATION_TYPES = [
  'Onsite',
  'Remote',
  'Hybrid'
] as const;

export type LocationType = typeof LOCATION_TYPES[number];
