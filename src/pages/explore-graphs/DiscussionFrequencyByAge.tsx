import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const FREQUENCY_TEMPLATE = ['daily', 'weekly', 'monthly', 'every few months', 'never', 'other'];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const formatLabel = (freq: string) => {
  if (freq === 'every few months') return 'Every few<br>months';
  return freq.charAt(0).toUpperCase() + freq.slice(1);
};

// --- The Processor Logic ---
const processDiscussionFrequency: ChartProcessor = (responses, palette) => {
  const ageStats = new Map<string, Map<string, number>>();
  const ageTotals = new Map<string, number>();
  const freqTotals = new Map<string, number>();

  // 1. Parse Data
  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    let frequency = normalize(r.raw.discussionFrequency ?? '').toLowerCase();

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a' || !frequency || frequency === 'n/a') return;

    if (frequency.includes('every few months')) frequency = 'every few months';
    else if (frequency === 'monthly') frequency = 'monthly';

    if (!FREQUENCY_TEMPLATE.includes(frequency) && frequency !== 'other') {
      frequency = 'other';
    }

    if (!ageStats.has(ageGroup)) {
      ageStats.set(ageGroup, new Map());
      ageTotals.set(ageGroup, 0);
    }
    const freqs = ageStats.get(ageGroup)!;
    freqs.set(frequency, (freqs.get(frequency) ?? 0) + 1);

    ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + 1);
    freqTotals.set(frequency, (freqTotals.get(frequency) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedAgeGroups = Array.from(ageTotals.entries())
    .map(([ageGroup]) => ageGroup)
    .sort((a, b) => {
      const aMatch = a.match(/^(\d+)/);
      const bMatch = b.match(/^(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }

      return a.localeCompare(b);
    });

  const activeFreqs = FREQUENCY_TEMPLATE.filter((f) => (freqTotals.get(f) ?? 0) > 0);
  const displayLabels = activeFreqs.map(formatLabel);

  // 3. Build Matrices
  const zValues = sortedAgeGroups.map((ageGroup) =>
    activeFreqs.map((freq) => ageStats.get(ageGroup)?.get(freq) ?? 0)
  );

  const maxZ = Math.max(...zValues.flat());
  const validResponses = Array.from(ageTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Calculate Text Colors (Dynamic contrast)
  const textColors = zValues.map((row) =>
    row.map((val) => (val / maxZ > 0.4 ? '#FFFFFF' : palette.grey))
  );

  // 5. Create Trace
  const trace: Data = {
    type: 'heatmap',
    x: displayLabels,
    y: sortedAgeGroups,
    z: zValues,
    colorscale: [
      [0, '#F2F2F2'], // Light color from original
      [1, palette.berry],
    ],
    xgap: 2,
    ygap: 2,
    showscale: false,
    text: zValues.map((row) => row.map((v) => (v > 0 ? v.toString() : ''))) as unknown as string[],
    texttemplate: '%{text}',
    textfont: {
      family: 'PP Mori, sans-serif',
      size: 12,
      color: textColors as unknown as string,
    },
    hoverinfo: 'x+y+z',
  };

  return {
    stats: { numberOfResponses: validResponses },
    traces: [trace],
  };
};

// --- Comparison Strategy Setup ---
const discussionFrequencyByAgeExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const ageStats = new Map<string, Map<string, number>>();
  const ageTotals = new Map<string, number>();

  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    let frequency = normalize(r.raw.discussionFrequency ?? '').toLowerCase();

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a' || !frequency || frequency === 'n/a') return;

    if (frequency.includes('every few months')) frequency = 'every few months';
    else if (frequency === 'monthly') frequency = 'monthly';

    if (!FREQUENCY_TEMPLATE.includes(frequency) && frequency !== 'other') {
      frequency = 'other';
    }

    if (!ageStats.has(ageGroup)) {
      ageStats.set(ageGroup, new Map());
      ageTotals.set(ageGroup, 0);
    }
    const freqs = ageStats.get(ageGroup)!;
    freqs.set(frequency, (freqs.get(frequency) ?? 0) + 1);

    ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + 1);
  });

  const items: { label: string; value: number }[] = [];
  const validResponses = Array.from(ageTotals.values()).reduce((a, b) => a + b, 0);

  ageStats.forEach((freqMap, ageGroup) => {
    const groupTotal = ageTotals.get(ageGroup) ?? 0;
    if (groupTotal === 0) return;

    freqMap.forEach((count, freq) => {
      // Percentage based on TOTAL valid responses, not group total
      const pct = (count / validResponses) * 100;
      let freqLabel = freq;
      if (freq === 'every few months') freqLabel = 'Every few months';
      else freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1);

      items.push({
        label: `${ageGroup} - ${freqLabel}`,
        value: pct,
      });
    });
  });

  return {
    items,
    stats: { numberOfResponses: validResponses },
  };
};

const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
  sortBy: 'absoluteDifference',
});

const comparisonStrategy: typeof baseComparisonStrategy = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  const result = baseComparisonStrategy(
    currentYearData,
    compareYearData,
    currentYear,
    compareYear,
    palette
  );

  if (result && 'layout' in result && result.layout) {
    result.layout.yaxis = {
      ...result.layout.yaxis,
      dtick: 1, // Force display of all labels
    };

    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    // Dynamic height adjustment based on number of items
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 40 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

// --- The Component ---
export const DiscussionFrequencyByAge = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 20, l: 220 },
      xaxis: {
        side: 'top',
        tickangle: 0,
      },
      yaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="DiscussionFrequencyByAge"
      processor={processDiscussionFrequency}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={discussionFrequencyByAgeExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
