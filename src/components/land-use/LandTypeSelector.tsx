import React, { useState } from 'react';
import { getActiveLandTypes, type LandType } from '@/config/land-types';

interface LandTypeSelectorProps {
  onSelect: (landType: string) => void;
  selectedLandType?: string | null;
}

export function LandTypeSelector({ onSelect, selectedLandType }: LandTypeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(selectedLandType || null);
  const landTypes = getActiveLandTypes();

  const handleSelect = (landTypeId: string) => {
    setSelected(landTypeId);
    onSelect(landTypeId);
  };

  return (
    <div className="land-type-selector">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What type of land are you analyzing?
        </h2>
        <p className="text-lg text-gray-600">
          Select the land use that best describes your field or area of interest
        </p>
      </div>

      <div className="land-type-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {landTypes.map((landType) => (
          <button
            key={landType.id}
            className={`
              land-type-card 
              relative p-6 rounded-lg border-2 transition-all duration-200
              hover:shadow-lg hover:scale-105
              ${selected === landType.id 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
            onClick={() => handleSelect(landType.id)}
            aria-pressed={selected === landType.id}
            aria-label={`Select ${landType.display_name}`}
          >
            {/* Selection indicator */}
            {selected === landType.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="land-type-icon text-5xl mb-4 text-center">
              {landType.icon}
            </div>

            {/* Title */}
            <h3 className={`text-xl font-semibold mb-2 text-center ${
              selected === landType.id ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {landType.display_name}
            </h3>

            {/* Description */}
            <p className={`text-sm text-center ${
              selected === landType.id ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {landType.description}
            </p>

            {/* Color accent bar */}
            <div 
              className={`h-1 w-full mt-4 rounded-full bg-${landType.color}-500`}
              style={{ backgroundColor: `var(--${landType.color}-500, #3b82f6)` }}
            />
          </button>
        ))}
      </div>

      {selected && (
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Selected: <span className="font-semibold text-gray-900">
              {landTypes.find(lt => lt.id === selected)?.display_name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
