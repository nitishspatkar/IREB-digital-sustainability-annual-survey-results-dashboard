import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const SATISFACTION_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- The Processor Logic ---
const processTrainingSatisfactionByOrgType: ChartProcessor = (responses, palette) => {
  const orgStats = new Map<string, Map<string, number>>();
  const orgTotals = new Map<string, number>(); // Answered totals
  const orgEligibleTotals = new Map<string, number>(); // Eligible totals

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Filter: Only those who participated in training
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const orgType = normalize(r.raw.organizationType ?? '');

    if (!orgType || orgType.toLowerCase() === 'n/a') {
      return;
    }

    if (!orgStats.has(orgType)) {
      orgStats.set(orgType, new Map());
      orgTotals.set(orgType, 0);
      orgEligibleTotals.set(orgType, 0);
    }

    // Count eligible (Denominator)
    orgEligibleTotals.set(orgType, (orgEligibleTotals.get(orgType) ?? 0) + 1);

    const satisfaction = norm(r.raw.trainingSatisfaction ?? '');

    // Only count explicit Yes/No
    if (satisfaction !== 'yes' && satisfaction !== 'no') {
      return;
    }

    // Count total responses per org type (Numerator)
    orgTotals.set(orgType, (orgTotals.get(orgType) ?? 0) + 1);

    const statMap = orgStats.get(orgType)!;
    const label = satisfaction === 'yes' ? 'Yes' : 'No';
    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedOrgTypes = Array.from(orgEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([orgType]) => orgType);

  const totalRespondents = Array.from(orgTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(orgEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
  };

  // 4. Build Traces
  const traces: Data[] = SATISFACTION_TEMPLATE.map((def) => {
    const label = def.label;
    const xValues = sortedOrgTypes.map((orgType) => orgStats.get(orgType)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedOrgTypes,
      x: xValues,
      marker: {
        color: colors[label],
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      hoverinfo: 'x+y+name',
    };
  });

  return {
    stats: {
      numberOfResponses: totalRespondents,
      totalEligible: totalEligible,
    },
    traces: traces,
  };
};

// --- The Component ---
export const TrainingSatisfactionByOrgType = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 200 },
      uniformtext: { mode: 'show', minsize: 10 },
      xaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      yaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingSatisfactionByOrgType"
      processor={processTrainingSatisfactionByOrgType}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
