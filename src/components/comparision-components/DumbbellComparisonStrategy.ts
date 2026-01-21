import type { Data, Layout } from 'plotly.js';
import type { ComparisonStrategy } from '../GraphViews';
import type { HorizontalBarData } from './HorizontalBarComparisonStrategy';

export interface DumbbellStrategyOptions {
  normalizeToPercentage?: boolean;
  formatAsPercentage?: boolean;
  sortBy?: 'value' | 'difference' | 'absoluteDifference';
}

export const createDumbbellComparisonStrategy = (
  options: DumbbellStrategyOptions = {}
): ComparisonStrategy<HorizontalBarData> => {
  const { normalizeToPercentage = true, sortBy = 'absoluteDifference' } = options;
  // Default formatAsPercentage to normalizeToPercentage if not explicitly set
  const formatAsPercentage = options.formatAsPercentage ?? normalizeToPercentage;

  return (currentYearData, compareYearData, currentYear, compareYear, palette) => {
    // 1. Prepare Data
    const allLabels = Array.from(
      new Set([
        ...currentYearData.items.map((i) => i.label),
        ...compareYearData.items.map((i) => i.label),
      ])
    );

    // Create lookup maps
    const currentMap = new Map(currentYearData.items.map((i) => [i.label, i.value]));
    const compareMap = new Map(compareYearData.items.map((i) => [i.label, i.value]));

    // Get totals for percentage calculation (if enabled)
    const currentTotal = currentYearData.stats.numberOfResponses || 1;
    const compareTotal = compareYearData.stats.numberOfResponses || 1;

    // Build data objects
    const itemsWithBothYears = allLabels.map((label) => {
      const currentValRaw = currentMap.get(label) ?? 0;
      const compareValRaw = compareMap.get(label) ?? 0;

      let currentValue = currentValRaw;
      let compareValue = compareValRaw;

      if (normalizeToPercentage) {
        currentValue = (currentValRaw / currentTotal) * 100;
        compareValue = (compareValRaw / compareTotal) * 100;
      }

      return {
        label,
        currentValue,
        compareValue,
      };
    });

    // Sort items
    if (sortBy === 'difference') {
      // Sort by signed difference (current - compare)
      itemsWithBothYears.sort((a, b) => {
        const diffA = a.currentValue - a.compareValue;
        const diffB = b.currentValue - b.compareValue;
        return diffA - diffB;
      });
    } else if (sortBy === 'absoluteDifference') {
      // Sort by absolute difference magnitude (longest dumbbell at top)
      itemsWithBothYears.sort((a, b) => {
        const diffA = Math.abs(a.currentValue - a.compareValue);
        const diffB = Math.abs(b.currentValue - b.compareValue);
        return diffA - diffB;
      });
    } else {
      // Default: Sort by current year value (ascending for horizontal display)
      itemsWithBothYears.sort((a, b) => a.currentValue - b.currentValue);
    }

    // 2. Build Traces

    // Trace 1: Connector Lines
    const lineX: (number | null)[] = [];
    const lineY: (string | null)[] = [];

    itemsWithBothYears.forEach((item) => {
      lineX.push(item.compareValue, item.currentValue, null);
      lineY.push(item.label, item.label, null);
    });

    const connectorTrace: Data = {
      type: 'scatter',
      mode: 'lines',
      x: lineX,
      y: lineY as string[],
      line: {
        color: palette.grey02,
        width: 2,
      },
      showlegend: false,
      hoverinfo: 'skip',
    };

    // Trace 2: Compare Year Markers
    const compareTrace: Data = {
      type: 'scatter',
      mode: 'markers',
      name: compareYear,
      x: itemsWithBothYears.map((i) => i.compareValue),
      y: itemsWithBothYears.map((i) => i.label),
      marker: {
        color: palette.spring,
        size: 10,
        symbol: 'circle',
      },
      hovertemplate: formatAsPercentage
        ? `<b>${compareYear}</b>: %{x:.1f}%<extra></extra>`
        : `<b>${compareYear}</b>: %{x}<extra></extra>`,
    };

    // Trace 3: Current Year Markers
    const currentTrace: Data = {
      type: 'scatter',
      mode: 'markers',
      name: currentYear,
      x: itemsWithBothYears.map((i) => i.currentValue),
      y: itemsWithBothYears.map((i) => i.label),
      marker: {
        color: palette.berry,
        size: 10,
        symbol: 'circle',
      },
      hovertemplate: formatAsPercentage
        ? `<b>${currentYear}</b>: %{x:.1f}%<extra></extra>`
        : `<b>${currentYear}</b>: %{x}<extra></extra>`,
    };

    const traces: Data[] = [connectorTrace, compareTrace, currentTrace];

    // 3. Layout Overrides
    const layout: Partial<Layout> = {
      xaxis: {
        showgrid: true,
        zeroline: false,
        gridcolor: palette.grey02,
        title: { text: formatAsPercentage ? '% of Respondents' : 'Value' },
        ticksuffix: formatAsPercentage ? '%' : '',
      },
      yaxis: {
        type: 'category',
        showgrid: false,
        automargin: true,
        ticks: 'outside',
        tickcolor: 'rgba(0,0,0,0)',
      },
      barmode: undefined,
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1,
      },
    };

    const combinedResponses =
      currentYearData.stats.numberOfResponses + compareYearData.stats.numberOfResponses;
    const combinedEligible =
      (currentYearData.stats.totalEligible ?? 0) + (compareYearData.stats.totalEligible ?? 0);

    return {
      traces,
      layout,
      stats: {
        numberOfResponses: combinedResponses,
        totalEligible: combinedEligible > 0 ? combinedEligible : undefined,
      },
    };
  };
};

/**
 * Default instance (normalizes to percentage by default)
 */
export const dumbbellComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: true,
});
