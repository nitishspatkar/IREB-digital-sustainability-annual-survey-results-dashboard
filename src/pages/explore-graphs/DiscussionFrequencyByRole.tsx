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
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();
  const freqTotals = new Map<string, number>();

  // 1. Parse Data
  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    let frequency = normalize(r.raw.discussionFrequency ?? '').toLowerCase();

    if (!role || role.toLowerCase() === 'n/a' || !frequency || frequency === 'n/a') return;

    if (frequency.includes('every few months')) frequency = 'every few months';
    else if (frequency === 'monthly') frequency = 'monthly';

    if (!FREQUENCY_TEMPLATE.includes(frequency) && frequency !== 'other') {
      frequency = 'other';
    }

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
    }
    const freqs = roleStats.get(role)!;
    freqs.set(frequency, (freqs.get(frequency) ?? 0) + 1);

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
    freqTotals.set(frequency, (freqTotals.get(frequency) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedRoles = Array.from(roleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const activeFreqs = FREQUENCY_TEMPLATE.filter((f) => (freqTotals.get(f) ?? 0) > 0);
  const displayLabels = activeFreqs.map(formatLabel);

  // 3. Build Matrices
  const zValues = sortedRoles.map((role) =>
    activeFreqs.map((freq) => roleStats.get(role)?.get(freq) ?? 0)
  );

  const maxZ = Math.max(...zValues.flat());
  const validResponses = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Calculate Text Colors (Dynamic contrast)
  // We build a matrix of colors matching the zValues matrix
  const textColors = zValues.map((row) =>
    row.map((val) => (val / maxZ > 0.4 ? '#FFFFFF' : palette.grey))
  );

  // 5. Create Trace
  const trace: Data = {
    type: 'heatmap',
    x: displayLabels,
    y: sortedRoles,
    z: zValues,
    colorscale: [
      [0, '#F2F2F2'], // Light color from original
      [1, palette.berry],
    ],
    xgap: 2,
    ygap: 2,
    showscale: false,
    // Use texttemplate to show numbers inside cells (replaces layout.annotations)
    text: zValues.map((row) => row.map((v) => (v > 0 ? v.toString() : ''))) as unknown as string[],
    texttemplate: '%{text}',
    textfont: {
      family: 'PP Mori, sans-serif',
      size: 13,
      color: textColors as unknown as string, // Pass the color matrix
    },
    hoverinfo: 'x+y+z',
  };

  return {
    stats: { numberOfResponses: validResponses },
    traces: [trace],
  };
};

// --- Comparison Strategy Setup ---
const discussionFrequencyByRoleExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();

  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    let frequency = normalize(r.raw.discussionFrequency ?? '').toLowerCase();

    if (!role || role.toLowerCase() === 'n/a' || !frequency || frequency === 'n/a') return;

    if (frequency.includes('every few months')) frequency = 'every few months';
    else if (frequency === 'monthly') frequency = 'monthly';

    if (!FREQUENCY_TEMPLATE.includes(frequency) && frequency !== 'other') {
      frequency = 'other';
    }

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
    }
    const freqs = roleStats.get(role)!;
    freqs.set(frequency, (freqs.get(frequency) ?? 0) + 1);

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
  });

  const items: { label: string; value: number }[] = [];
  const validResponses = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);

  roleStats.forEach((freqMap, role) => {
    const roleTotal = roleTotals.get(role) ?? 0;
    if (roleTotal === 0) return;

    freqMap.forEach((count, freq) => {
      const pct = (count / validResponses) * 100;
      let freqLabel = freq;
      if (freq === 'every few months') freqLabel = 'Every few months';
      else freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1);

      items.push({
        label: `${role} - ${freqLabel}`,
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
      dtick: 1, // Force display of all labels (prevent skipping)
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
    // traces[1] is the compareYear markers trace, its y-axis data has the labels/items
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 40 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

// --- The Component ---
export const DiscussionFrequencyByRole = ({
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
      graphId="DiscussionFrequencyByRole"
      processor={processDiscussionFrequency}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={discussionFrequencyByRoleExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
