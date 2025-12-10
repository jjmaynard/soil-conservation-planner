/**
 * Utility for loading OSD text descriptions from the generated JSON database
 */

interface OSDDescriptionEntry {
  series: string;
  description: string;
  lastUpdated: string;
}

type OSDDescriptionsDatabase = Record<string, OSDDescriptionEntry>;

let descriptionsCache: OSDDescriptionsDatabase | null = null;
let loadingPromise: Promise<OSDDescriptionsDatabase> | null = null;

/**
 * Load all OSD descriptions from the JSON file
 * Uses caching to avoid repeated fetches
 */
export async function loadAllDescriptions(): Promise<OSDDescriptionsDatabase> {
  // Return cached data if available
  if (descriptionsCache) {
    return descriptionsCache;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = fetch('/data/osd-descriptions.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load OSD descriptions: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      descriptionsCache = data;
      loadingPromise = null;
      return data;
    })
    .catch((error) => {
      loadingPromise = null;
      console.error('Error loading OSD descriptions:', error);
      throw error;
    });

  return loadingPromise;
}

/**
 * Get description for a specific soil series
 * @param seriesName - The name of the soil series (case-insensitive)
 * @returns The description entry, or null if not found
 */
export async function getDescription(seriesName: string): Promise<OSDDescriptionEntry | null> {
  try {
    const descriptions = await loadAllDescriptions();
    const key = seriesName.toUpperCase();
    return descriptions[key] || null;
  } catch (error) {
    console.error(`Error getting description for ${seriesName}:`, error);
    return null;
  }
}

/**
 * Get just the description text for a soil series
 * @param seriesName - The name of the soil series (case-insensitive)
 * @returns The description text, or null if not found
 */
export async function getDescriptionText(seriesName: string): Promise<string | null> {
  const entry = await getDescription(seriesName);
  return entry?.description || null;
}

/**
 * Check if descriptions are currently loaded
 */
export function isLoaded(): boolean {
  return descriptionsCache !== null;
}

/**
 * Clear the cache (useful for testing or if data is updated)
 */
export function clearCache(): void {
  descriptionsCache = null;
  loadingPromise = null;
}
