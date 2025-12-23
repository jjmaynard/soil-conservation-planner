'use client';

import { useCropList } from '../../hooks/useCropList';
import { ArrowDown } from 'lucide-react';

interface CropSelectorProps {
  selectedCropId: string | null;
  onChange: (cropId: string) => void;
}

export default function CropSelector({ selectedCropId, onChange }: CropSelectorProps) {
  const { crops, loading, error } = useCropList();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 rounded w-24 mb-2" style={{ backgroundColor: '#e5e7eb' }}></div>
        <div className="h-10 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border rounded-md" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
        <div className="text-sm" style={{ color: '#991b1b' }}>Error loading crops: {error}</div>
      </div>
    );
  }

  const selectedCrop = crops.find(c => c.crop_id === selectedCropId);

  return (
    <div className="space-y-2">
      <label htmlFor="crop-select" className="block text-sm font-medium" style={{ color: '#374151' }}>
        Select Crop
      </label>
      <select
        id="crop-select"
        value={selectedCropId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md shadow-sm"
        style={{ borderColor: '#d1d5db' }}
      >
        <option value="">-- Select a crop --</option>
        {crops.map((crop) => (
          <option key={crop.crop_id} value={crop.crop_id}>
            {crop.crop_name}
          </option>
        ))}
      </select>
      {selectedCrop && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}>
          <ArrowDown className="w-3 h-3" />
          {selectedCrop.depth_description}
        </p>
      )}
    </div>
  );
}
