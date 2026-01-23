// ErosionTab - Erosion risk assessment from GEE RUSLE-EOS API

import { TabContent, TabSection, MetricCard, AlertBox, PropertyList, CardGrid, ProgressBar } from './TabContent';
import { type TabContentProps } from './TabContent';

interface ErosionData {
  annualSoilLoss: number; // tons/acre/year
  tolerableSoilLoss: number; // T-value
  factors: {
    r: number; // Rainfall-runoff erosivity
    k: number; // Soil erodibility
    ls: number; // Slope length-steepness
    c: number; // Cover-management
    p: number; // Support practice
  };
  riskClass: 'minimal' | 'low' | 'moderate' | 'high' | 'excessive';
  geometry: any;
}

export function ErosionTab({ data, session }: TabContentProps<ErosionData>) {
  const exceedsTValue = data.annualSoilLoss > data.tolerableSoilLoss;
  const percentOfTValue = (data.annualSoilLoss / data.tolerableSoilLoss) * 100;

  const riskClassConfig = {
    minimal: { color: 'green', label: 'Minimal Risk', icon: 'CheckCircle2' },
    low: { color: 'blue', label: 'Low Risk', icon: 'Info' },
    moderate: { color: 'yellow', label: 'Moderate Risk', icon: 'AlertTriangle' },
    high: { color: 'red', label: 'High Risk', icon: 'AlertCircle' },
    excessive: { color: 'red', label: 'Excessive Risk', icon: 'AlertOctagon' }
  };

  const config = riskClassConfig[data.riskClass];

  return (
    <TabContent
      title="Erosion Risk Assessment"
      subtitle={`RUSLE-EOS analysis for ${session.field_name || 'Selected Field'}`}
    >
      {/* Alert if exceeds T-value */}
      {exceedsTValue && (
        <AlertBox
          type="error"
          title="Erosion Exceeds Tolerable Level"
          message={`Annual soil loss (${data.annualSoilLoss.toFixed(1)} tons/acre/year) exceeds the tolerable limit of ${data.tolerableSoilLoss.toFixed(1)} tons/acre/year. Conservation practices are strongly recommended.`}
        />
      )}

      {/* Key Metrics */}
      <TabSection title="Erosion Assessment">
        <CardGrid>
          <MetricCard
            label="Annual Soil Loss"
            value={data.annualSoilLoss}
            unit="tons/acre/year"
            icon="TrendingDown"
            color={exceedsTValue ? 'red' : 'green'}
          />
          <MetricCard
            label="Tolerable Soil Loss (T-value)"
            value={data.tolerableSoilLoss}
            unit="tons/acre/year"
            icon="CheckCircle2"
            color="blue"
          />
          <MetricCard
            label="Risk Classification"
            value={config.label}
            icon={config.icon}
            color={config.color as any}
          />
          <MetricCard
            label="Percentage of T-value"
            value={percentOfTValue.toFixed(0)}
            unit="%"
            icon={exceedsTValue ? 'TrendingUp' : 'BarChart3'}
            color={exceedsTValue ? 'red' : 'green'}
          />
        </CardGrid>
      </TabSection>

      {/* T-value Progress Bar */}
      <TabSection title="T-value Comparison">
        <div className="bg-white rounded-lg shadow p-6">
          <ProgressBar
            value={data.annualSoilLoss}
            max={data.tolerableSoilLoss * 2} // Show up to 2x T-value
            label="Soil Loss vs. Tolerable Limit"
            color={exceedsTValue ? 'red' : 'green'}
          />
          <p className="text-sm text-gray-600 mt-2">
            {exceedsTValue 
              ? `Soil loss is ${(percentOfTValue - 100).toFixed(0)}% above the tolerable limit`
              : `Soil loss is ${(100 - percentOfTValue).toFixed(0)}% below the tolerable limit`
            }
          </p>
        </div>
      </TabSection>

      {/* RUSLE Factors */}
      <TabSection 
        title="RUSLE2 Factors" 
        description="Individual factor contributions to erosion estimate"
        collapsible
      >
        <div className="bg-white rounded-lg shadow p-6">
          <PropertyList
            properties={[
              { 
                label: 'R - Rainfall-Runoff Erosivity Factor', 
                value: data.factors.r.toFixed(1),
                unit: 'hundred ft-tonf-in/(acre-hr-year)'
              },
              { 
                label: 'K - Soil Erodibility Factor', 
                value: data.factors.k.toFixed(3),
                unit: 'ton-acre-hr/(hundred acre-ft-tonf-in)'
              },
              { 
                label: 'LS - Slope Length-Steepness Factor', 
                value: data.factors.ls.toFixed(2),
                unit: 'dimensionless'
              },
              { 
                label: 'C - Cover-Management Factor', 
                value: data.factors.c.toFixed(3),
                unit: 'dimensionless (0-1)'
              },
              { 
                label: 'P - Support Practice Factor', 
                value: data.factors.p.toFixed(3),
                unit: 'dimensionless (0-1)'
              }
            ]}
          />
        </div>
      </TabSection>

      {/* Recommendations */}
      <TabSection title="Conservation Recommendations">
        <div className="space-y-3">
          {exceedsTValue && (
            <>
              <AlertBox
                type="warning"
                message="Priority: Implement conservation practices to reduce soil loss below T-value"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Recommended Practices:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Implement no-till or reduced tillage management</li>
                  <li>• Install terraces or grassed waterways for slope control</li>
                  <li>• Establish cover crops during fallow periods</li>
                  <li>• Apply residue and mulch management (Code 484)</li>
                  <li>• Consider contour farming or strip cropping</li>
                </ul>
              </div>
            </>
          )}
          {!exceedsTValue && (
            <AlertBox
              type="success"
              message="Erosion is well controlled. Continue current conservation practices."
            />
          )}
        </div>
      </TabSection>

      {/* Data Source Attribution */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p>Data source: Google Earth Engine RUSLE-EOS Model</p>
        <p className="mt-1">Model: Revised Universal Soil Loss Equation 2 (RUSLE2)</p>
        <p className="mt-1">Climate data: PRISM, Soil data: SSURGO, Topography: USGS NED</p>
      </div>
    </TabContent>
  );
}
