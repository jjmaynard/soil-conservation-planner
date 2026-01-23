// Land Types Configuration
// Defines the six primary land use types supported by the application

export interface LandType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
  gradient: { from: string; to: string };
  sort_order: number;
  is_active: boolean;
}

export const LAND_TYPES: LandType[] = [
  {
    id: 'cropland',
    name: 'Cropland',
    display_name: 'Cropland & Agriculture',
    description: 'Agricultural fields for crop production',
    icon: 'Wheat',
    color: '#6B7F39',
    gradient: { from: '#6B7F39', to: '#5C6F32' },
    sort_order: 1,
    is_active: true
  },
  {
    id: 'forestry',
    name: 'Forestry',
    display_name: 'Forestry & Timber',
    description: 'Forest lands for timber production and management',
    icon: 'Trees',
    color: '#5C8D5A',
    gradient: { from: '#5C8D5A', to: '#4F7A4D' },
    sort_order: 2,
    is_active: true
  },
  {
    id: 'rangeland',
    name: 'Rangeland',
    display_name: 'Rangeland & Pasture',
    description: 'Grazing lands and pasture for livestock',
    icon: 'Mountain',
    color: '#8B7AA8',
    gradient: { from: '#8B7AA8', to: '#7A6B92' },
    sort_order: 3,
    is_active: true
  },
  {
    id: 'wetland',
    name: 'Wetland',
    display_name: 'Wetlands',
    description: 'Wetland ecosystems and hydric soils',
    icon: 'Droplets',
    color: '#4A90E2',
    gradient: { from: '#4A90E2', to: '#3A7BC8' },
    sort_order: 4,
    is_active: true
  },
  {
    id: 'developed',
    name: 'Developed',
    display_name: 'Developed & Urban',
    description: 'Urban and developed lands',
    icon: 'Building2',
    color: '#64748B',
    gradient: { from: '#64748B', to: '#475569' },
    sort_order: 5,
    is_active: true
  },
  {
    id: 'natural',
    name: 'Natural',
    display_name: 'Natural Areas & Conservation',
    description: 'Conservation and natural areas',
    icon: 'Sprout',
    color: '#87A096',
    gradient: { from: '#87A096', to: '#748B81' },
    sort_order: 6,
    is_active: true
  }
];

// Helper functions
export function getLandType(id: string): LandType | undefined {
  return LAND_TYPES.find(lt => lt.id === id);
}

export function getActiveLandTypes(): LandType[] {
  return LAND_TYPES.filter(lt => lt.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getLandTypesByIds(ids: string[]): LandType[] {
  return LAND_TYPES.filter(lt => ids.includes(lt.id));
}
