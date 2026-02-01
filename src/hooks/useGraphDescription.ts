import { useYear } from '../data/data-parsing-logic/YearContext';

// Use Vite's import.meta.glob to dynamically load all graph description files from the data directory.
// This allows new years (e.g., 2026.json) to be automatically recognized without code changes.
const descriptionModules = import.meta.glob<
  Record<string, { question: string; description: string }>
>('../data/graphDescriptions*.json', {
  eager: true,
  import: 'default',
});

// Map year strings to their respective description objects.
const descriptionsByYear: Record<
  string,
  Record<string, { question: string; description: string }>
> = {};

Object.entries(descriptionModules).forEach(([path, module]) => {
  // Extract year from filename pattern: graphDescriptionsYYYY.json
  const yearMatch = path.match(/graphDescriptions(\d{4})\.json/);
  if (yearMatch) {
    descriptionsByYear[yearMatch[1]] = module;
  }
});

// Determine available years and a default fallback (latest year).
const availableYears = Object.keys(descriptionsByYear).sort((a, b) => Number(b) - Number(a));
const defaultYear = availableYears[0] || '';

export type GraphId = string;

export const useGraphDescription = (id: string) => {
  const year = useYear();

  // Try to get description for the active year,
  // falling back to '2025' specifically if it exists,
  // and then to the latest available year as a last resort.
  const descriptions =
    descriptionsByYear[year] || descriptionsByYear['2025'] || descriptionsByYear[defaultYear] || {};

  const description = descriptions[id];

  if (!description) {
    // Return a placeholder if the ID isn't found in any dataset.
    return {
      question: id,
      description: '',
    };
  }

  return description;
};
