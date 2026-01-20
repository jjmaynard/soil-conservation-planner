// Land Types Configuration
// Defines the six primary land use types supported by the application

export interface LandType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export const LAND_TYPES: LandType[] = [
  {
    id: 'cropland',
    name: 'Cropland',
    display_name: 'Cropland & Agriculture',
    description: 'Agricultural fields for crop production',
    icon: '🌾',
    color: 'green',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'forestry',
    name: 'Forestry',
    display_name: 'Forestry & Timber',
    description: 'Forest lands for timber production and management',
    icon: '🌲',
    color: 'emerald',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'rangeland',
    name: 'Rangeland',
    display_name: 'Rangeland & Pasture',
    description: 'Grazing lands and pasture for livestock',
    icon: '🐄',
    color: 'lime',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'wetland',
    name: 'Wetland',
    display_name: 'Wetlands',
    description: 'Wetland ecosystems and hydric soils',
    icon: '💧',
    color: 'blue',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'developed',
    name: 'Developed',
    display_name: 'Developed & Urban',
    description: 'Urban and developed lands',
    icon: '🏘️',
    color: 'slate',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'natural',
    name: 'Natural',
    display_name: 'Natural Areas & Conservation',
    description: 'Conservation and natural areas',
    icon: '🦋',
    color: 'teal',
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
