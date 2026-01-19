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
const processTrainingSatisfactionByAge: ChartProcessor = (responses, palette) => {
  const ageStats = new Map<string, Map<string, number>>();
  const ageTotals = new Map<string, number>(); // Answered totals
  const ageEligibleTotals = new Map<string, number>(); // Eligible totals

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Filter: Only those who participated in training
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const ageGroup = normalize(r.raw.ageGroup ?? '');

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') {
      return;
    }

    if (!ageStats.has(ageGroup)) {
      ageStats.set(ageGroup, new Map());
      ageTotals.set(ageGroup, 0);
      ageEligibleTotals.set(ageGroup, 0);
    }

    // Count eligible (Denominator)
    ageEligibleTotals.set(ageGroup, (ageEligibleTotals.get(ageGroup) ?? 0) + 1);

    const satisfaction = norm(r.raw.trainingSatisfaction ?? '');

    // Only count explicit Yes/No
    if (satisfaction !== 'yes' && satisfaction !== 'no') {
      return;
    }

    // Count total responses per age group (Numerator)
    ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + 1);

    const statMap = ageStats.get(ageGroup)!;
    const label = satisfaction === 'yes' ? 'Yes' : 'No';
    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedAgeGroups = Array.from(ageEligibleTotals.entries())
    .sort((a, b) => {
      const aMatch = a[0].match(/^(\d+)/);
      const bMatch = b[0].match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([age]) => age);

  const totalRespondents = Array.from(ageTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(ageEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
  };

  // 4. Build Traces
  const traces: Data[] = SATISFACTION_TEMPLATE.map((def) => {
    const label = def.label;
    const xValues = sortedAgeGroups.map((age) => ageStats.get(age)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedAgeGroups,
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
export const TrainingSatisfactionByAge = ({
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
      margin: { t: 40, r: 20, b: 60, l: 60 },
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
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingSatisfactionByAge"
      processor={processTrainingSatisfactionByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
