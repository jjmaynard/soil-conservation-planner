import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { InputLevel, Location } from '../../lib/crop-suitability/types';
import { useSuitabilityCalculation } from '../../hooks/useSuitabilityCalculation';
import CropSelector from '../../components/CropSuitability/CropSelector';
import InputLevelSelector from '../../components/CropSuitability/InputLevelSelector';
import LocationInput from '../../components/CropSuitability/LocationInput';
import SQIGauges from '../../components/CropSuitability/SQIGauges';
import InterpretationPanel from '../../components/CropSuitability/InterpretationPanel';
import RecommendationsCard from '../../components/CropSuitability/RecommendationsCard';
import { Sprout, AlertCircle, CheckCircle, Loader2, Info, X } from 'lucide-react';

// Helper function to get full input level name
const getInputLevelName = (level: InputLevel): string => {
  const names: Record<InputLevel, string> = {
    'L': 'Low Input Management',
    'I': 'Intermediate Input Management',
    'H': 'High Input Management'
  };
  return names[level];
};

export default function CropSuitabilityPage() {
  const router = useRouter();
  const [cropId, setCropId] = useState<string | null>(null);
  const [inputLevel, setInputLevel] = useState<InputLevel | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  // Restore saved selections from localStorage on mount
  useEffect(() => {
    const savedCropId = localStorage.getItem('cropSuitability_cropId');
    const savedInputLevel = localStorage.getItem('cropSuitability_inputLevel');
    
    if (savedCropId) {
      setCropId(savedCropId);
      localStorage.removeItem('cropSuitability_cropId');
    }
    if (savedInputLevel) {
      setInputLevel(savedInputLevel as InputLevel);
      localStorage.removeItem('cropSuitability_inputLevel');
    }
  }, []);

  // Handle location from map selection
  useEffect(() => {
    if (router.query.lat && router.query.lng) {
      const latitude = parseFloat(router.query.lat as string);
      const longitude = parseFloat(router.query.lng as string);
      console.log('[CropSuitability] Received coordinates from URL:', { latitude, longitude });
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setLocation({ latitude, longitude });
        console.log('[CropSuitability] Location set:', { latitude, longitude });
        // Clean up URL params
        router.replace('/suitability/crop-suitability', undefined, { shallow: true });
      }
    }
  }, [router.query, router]);
  
  const { result, loading, error, calculate, reset } = useSuitabilityCalculation();

  const handleCalculate = async () => {
    if (!cropId || !inputLevel || !location) {
      alert('Please fill in all required fields');
      return;
    }

    await calculate({
      location,
      crop_id: cropId,
      input_level: inputLevel
    });
  };

  const canCalculate = cropId && inputLevel && location;

  return (
    <>
      <Head>
        <title>Crop Suitability Assessment - Soil Conservation Explorer</title>
        <meta name="description" content="Evaluate soil quality and suitability for crop production using GAEZ methodology" />
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #f0fdf4, #dcfce7)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div 
            className="text-white shadow-lg rounded-lg my-6 mb-8"
            style={{ background: 'linear-gradient(to right, #16a34a, #15803d, #166534)' }}
          >
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-2">
                <Sprout className="h-8 w-8" />
                <div className="flex items-center gap-2 flex-1">
                  <h1 className="text-3xl font-bold">Crop Suitability Assessment</h1>
                  <button
                    onClick={() => setShowMethodology(true)}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Learn about the methodology"
                  >
                    <Info className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#dcfce7' }}>
                Evaluate soil quality and suitability for crop production with detailed soil quality indices
              </p>
            </div>
          </div>

          {/* Input Form */}
          <div className="rounded-lg shadow-md p-6 mb-8 space-y-6" style={{ backgroundColor: 'white', border: '1px solid #dcfce7' }}>
            <CropSelector selectedCropId={cropId} onChange={setCropId} />
            <InputLevelSelector selectedLevel={inputLevel} onChange={setInputLevel} />
            <LocationInput 
              location={location} 
              onChange={setLocation}
              onSelectFromMap={() => {
                // Save current selections before navigating
                if (cropId) localStorage.setItem('cropSuitability_cropId', cropId);
                if (inputLevel) localStorage.setItem('cropSuitability_inputLevel', inputLevel);
                localStorage.setItem('returnToPath', '/suitability/crop-suitability');
                router.push('/soil-map?selectMode=true');
              }}
            />

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate || loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: canCalculate && !loading ? 'linear-gradient(to right, #16a34a, #15803d)' : '#d1d5db',
                  color: canCalculate && !loading ? 'white' : '#9ca3af',
                  cursor: canCalculate && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: canCalculate && !loading ? '0 4px 6px -1px rgba(22, 163, 74, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (canCalculate && !loading) e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #166534)';
                }}
                onMouseLeave={(e) => {
                  if (canCalculate && !loading) e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Calculate Soil Suitability'
                )}
              </button>
              {result && (
                <button
                  onClick={reset}
                  className="px-6 py-3 border rounded-lg font-semibold transition-all duration-200"
                  style={{ 
                    borderColor: '#dcfce7', 
                    color: '#16a34a',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.borderColor = '#bbf7d0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#dcfce7';
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="border rounded-lg p-4 mb-8 flex items-start gap-3" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#dc2626' }} />
              <div>
                <div className="font-semibold" style={{ color: '#991b1b' }}>Error</div>
                <div className="text-sm mt-1" style={{ color: '#b91c1c' }}>{error}</div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-8">
              {/* Metadata */}
              <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'white', border: '1px solid #dcfce7' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6" style={{ color: '#16a34a' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
                    {result.crop_info.crop_name} - {getInputLevelName(result.crop_info.input_level)}
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div style={{ color: '#6b7280' }}>Location</div>
                    <div className="font-medium" style={{ color: '#111827' }}>
                      {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280' }}>Soil Component</div>
                    <div className="font-medium" style={{ color: '#111827' }}>{result.data_sources.ssurgo_component}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280' }}>Map Unit</div>
                    <div className="font-medium" style={{ color: '#111827' }}>{result.data_sources.ssurgo_map_unit}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280' }}>Processing Time</div>
                    <div className="font-medium" style={{ color: '#111827' }}>
                      {result.metadata.processing_time_seconds.toFixed(2)}s
                    </div>
                  </div>
                </div>
              </div>

              {/* SQI Gauges */}
              <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'white', border: '1px solid #dcfce7' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>Soil Quality Indices</h2>
                <SQIGauges indices={result.soil_quality_indices} inputLevel={result.crop_info.input_level} />
              </div>

              {/* Interpretations */}
              {result.interpretations && (
                <>
                  <InterpretationPanel 
                    interpretations={result.interpretations} 
                    inputLevel={result.crop_info.input_level}
                  />
                  <RecommendationsCard recommendations={result.interpretations.recommendations} />
                </>
              )}

              {/* Crop-specific Notes */}
              {result.interpretations?.crop_specific_notes && result.interpretations.crop_specific_notes.length > 0 && (
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'white' }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>
                    Crop-Specific Considerations
                  </h3>
                  <ul className="space-y-2">
                    {result.interpretations.crop_specific_notes.map((note, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#374151' }}>
                        <span style={{ color: '#3b82f6' }}>•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
)}
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowMethodology(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 p-6 border-b flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>Assessment Methodology</h2>
              <button
                onClick={() => setShowMethodology(false)}
                className="p-2 rounded-lg transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="h-6 w-6" style={{ color: '#6b7280' }} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>GAEZ Soil Quality Assessment</h3>
                <p className="mb-3" style={{ color: '#374151' }}>
                  This assessment uses the Global Agro-Ecological Zones (GAEZ) methodology developed by FAO and IIASA 
                  to evaluate soil suitability for crop production. The system analyzes soil properties from USDA-NRCS 
                  SSURGO database and calculates seven key soil quality indices.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>Soil Quality Indices (SQI)</h3>
                <div className="space-y-3">
                  <div className="border-l-4 pl-4" style={{ borderColor: '#10b981' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ1: Nutrient Availability</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Evaluates available nutrients based on organic matter, pH, base saturation, and soil fertility levels.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#3b82f6' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ2: Nutrient Retention Capacity</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Assesses the soil&apos;s ability to retain and supply nutrients through cation exchange capacity and clay mineralogy.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#8b5cf6' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ3: Rooting Conditions</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Evaluates physical constraints to root development including bulk density, soil structure, and restrictive layers.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#06b6d4' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ4: Oxygen Availability to Roots</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Assesses drainage conditions, water table depth, and soil aeration that affect oxygen availability.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#f59e0b' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ5: Excess Salts</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Measures salinity and sodicity levels that can limit crop growth and reduce yields.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#ec4899' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ6: Toxicities</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Evaluates presence of toxic elements and need for amendments like lime or gypsum.
                    </p>
                  </div>
                  <div className="border-l-4 pl-4" style={{ borderColor: '#6366f1' }}>
                    <div className="font-semibold" style={{ color: '#111827' }}>SQ7: Workability</div>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      Assesses soil characteristics affecting ease of tillage, including texture, consistence, and stoniness.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>Overall Suitability Rating (SR)</h3>
                <p className="mb-3" style={{ color: '#374151' }}>
                  The overall suitability rating is calculated by combining all seven soil quality indices with crop-specific 
                  rooting depth weights. The rating ranges from 0-100, where higher values indicate better suitability.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>Input Levels</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold" style={{ color: '#111827' }}>Low Input:</span>
                    <span className="text-sm ml-2" style={{ color: '#6b7280' }}>Minimal fertilizer and management, relying primarily on natural soil fertility</span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: '#111827' }}>Intermediate Input:</span>
                    <span className="text-sm ml-2" style={{ color: '#6b7280' }}>Moderate fertilizer application and standard management practices</span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: '#111827' }}>High Input:</span>
                    <span className="text-sm ml-2" style={{ color: '#6b7280' }}>Intensive management with optimal fertilizer, pest control, and irrigation</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  <strong>Note:</strong> This assessment is a planning tool based on soil properties and should be supplemented 
                  with site-specific observations, climate data, and local agronomic expertise for management decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
