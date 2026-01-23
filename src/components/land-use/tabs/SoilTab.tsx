// SoilTab - Soil composition and properties from SSURGO API

import { TabContent, TabSection, MetricCard, DataTable, PropertyList, CardGrid } from './TabContent';
import { type TabContentProps } from './TabContent';

interface SoilComponent {
  cokey: string;
  compname: string;
  comppct_r: number;
  horizons: SoilHorizon[];
}

interface SoilHorizon {
  hzdept_r: number;
  hzdepb_r: number;
  texture: string;
  om_r: number;
  ph1to1h2o_r: number;
  ksat_r: number;
}

interface SoilData {
  components: SoilComponent[];
  map_unit: {
    mukey: string;
    muname: string;
  };
}

export function SoilTab({ data, session }: TabContentProps<SoilData>) {
  const primaryComponent = data.components?.[0];
  const topHorizon = primaryComponent?.horizons?.[0];

  return (
    <TabContent
      title="Soil Composition & Properties"
      subtitle={`Analysis for ${session.field_name || 'Selected Field'}`}
    >
      {/* Map Unit Summary */}
      <TabSection title="Map Unit Information">
        <div className="bg-white rounded-lg shadow p-6">
          <PropertyList
            properties={[
              { label: 'Map Unit Key', value: data.map_unit?.mukey || 'N/A' },
              { label: 'Map Unit Name', value: data.map_unit?.muname || 'N/A' },
              { label: 'Primary Component', value: primaryComponent?.compname || 'N/A' },
              { label: 'Component Percentage', value: primaryComponent?.comppct_r || 0, unit: '%' }
            ]}
          />
        </div>
      </TabSection>

      {/* Key Metrics */}
      <TabSection title="Surface Soil Properties" description="Properties from the topmost soil horizon">
        <CardGrid>
          <MetricCard
            label="Texture"
            value={topHorizon?.texture || 'N/A'}
            icon="Wheat"
            color="blue"
          />
          <MetricCard
            label="Organic Matter"
            value={topHorizon?.om_r || 0}
            unit="%"
            icon="Leaf"
            color="green"
          />
          <MetricCard
            label="pH (1:1 H₂O)"
            value={topHorizon?.ph1to1h2o_r || 0}
            icon="FlaskConical"
            color={topHorizon?.ph1to1h2o_r > 7 ? 'blue' : topHorizon?.ph1to1h2o_r < 6 ? 'yellow' : 'green'}
          />
          <MetricCard
            label="Saturated Hydraulic Conductivity"
            value={topHorizon?.ksat_r || 0}
            unit="μm/s"
            icon="Droplets"
            color="blue"
          />
        </CardGrid>
      </TabSection>

      {/* Soil Components */}
      <TabSection title="Soil Components" description="All soil components in this map unit">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            headers={['Component Name', 'Percentage', 'Primary Texture', 'OM (%)', 'pH']}
            rows={data.components?.map(comp => [
              comp.compname,
              `${comp.comppct_r}%`,
              comp.horizons?.[0]?.texture || 'N/A',
              comp.horizons?.[0]?.om_r?.toFixed(1) || 'N/A',
              comp.horizons?.[0]?.ph1to1h2o_r?.toFixed(1) || 'N/A'
            ]) || []}
          />
        </div>
      </TabSection>

      {/* Horizon Details */}
      {primaryComponent && (
        <TabSection 
          title="Horizon Profile" 
          description={`Detailed profile for ${primaryComponent.compname}`}
          collapsible
        >
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DataTable
              headers={['Depth (cm)', 'Texture', 'OM (%)', 'pH', 'Ksat (μm/s)']}
              rows={primaryComponent.horizons?.map(hz => [
                `${hz.hzdept_r} - ${hz.hzdepb_r}`,
                hz.texture || 'N/A',
                hz.om_r?.toFixed(1) || 'N/A',
                hz.ph1to1h2o_r?.toFixed(1) || 'N/A',
                hz.ksat_r?.toFixed(2) || 'N/A'
              ]) || []}
            />
          </div>
        </TabSection>
      )}

      {/* Data Source Attribution */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p>Data source: USDA NRCS Soil Survey Geographic Database (SSURGO)</p>
        <p className="mt-1">API: SDA Tabular Service</p>
      </div>
    </TabContent>
  );
}
