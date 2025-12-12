// Ecological Site Description (ESD) Detail Modal
// Comprehensive display of USDA EDIT ecological site data

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ChevronDown,
  ChevronRight,
  MapPin,
  Mountain,
  Thermometer,
  Droplets,
  Layers,
  Calendar,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Leaf,
  Info,
} from 'lucide-react'

interface ESDDetailModalProps {
  esdData: any
  onClose: () => void
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  accent?: string
}

function CollapsibleSection({ title, icon, defaultOpen = false, children, accent = '#15803d' }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <details open={defaultOpen} className="group mb-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <summary
        className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        style={{ borderLeft: `4px solid ${accent}` }}
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-700">{icon}</span>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-400 transition-transform" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400 transition-transform" />
        )}
      </summary>
      {isOpen && <div className="px-4 py-3 bg-gray-50">{children}</div>}
    </details>
  )
}

function PropertyDisplay({ label, value, description }: { label: string; value: string | number; description?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      {description && <p className="text-xs text-gray-600 italic">{description}</p>}
    </div>
  )
}

export function ESDDetailModal({ esdData, onClose }: ESDDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  if (typeof document === 'undefined') return null

  const images = esdData?.physiographicFeatures?.images || []
  const hasImages = images.length > 0

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col"
        style={{ maxWidth: '1200px', maxHeight: '90vh', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0"
          style={{ backgroundColor: '#15803d' }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {esdData.ecoclassName || 'Ecological Site Description'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-green-100">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {esdData.ecoclassId}
              </span>
              {esdData.geoUnitName && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {esdData.geoUnitName}
                </span>
              )}
              {esdData.geoUnitSymbol && (
                <span className="px-2 py-0.5 bg-green-700 rounded text-white font-medium">
                  MLRA {esdData.geoUnitSymbol}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:bg-green-700 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Publication Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-900">Publication Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {esdData.publicationDate && (
                    <div>
                      <span className="text-gray-600">Published:</span>{' '}
                      <span className="font-medium text-gray-900">{esdData.publicationDate}</span>
                    </div>
                  )}
                  {esdData.developmentStage && (
                    <div>
                      <span className="text-gray-600">Stage:</span>{' '}
                      <span
                        className="font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            esdData.developmentStage === 'Approved'
                              ? '#dcfce7'
                              : esdData.developmentStage === 'Provisional'
                              ? '#fef3c7'
                              : '#f3f4f6',
                          color:
                            esdData.developmentStage === 'Approved'
                              ? '#166534'
                              : esdData.developmentStage === 'Provisional'
                              ? '#92400e'
                              : '#374151',
                        }}
                      >
                        {esdData.developmentStage}
                      </span>
                    </div>
                  )}
                  {esdData.ecoclassLegacyId && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Legacy ID:</span>{' '}
                      <span className="font-medium text-gray-900 font-mono text-xs">
                        {esdData.ecoclassLegacyId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Criteria */}
          {esdData.keyCriteria && esdData.keyCriteria.length > 0 && (
            <CollapsibleSection title="Key Identification Criteria" icon={<AlertTriangle className="h-5 w-5" />} defaultOpen accent="#dc2626">
              <div className="space-y-2">
                {esdData.keyCriteria.map((criterion: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-700 flex-1">{criterion}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Physiographic Features */}
          {esdData.physiographicFeatures && (
            <CollapsibleSection title="Physiographic Features" icon={<Mountain className="h-5 w-5" />} defaultOpen accent="#2563eb">
              <div className="space-y-4">
                {/* Narrative */}
                {esdData.narratives?.physiographicFeatures && (
                  <div className="p-4 bg-white rounded border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {esdData.narratives.physiographicFeatures}
                    </p>
                  </div>
                )}

                {/* Images */}
                {hasImages && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Site Images ({images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((img: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedImageIndex(idx)
                            setShowImageModal(true)
                          }}
                          className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
                        >
                          <img
                            src={`https://edit.jornada.nmsu.edu${img.path}`.replace('Image preview', '')}
                            alt={img.caption || 'Ecological site image'}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                              <p className="text-xs text-white font-medium line-clamp-2">{img.caption}</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Landforms */}
                {esdData.physiographicFeatures?.landforms && esdData.physiographicFeatures.landforms.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Landforms</h4>
                    {esdData.physiographicFeatures.landforms.map((landform: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-blue-700">{landform.landform}</span>
                          {landform.landscape && (
                            <span className="text-xs text-gray-600">({landform.landscape})</span>
                          )}
                        </div>
                        {landform.landformDesc && (
                          <p className="text-xs text-gray-600 leading-relaxed">{landform.landformDesc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Interval Properties (Elevation, Slope, etc.) */}
                {esdData.physiographicFeatures?.intervalProperties &&
                  esdData.physiographicFeatures.intervalProperties.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {esdData.physiographicFeatures.intervalProperties.map((prop: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">{prop.property}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900">{prop.representativeLow}</span>
                            <span className="text-gray-500">to</span>
                            <span className="text-lg font-bold text-gray-900">{prop.representativeHigh}</span>
                            <span className="text-xs text-gray-500">{prop.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Ordinal Properties (Flooding, Ponding) */}
                {esdData.physiographicFeatures?.ordinalProperties &&
                  esdData.physiographicFeatures.ordinalProperties.length > 0 && (
                    <div className="space-y-2">
                      {esdData.physiographicFeatures.ordinalProperties.map((prop: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                          <PropertyDisplay
                            label={prop.property}
                            value={
                              prop.representativeLow === prop.representativeHigh
                                ? prop.representativeLow
                                : `${prop.representativeLow} to ${prop.representativeHigh}`
                            }
                            description={prop.representativeLowDesc || prop.representativeHighDesc}
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </CollapsibleSection>
          )}

          {/* Climatic Features */}
          {esdData.climaticFeatures?.narratives?.climaticFeatures && (
            <CollapsibleSection title="Climatic Features" icon={<Thermometer className="h-5 w-5" />} accent="#f59e0b">
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {esdData.climaticFeatures.narratives.climaticFeatures}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Water Features */}
          {esdData.waterFeatures?.narratives?.waterFeatures && (
            <CollapsibleSection title="Water Features" icon={<Droplets className="h-5 w-5" />} accent="#0ea5e9">
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {esdData.waterFeatures.narratives.waterFeatures}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Soil Features */}
          {esdData.narratives?.soilFeatures && (
            <CollapsibleSection title="Soil Features" icon={<Layers className="h-5 w-5" />} accent="#92400e">
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {esdData.narratives.soilFeatures}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Ecological Dynamics */}
          {esdData.narratives?.ecologicalDynamics && (
            <CollapsibleSection title="Ecological Dynamics" icon={<TrendingUp className="h-5 w-5" />} accent="#059669">
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {esdData.narratives.ecologicalDynamics}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Plant Communities */}
          {esdData.narratives?.plantCommunities && (
            <CollapsibleSection title="Plant Communities" icon={<Leaf className="h-5 w-5" />} accent="#16a34a">
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {esdData.narratives.plantCommunities}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600">
                <p className="mb-1">
                  <strong>Data Source:</strong> USDA Natural Resources Conservation Service - Ecological Dynamics
                  Interpretive Tool (EDIT)
                </p>
                <p>
                  For more detailed information, visit the{' '}
                  <a
                    href={`https://edit.jornada.nmsu.edu/catalogs/esd/${esdData.ecoclassId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    online ecological site description
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && hasImages && (
        <div
          className="fixed inset-0 flex items-center justify-center p-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 10001 }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl flex flex-col"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 z-10 transition-colors shadow-lg border border-gray-200"
              aria-label="Close image"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative flex items-center justify-center overflow-hidden rounded-t-xl p-4">
              {images.length > 1 && (
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 text-white hover:text-gray-300 rounded-full p-3 z-10 transition-colors"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  aria-label="Previous image"
                >
                  <ChevronDown className="w-8 h-8 transform -rotate-90" />
                </button>
              )}

              <img
                src={`https://edit.jornada.nmsu.edu${images[selectedImageIndex].path}`.replace('Image preview', '')}
                alt={images[selectedImageIndex].caption}
                className="max-w-full max-h-[calc(90vh-140px)] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23333" width="800" height="600"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E'
                }}
              />

              {images.length > 1 && (
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 text-white hover:text-gray-300 rounded-full p-3 z-10 transition-colors"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  aria-label="Next image"
                >
                  <ChevronDown className="w-8 h-8 transform rotate-90" />
                </button>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <p className="text-sm font-medium text-gray-800 text-center">
                {images[selectedImageIndex].caption || 'Ecological site image'}
              </p>
              {images.length > 1 && (
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Image {selectedImageIndex + 1} of {images.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

export default ESDDetailModal
