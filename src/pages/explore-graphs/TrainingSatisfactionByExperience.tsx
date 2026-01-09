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
const processTrainingSatisfactionByExperience: ChartProcessor = (responses, palette) => {
  const expStats = new Map<string, Map<string, number>>();
  const expTotals = new Map<string, number>(); // Answered totals
  const expEligibleTotals = new Map<string, number>(); // Eligible totals

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Filter: Only those who participated in training
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const exp = normalize(r.raw.professionalExperienceYears ?? '');

    if (!exp || exp.toLowerCase() === 'n/a') {
      return;
    }

    if (!expStats.has(exp)) {
      expStats.set(exp, new Map());
      expTotals.set(exp, 0);
      expEligibleTotals.set(exp, 0);
    }

    // Count eligible (Denominator)
    expEligibleTotals.set(exp, (expEligibleTotals.get(exp) ?? 0) + 1);

    const satisfaction = norm(r.raw.trainingSatisfaction ?? '');

    // Only count explicit Yes/No
    if (satisfaction !== 'yes' && satisfaction !== 'no') {
      return;
    }

    // Count total responses per experience level (Numerator)
    expTotals.set(exp, (expTotals.get(exp) ?? 0) + 1);

    const statMap = expStats.get(exp)!;
    const label = satisfaction === 'yes' ? 'Yes' : 'No';
    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedExp = Array.from(expEligibleTotals.entries())
    .sort((a, b) => {
      const aLabel = a[0];
      const bLabel = b[0];
      const aMatch = aLabel.match(/^(\d+)/);
      const bMatch = bLabel.match(/^(\d+)/);

      if (aLabel.startsWith('Less than')) return -1;
      if (bLabel.startsWith('Less than')) return 1;
      if (aLabel.startsWith('More than')) return 1;
      if (bLabel.startsWith('More than')) return -1;
      if (aMatch && bMatch) return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      return aLabel.localeCompare(bLabel);
    })
    .map(([exp]) => exp);

  const totalRespondents = Array.from(expTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(expEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
  };

  // 4. Build Traces
  const traces: Data[] = SATISFACTION_TEMPLATE.map((def) => {
    const label = def.label;
    const xValues = sortedExp.map((exp) => expStats.get(exp)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedExp,
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
export const TrainingSatisfactionByExperience = ({
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
      margin: { t: 40, r: 20, b: 60, l: 150 },
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
      graphId="TrainingSatisfactionByExperience"
      processor={processTrainingSatisfactionByExperience}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
