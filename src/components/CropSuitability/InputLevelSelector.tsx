'use client';

import { InputLevel, InputLevelOption } from '../../lib/crop-suitability/types';

const INPUT_LEVELS: InputLevelOption[] = [
  {
    value: 'L',
    label: 'Low Input',
    description: 'Minimal fertilizer, pest control, and management'
  },
  {
    value: 'I',
    label: 'Intermediate Input',
    description: 'Moderate fertilizer and management practices'
  },
  {
    value: 'H',
    label: 'High Input',
    description: 'Intensive management with optimal fertilizer and pest control'
  }
];

interface InputLevelSelectorProps {
  selectedLevel: InputLevel | null;
  onChange: (level: InputLevel) => void;
}

export default function InputLevelSelector({ selectedLevel, onChange }: InputLevelSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: '#374151' }}>
        Management/Input Level
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {INPUT_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className="p-4 border-2 rounded-lg transition-all text-left"
            style={{
              borderColor: selectedLevel === level.value ? '#3b82f6' : '#e5e7eb',
              backgroundColor: selectedLevel === level.value ? '#eff6ff' : 'white'
            }}
          >
            <div className="font-semibold" style={{ color: '#111827' }}>{level.label}</div>
            <div className="mt-1 text-xs" style={{ color: '#6b7280' }}>{level.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
