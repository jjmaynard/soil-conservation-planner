// Comprehensive Soil Interpretations Component
// Farmer-friendly display of SSURGO component interpretations

import React, { useState } from 'react'
import {
  ChevronDown,
  Wheat,
  Droplets,
  Mountain,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Leaf,
  Info,
} from 'lucide-react'
import {
  LAND_CAPABILITY_INTERPRETATIONS,
  HYDROLOGIC_GROUP_INTERPRETATIONS,
  DRAINAGE_CLASS_INTERPRETATIONS,
  getCapabilityColor,
  getHydrologyColor,
  getDrainageColor,
  type DrainageClassKey,
} from '#src/utils/soilInterpretations'

interface SoilInterpretationsProps {
  component: any
  componentIndex: number
}

export function SoilInterpretationsComponent({ component, componentIndex }: SoilInterpretationsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    landCapability: true,
    hydrology: false,
    productivity: false,
    conservation: false,
  })

  const colors = ['#10b981', '#60a5fa', '#fbbf24', '#a78bfa']
  const bgColor = component.majcompflag === 'Yes' ? colors[0] : colors[((componentIndex - 1) % 3) + 1]

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Extract land capability data
  const nirrcapcl = component.nirrcapcl || component.nirrcapclass
  const nirrcapscl = component.nirrcapscl || component.nirrcapsubclass
  const irrcapcl = component.irrcapcl || component.irrcapclass
  const irrcapscl = component.irrcapscl || component.irrcapsubclass

  const nonIrrigatedClass = (nirrcapcl?.toString().match(/\d/)?.[0] || null) as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | null
  const nonIrrigatedSubclass = nirrcapscl || nirrcapcl?.toString().replace(/\d/g, '') || null
  const irrigatedClass = (irrcapcl?.toString().match(/\d/)?.[0] || null) as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | null
  const irrigatedSubclass = irrcapscl || irrcapcl?.toString().replace(/\d/g, '') || null

  // Extract hydrology data
  const hydroGroup = (component.hydgrp || component.hydrologicgroup) as 'A' | 'B' | 'C' | 'D' | null
  const drainageClass = (component.drainagecl || component.drainageclass) as DrainageClassKey | null
  const hydricRating = component.hydricrating

  // Extract productivity data
  const cropIndex = component.cropprodindex
  const rangeProduction = component.rsprod_r

  // Extract erosion data
  const erosionClass = component.erocl
  const tFactor = component.tfact
  const windErosion = component.wei

  return (
    <div className="space-y-4">
      {/* Component Header */}
      <div
        className="rounded-lg border-2 p-4"
        style={{ borderColor: bgColor, backgroundColor: `${bgColor}10` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{component.compname}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600">{component.comppct_r}% of map unit</span>
              {component.majcompflag === 'Yes' && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: bgColor, color: 'white' }}
                >
                  Major Component
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Land Capability Classification */}
      {(nonIrrigatedClass || irrigatedClass) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('landCapability')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            style={{ borderLeft: `4px solid ${bgColor}` }}
          >
            <div className="flex items-center gap-3">
              <Wheat className="h-5 w-5" style={{ color: bgColor }} />
              <h4 className="font-semibold text-gray-900">Land Capability Classification</h4>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedSections.landCapability ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.landCapability && (
            <div className="px-4 py-4 bg-gray-50 space-y-4">
              {/* Non-Irrigated */}
              {nonIrrigatedClass && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: getCapabilityColor(nonIrrigatedClass) }}
                    >
                      {nonIrrigatedClass}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        Non-Irrigated Land Capability
                      </h5>
                      <p className="text-sm text-gray-600">
                        {LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass]?.name ||
                          `Class ${nonIrrigatedClass}`}
                      </p>
                    </div>
                  </div>

                  {LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass] && (
                    <>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Description:</strong>{' '}
                          {LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass].description}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Farming Advice:</strong>{' '}
                          {LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass].farmingAdvice}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Management:</strong>{' '}
                          {LAND_CAPABILITY_INTERPRETATIONS.classes[nonIrrigatedClass].management}
                        </p>
                      </div>

                      {/* Subclass limitations */}
                      {nonIrrigatedSubclass &&
                        nonIrrigatedSubclass.split('').map((subChar: string) => {
                          const subKey = subChar as 'e' | 'w' | 's' | 'c'
                          const subInfo = LAND_CAPABILITY_INTERPRETATIONS.subclasses[subKey]
                          if (!subInfo) return null

                          return (
                            <div
                              key={subChar}
                              className="bg-amber-50 border border-amber-200 rounded p-3 mb-3"
                            >
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h6 className="font-semibold text-amber-900 mb-1">
                                    {subInfo.name}
                                  </h6>
                                  <p className="text-sm text-amber-800 mb-2">{subInfo.description}</p>
                                  <p className="text-sm text-amber-800">
                                    <strong>Management:</strong> {subInfo.management}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                      {/* Recommendations */}
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <h6 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Recommended Practices
                        </h6>
                        <ul className="space-y-1">
                          {LAND_CAPABILITY_INTERPRETATIONS.classes[
                            nonIrrigatedClass
                          ].recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Irrigated */}
              {irrigatedClass && irrigatedClass !== nonIrrigatedClass && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: getCapabilityColor(irrigatedClass) }}
                    >
                      {irrigatedClass}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        Irrigated Land Capability
                      </h5>
                      <p className="text-sm text-gray-600">
                        {LAND_CAPABILITY_INTERPRETATIONS.classes[irrigatedClass]?.name ||
                          `Class ${irrigatedClass}`}
                      </p>
                    </div>
                  </div>

                  {LAND_CAPABILITY_INTERPRETATIONS.classes[irrigatedClass] && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong>{' '}
                        {LAND_CAPABILITY_INTERPRETATIONS.classes[irrigatedClass].description}
                      </p>
                      <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                        <Droplets className="h-4 w-4 inline mr-1" />
                        <strong>With Irrigation:</strong>{' '}
                        {LAND_CAPABILITY_INTERPRETATIONS.classes[irrigatedClass].farmingAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Water Management & Hydrology */}
      {(hydroGroup || drainageClass) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('hydrology')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            style={{ borderLeft: `4px solid ${bgColor}` }}
          >
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5" style={{ color: bgColor }} />
              <h4 className="font-semibold text-gray-900">Water Management</h4>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedSections.hydrology ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.hydrology && (
            <div className="px-4 py-4 bg-gray-50 space-y-4">
              {/* Hydrologic Group */}
              {hydroGroup && HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup] && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: getHydrologyColor(hydroGroup) }}
                    >
                      {hydroGroup}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup].name}
                      </h5>
                      <p className="text-sm text-gray-600">Hydrologic Group</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Description:</strong>{' '}
                      {HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup].description}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Implications:</strong>{' '}
                      {HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup].implications}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Management:</strong>{' '}
                      {HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup].management}
                    </p>
                  </div>

                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <h6 className="font-semibold text-blue-900 mb-2">Recommendations</h6>
                    <ul className="space-y-1">
                      {HYDROLOGIC_GROUP_INTERPRETATIONS[hydroGroup].recommendations.map(
                        (rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Drainage Class */}
              {drainageClass && DRAINAGE_CLASS_INTERPRETATIONS[drainageClass] && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getDrainageColor(drainageClass) }}
                    >
                      <Droplets className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {DRAINAGE_CLASS_INTERPRETATIONS[drainageClass].name}
                      </h5>
                      <p className="text-sm text-gray-600">Drainage Class</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Description:</strong>{' '}
                      {DRAINAGE_CLASS_INTERPRETATIONS[drainageClass].description}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Implications:</strong>{' '}
                      {DRAINAGE_CLASS_INTERPRETATIONS[drainageClass].implications}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Management:</strong>{' '}
                      {DRAINAGE_CLASS_INTERPRETATIONS[drainageClass].management}
                    </p>
                  </div>
                </div>
              )}

              {/* Hydric Soil Status */}
              {hydricRating && (
                <div
                  className={`rounded-lg border p-4 ${
                    hydricRating.toLowerCase().includes('yes')
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h6 className="font-semibold text-gray-900 mb-1">Hydric Soil Status</h6>
                      <p className="text-sm text-gray-700">
                        <strong>Rating:</strong> {hydricRating}
                      </p>
                      {hydricRating.toLowerCase().includes('yes') && (
                        <p className="text-sm text-blue-700 mt-2">
                          This soil meets the definition of a hydric soil and may be subject to wetland
                          regulations. Consult with local NRCS office before planning land use changes.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Agricultural Productivity */}
      {(cropIndex !== null || rangeProduction !== null) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('productivity')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            style={{ borderLeft: `4px solid ${bgColor}` }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5" style={{ color: bgColor }} />
              <h4 className="font-semibold text-gray-900">Agricultural Productivity</h4>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedSections.productivity ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.productivity && (
            <div className="px-4 py-4 bg-gray-50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {cropIndex !== null && cropIndex !== undefined && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Leaf className="h-6 w-6 text-green-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{cropIndex}</div>
                    <p className="text-sm font-semibold text-gray-700">Crop Productivity Index</p>
                    <p className="text-xs text-gray-600 mt-1">Scale: 0-100 (higher is better)</p>
                  </div>
                )}

                {rangeProduction !== null && rangeProduction !== undefined && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Mountain className="h-6 w-6 text-amber-600 mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {rangeProduction.toLocaleString()}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Range Production</p>
                    <p className="text-xs text-gray-600 mt-1">lbs/acre/year</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conservation & Erosion */}
      {(erosionClass || tFactor || windErosion) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('conservation')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            style={{ borderLeft: `4px solid ${bgColor}` }}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" style={{ color: bgColor }} />
              <h4 className="font-semibold text-gray-900">Conservation & Erosion</h4>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedSections.conservation ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.conservation && (
            <div className="px-4 py-4 bg-gray-50 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {erosionClass && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-600 mb-1">Erosion Class</p>
                    <p className="text-lg font-bold text-gray-900">{erosionClass}</p>
                  </div>
                )}

                {tFactor !== null && tFactor !== undefined && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-600 mb-1">T-Factor</p>
                    <p className="text-lg font-bold text-gray-900">{tFactor}</p>
                    <p className="text-xs text-gray-600">tons/acre/year</p>
                  </div>
                )}

                {windErosion !== null && windErosion !== undefined && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-600 mb-1">Wind Erosion</p>
                    <p className="text-lg font-bold text-gray-900">{windErosion}</p>
                    <p className="text-xs text-gray-600">Index</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <h6 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Conservation Priority
                </h6>
                <p className="text-sm text-amber-800">
                  {tFactor && tFactor > 3
                    ? 'This soil has a high tolerance for erosion but conservation practices are still recommended.'
                    : tFactor && tFactor <= 3
                    ? 'This soil has lower tolerance for erosion. Implement conservation practices to prevent soil loss.'
                    : 'Consult with local NRCS office for conservation planning assistance.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Data Source</p>
            <p>
              USDA-NRCS Soil Survey component interpretations. For detailed management recommendations
              specific to your operation, contact your local NRCS field office or Cooperative Extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoilInterpretationsComponent
