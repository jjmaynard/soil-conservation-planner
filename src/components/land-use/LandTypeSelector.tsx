import React, { useState } from 'react';
import { getActiveLandTypes, type LandType } from '@/config/land-types';
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

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

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Sprout;
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
        {landTypes.map((landType) => {
          const Icon = getIcon(landType.icon);
          const isSelected = selected === landType.id;
          
          return (
            <button
              key={landType.id}
              className={`
                land-type-card 
                relative p-6 rounded-lg border-2 transition-all duration-200
                hover:shadow-lg hover:scale-[1.02]
                ${isSelected 
                  ? 'border-green-600 shadow-md' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${landType.gradient.from}15, ${landType.gradient.to}10)`
                  : 'white'
              }}
              onClick={() => handleSelect(landType.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${landType.display_name}`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              )}

              {/* Icon with gradient background */}
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${landType.gradient.from}, ${landType.gradient.to})`
                }}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900">
                {landType.display_name}
              </h3>

              {/* Description */}
              <p className="text-sm text-center text-gray-600">
                {landType.description}
              </p>
            </button>
          );
        })}
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
