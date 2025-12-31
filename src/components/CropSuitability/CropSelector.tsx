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
        <div className="h-4 rounded w-24 mb-2 bg-slate-200"></div>
        <div className="h-10 rounded bg-slate-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error p-3 border rounded-md">
        <div className="text-sm">Error loading crops: {error}</div>
      </div>
    );
  }

  const selectedCrop = crops.find(c => c.crop_id === selectedCropId);

  return (
    <div className="space-y-2">
      <label htmlFor="crop-select" className="block text-sm font-medium text-text">
        Select Crop
      </label>
      <select
        id="crop-select"
        value={selectedCropId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="form-input w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text focus:border-ocean-500"
      >
        <option value="">-- Select a crop --</option>
        {crops.map((crop) => (
          <option key={crop.crop_id} value={crop.crop_id}>
            {crop.crop_name}
          </option>
        ))}
      </select>
      {selectedCrop && (
        <p className="text-xs flex items-center gap-1 text-text-muted">
          <ArrowDown className="w-3 h-3" />
          {selectedCrop.depth_description}
        </p>
      )}
    </div>
  );
}
