// React Hook for Ecological Site Data
// Custom hook for fetching and managing ecological site data

import { useState, useEffect, useRef } from 'react';
import type { FarmerFriendlyESD } from '#src/lib/esd-formatter';

// In-memory cache to prevent duplicate API calls
const esdCache = new Map<string, { data: FarmerFriendlyESD; timestamp: number }>();
const overviewCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track in-flight requests to prevent duplicate fetches
const inFlightRequests = new Map<string, Promise<any>>();

export function useEcologicalSite(ecoclassid: string | null | undefined, options?: { mode?: 'overview' | 'full' }) {
  const mode = options?.mode || 'full';
  const [data, setData] = useState<FarmerFriendlyESD | any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null); // Track what we've already fetched

  useEffect(() => {
    console.log(`[ESD Hook] Called with ecoclassid=${ecoclassid}, mode=${mode}`);
    
    if (!ecoclassid) {
      console.log(`[ESD Hook] No ecoclassid provided, resetting state`);
      setData(null);
      setLoading(false);
      setError(null);
      fetchedRef.current = null;
      return;
    }

    const cache = mode === 'overview' ? overviewCache : esdCache;
    const endpoint = mode === 'overview' ? `/api/ecological-site/${ecoclassid}/overview` : `/api/ecological-site/${ecoclassid}`;
    const cacheKey = `${ecoclassid}-${mode}`;

    // Check if we've already fetched this exact data in this component instance
    if (fetchedRef.current === cacheKey) {
      console.log(`[ESD] Already fetched ${mode} for ${ecoclassid}, using existing data`);
      return;
    }

    // Check cache first
    const cached = cache.get(ecoclassid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[ESD Cache] Using cached ${mode} data for ${ecoclassid}`);
      setData(cached.data);
      setLoading(false);
      setError(null);
      fetchedRef.current = cacheKey;
      return;
    }

    // Check if there's already a request in flight for this ecoclassid+mode
    const inFlightKey = cacheKey;
    const existingRequest = inFlightRequests.get(inFlightKey);
    if (existingRequest) {
      console.log(`[ESD] Waiting for in-flight ${mode} request for ${ecoclassid}`);
      setLoading(true);
      
      // Use async IIFE to properly await the existing request
      (async () => {
        try {
          const esdData = await existingRequest;
          console.log(`[ESD] Received shared ${mode} data for ${ecoclassid}`);
          setData(esdData);
          setLoading(false);
          setError(null);
          fetchedRef.current = cacheKey;
        } catch (err) {
          console.log(`[ESD] Shared ${mode} request failed for ${ecoclassid}:`, err instanceof Error ? err.message : 'Unknown error');
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
          setLoading(false);
        }
      })();
      
      return;
    }

    const fetchESD = async () => {
      setLoading(true);
      setError(null);
      
      // Create promise for this fetch and store it
      // Don't use AbortController for shared requests - let them complete for caching
      const fetchPromise = (async () => {
        try {
          console.log(`[ESD Fetch] Fetching ${mode} for ${ecoclassid}`);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch ecological site ${mode}`);
          }
          
          const esdData = await response.json();
          
          // Cache the result
          cache.set(ecoclassid, { data: esdData, timestamp: Date.now() });
          console.log(`[ESD Cache] Cached ${mode} data for ${ecoclassid}`);
          
          return esdData;
        } finally {
          // Remove from in-flight requests when done
          inFlightRequests.delete(inFlightKey);
        }
      })();
      
      // Store the promise
      inFlightRequests.set(inFlightKey, fetchPromise);
      
      try {
        const esdData = await fetchPromise;
        setData(esdData);
        setError(null);
        fetchedRef.current = cacheKey;
      } catch (err) {
        console.log(`[ESD Fetch] Error fetching ${mode} for ${ecoclassid}:`, err instanceof Error ? err.message : 'Unknown error');
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchESD();

    // No cleanup needed - let requests complete for caching even if component unmounts
  }, [ecoclassid, mode]); // Don't include 'data' in dependencies - it causes re-fetches

  return { data, loading, error };
}