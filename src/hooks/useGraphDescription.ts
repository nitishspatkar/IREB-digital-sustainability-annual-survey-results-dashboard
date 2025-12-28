import graphDescriptions2025 from '../data/graphDescriptions2025.json';
import { useYear } from '../data/data-parsing-logic/YearContext';

const descriptionsByYear: Record<string, typeof graphDescriptions2025> = {
  '2025': graphDescriptions2025,
};

export type GraphId = keyof typeof graphDescriptions2025;

export const useGraphDescription = <T extends GraphId>(id: T) => {
  const year = useYear();
  const descriptions = descriptionsByYear[year] || descriptionsByYear['2025'];
  return descriptions[id];
};
