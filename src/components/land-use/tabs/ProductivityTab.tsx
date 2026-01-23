// ProductivityTab - Land productivity analysis from SSURGO interpretations

import { TabContent, TabSection, MetricCard, CardGrid, ProgressBar, DataTable, AlertBox } from './TabContent';
import { type TabContentProps } from './TabContent';

interface ProductivityData {
  // For cropland
  nccpi?: {
    rating: number; // 0-100
    class: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    components: Array<{
      name: string;
      percentage: number;
      nccpi: number;
    }>;
  };
  // For forestry
  siteIndex?: {
    species: string;
    value: number;
    class: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    curves: any[];
  };
  // For rangeland
  rangeProductivity?: {
    ecologicalSite: string;
    annualProduction: number; // lbs/acre
    rangelandHealth: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  };
}

export function ProductivityTab({ data, session }: TabContentProps<ProductivityData>) {
  const landType = session.land_type_id;

  // Render cropland productivity (NCCPI)
  if (landType === 'cropland' && data.nccpi) {
    return (
      <TabContent
        title="Cropland Productivity"
        subtitle="National Commodity Crop Productivity Index (NCCPI)"
      >
        {/* Overall Rating */}
        <TabSection title="Productivity Assessment">
          <CardGrid>
            <MetricCard
              label="NCCPI Rating"
              value={data.nccpi.rating}
              unit="/ 100"
              icon="Wheat"
              color={data.nccpi.rating > 66 ? 'green' : data.nccpi.rating > 33 ? 'yellow' : 'red'}
            />
            <MetricCard
              label="Productivity Class"
              value={data.nccpi.class}
              icon="BarChart3"
              color={data.nccpi.rating > 66 ? 'green' : data.nccpi.rating > 33 ? 'yellow' : 'red'}
            />
          </CardGrid>
        </TabSection>

        {/* Progress Bar */}
        <TabSection title="Rating Visualization">
          <div className="bg-white rounded-lg shadow p-6">
            <ProgressBar
              value={data.nccpi.rating}
              max={100}
              label="NCCPI Score"
              color={data.nccpi.rating > 66 ? 'green' : data.nccpi.rating > 33 ? 'yellow' : 'red'}
            />
            <div className="mt-4 flex justify-between text-xs text-gray-600">
              <span>Very Low (0-20)</span>
              <span>Low (20-40)</span>
              <span>Moderate (40-60)</span>
              <span>High (60-80)</span>
              <span>Very High (80-100)</span>
            </div>
          </div>
        </TabSection>

        {/* Component Breakdown */}
        <TabSection title="Component Productivity" collapsible>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DataTable
              headers={['Component', 'Map Unit %', 'NCCPI', 'Class']}
              rows={data.nccpi.components.map(comp => [
                comp.name,
                `${comp.percentage}%`,
                comp.nccpi.toFixed(0),
                comp.nccpi > 66 ? 'High' : comp.nccpi > 33 ? 'Moderate' : 'Low'
              ])}
            />
          </div>
        </TabSection>

        {/* Interpretation */}
        <TabSection title="Management Implications">
          {data.nccpi.rating > 66 ? (
            <AlertBox
              type="success"
              title="High Productivity Soils"
              message="These soils have excellent potential for commodity crop production. Implement nutrient management and erosion control to maintain productivity."
            />
          ) : data.nccpi.rating > 33 ? (
            <AlertBox
              type="warning"
              title="Moderate Productivity Soils"
              message="These soils have moderate crop production potential. Consider soil amendments, drainage improvements, or alternative crops better suited to site conditions."
            />
          ) : (
            <AlertBox
              type="error"
              title="Low Productivity Soils"
              message="These soils have significant limitations for crop production. Consider alternative land uses such as pasture, forestry, or conservation."
            />
          )}
        </TabSection>

        {/* Data Source */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>Data source: USDA NRCS SSURGO Database</p>
          <p className="mt-1">Interpretation: NCCPI (National Commodity Crop Productivity Index)</p>
        </div>
      </TabContent>
    );
  }

  // Render forestry productivity (Site Index)
  if (landType === 'forestry' && data.siteIndex) {
    return (
      <TabContent
        title="Forest Productivity"
        subtitle="Site Index for Timber Production"
      >
        <TabSection title="Site Index Assessment">
          <CardGrid>
            <MetricCard
              label="Primary Species"
              value={data.siteIndex.species}
              icon="Trees"
              color="green"
            />
            <MetricCard
              label="Site Index"
              value={data.siteIndex.value}
              unit="feet @ 50 years"
              icon="Ruler"
              color="blue"
            />
            <MetricCard
              label="Site Class"
              value={data.siteIndex.class}
              icon="Star"
              color={data.siteIndex.class === 'Excellent' ? 'green' : data.siteIndex.class === 'Good' ? 'blue' : 'yellow'}
            />
          </CardGrid>
        </TabSection>

        <AlertBox
          type="info"
          message="Site index indicates expected tree height at 50 years. Higher values indicate better timber production potential."
        />

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>Data source: USDA Forest Service FIA Database</p>
          <p className="mt-1">Site index curves matched to soil properties from SSURGO</p>
        </div>
      </TabContent>
    );
  }

  // Render rangeland productivity
  if (landType === 'rangeland' && data.rangeProductivity) {
    return (
      <TabContent
        title="Rangeland Productivity"
        subtitle="Ecological Site Assessment"
      >
        <TabSection title="Production Potential">
          <CardGrid>
            <MetricCard
              label="Ecological Site"
              value={data.rangeProductivity.ecologicalSite}
              icon="Sprout"
              color="green"
            />
            <MetricCard
              label="Annual Production"
              value={data.rangeProductivity.annualProduction}
              unit="lbs/acre"
              icon="LeafyGreen"
              color="blue"
            />
            <MetricCard
              label="Rangeland Health"
              value={data.rangeProductivity.rangelandHealth}
              icon="Heart"
              color={data.rangeProductivity.rangelandHealth === 'Excellent' ? 'green' : 'yellow'}
            />
          </CardGrid>
        </TabSection>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>Data source: USDA NRCS Ecological Site Descriptions</p>
          <p className="mt-1">Database: EDIT (Ecological Dynamics Interpretive Tool)</p>
        </div>
      </TabContent>
    );
  }

  // Fallback for unsupported land types
  return (
    <TabContent title="Productivity Analysis">
      <AlertBox
        type="info"
        message={`Productivity analysis not yet implemented for ${landType} land type.`}
      />
    </TabContent>
  );
}
