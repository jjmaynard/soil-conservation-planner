'use client';

import { useState, useEffect } from 'react';
import { MapPin, Map } from 'lucide-react';
import { Location } from '../../lib/crop-suitability/types';

interface LocationInputProps {
  location: Location | null;
  onChange: (location: Location) => void;
  onSelectFromMap?: () => void;
}

export default function LocationInput({ location, onChange, onSelectFromMap }: LocationInputProps) {
  const [lat, setLat] = useState(location?.latitude.toString() || '');
  const [lng, setLng] = useState(location?.longitude.toString() || '');

  // Update internal state when location prop changes (e.g., from map selection)
  useEffect(() => {
    if (location) {
      setLat(location.latitude.toFixed(6));
      setLng(location.longitude.toFixed(6));
    }
  }, [location]);

  const handleUpdate = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onChange({ latitude, longitude });
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude.toFixed(6));
          setLng(longitude.toFixed(6));
          onChange({ latitude, longitude });
        },
        (error) => {
          alert('Unable to get location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: '#374151' }}>
        Location
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="latitude" className="block text-xs mb-1" style={{ color: '#6b7280' }}>
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={handleUpdate}
            placeholder="41.2042"
            className="w-full px-3 py-2 border rounded-md"
            style={{ borderColor: '#d1d5db' }}
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-xs mb-1" style={{ color: '#6b7280' }}>
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            onBlur={handleUpdate}
            placeholder="-101.6353"
            className="w-full px-3 py-2 border rounded-md"
            style={{ borderColor: '#d1d5db' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-sm flex items-center gap-1 transition-colors"
          style={{ color: '#3b82f6' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
        >
          <MapPin className="h-4 w-4" />
          Use my current location
        </button>
        {onSelectFromMap && (
          <>
            <span style={{ color: '#d1d5db' }}>|</span>
            <button
              type="button"
              onClick={onSelectFromMap}
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: '#10b981' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#10b981'}
            >
              <Map className="h-4 w-4" />
              Select from Soil Map Explorer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
