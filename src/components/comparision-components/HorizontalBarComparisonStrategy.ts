import type { Data } from 'plotly.js';
import type { ComparisonStrategy } from '../GraphViews';

// Re-export for type inference in strategy implementations
export type { ChartPalette } from '../GraphViews';

/**
 * Data structure for horizontal bar chart comparisons
 */
export interface HorizontalBarData {
  items: Array<{ label: string; value: number }>;
  stats: {
    numberOfResponses: number;
    totalEligible?: number;
  };
}

/**
 * Reusable comparison strategy for horizontal bar charts.
 * Creates a grouped horizontal bar chart comparing two years.
 */
export const horizontalBarComparisonStrategy: ComparisonStrategy<HorizontalBarData> = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  // Merge and sort items by current year value (ascending for horizontal charts)
  const allLabels = Array.from(
    new Set([
      ...currentYearData.items.map((i) => i.label),
      ...compareYearData.items.map((i) => i.label),
    ])
  );

  // Create lookup maps
  const currentMap = new Map(currentYearData.items.map((i) => [i.label, i.value]));
  const compareMap = new Map(compareYearData.items.map((i) => [i.label, i.value]));

  // Build data arrays
  const itemsWithBothYears = allLabels.map((label) => ({
    label,
    currentValue: currentMap.get(label) ?? 0,
    compareValue: compareMap.get(label) ?? 0,
  }));

  // Sort by current year value (ascending for horizontal display)
  itemsWithBothYears.sort((a, b) => a.currentValue - b.currentValue);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      name: currentYear,
      x: itemsWithBothYears.map((i) => i.currentValue),
      y: itemsWithBothYears.map((i) => i.label),
      marker: { color: palette.berry },
      text: itemsWithBothYears.map((i) => i.currentValue.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'x+name',
    },
    {
      type: 'bar',
      orientation: 'h',
      name: compareYear,
      x: itemsWithBothYears.map((i) => i.compareValue),
      y: itemsWithBothYears.map((i) => i.label),
      marker: { color: palette.spring },
      text: itemsWithBothYears.map((i) => i.compareValue.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'x+name',
    },
  ];

  // Combine stats - show both years' response counts
  const combinedResponses =
    currentYearData.stats.numberOfResponses + compareYearData.stats.numberOfResponses;
  const combinedEligible =
    (currentYearData.stats.totalEligible ?? 0) + (compareYearData.stats.totalEligible ?? 0);

  return {
    traces,
    stats: {
      numberOfResponses: combinedResponses,
      totalEligible: combinedEligible > 0 ? combinedEligible : undefined,
    },
  };
};
