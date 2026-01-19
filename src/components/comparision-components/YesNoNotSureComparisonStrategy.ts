import type { Data } from 'plotly.js';
import type { ComparisonStrategy } from '../GraphViews';

// Re-export for type inference in strategy implementations
export type { ChartPalette } from '../GraphViews';

/**
 * Data structure for Yes/No/Not Sure chart comparisons
 */
export interface YesNoNotSureData {
  counts: {
    yes: number;
    no: number;
    notSure: number;
  };
  stats: {
    numberOfResponses: number;
    totalEligible?: number;
  };
}

/**
 * Reusable comparison strategy for Yes/No/Not Sure charts.
 * Creates a grouped bar chart comparing two years.
 */
export const yesNoNotSureComparisonStrategy: ComparisonStrategy<YesNoNotSureData> = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  const labels = ['Yes', 'No', 'Not sure'];

  const currentValues = [
    currentYearData.counts.yes,
    currentYearData.counts.no,
    currentYearData.counts.notSure,
  ];

  const compareValues = [
    compareYearData.counts.yes,
    compareYearData.counts.no,
    compareYearData.counts.notSure,
  ];

  const traces: Data[] = [
    {
      type: 'bar',
      name: currentYear,
      x: labels,
      y: currentValues,
      marker: { color: palette.berry },
      text: currentValues.map((v) => v.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'y+name',
    },
    {
      type: 'bar',
      name: compareYear,
      x: labels,
      y: compareValues,
      marker: { color: palette.spring },
      text: compareValues.map((v) => v.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'y+name',
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
