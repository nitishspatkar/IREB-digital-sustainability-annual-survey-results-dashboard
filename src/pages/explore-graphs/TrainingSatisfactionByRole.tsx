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
const processTrainingSatisfactionByRole: ChartProcessor = (responses, palette) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>(); // Answered totals
  const roleEligibleTotals = new Map<string, number>(); // Eligible totals

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Filter: Only those who participated in training
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const role = normalize(r.raw.role ?? '');

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
      roleEligibleTotals.set(role, 0);
    }

    // Count eligible (Denominator)
    roleEligibleTotals.set(role, (roleEligibleTotals.get(role) ?? 0) + 1);

    const satisfaction = norm(r.raw.trainingSatisfaction ?? '');

    // Only count explicit Yes/No
    if (satisfaction !== 'yes' && satisfaction !== 'no') {
      return;
    }

    // Count total responses per role (Numerator)
    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const statMap = roleStats.get(role)!;
    // Map to capital Case for display
    const label = satisfaction === 'yes' ? 'Yes' : 'No';
    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedRoles = Array.from(roleEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalRespondents = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(roleEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
  };

  // 4. Build Traces
  const traces: Data[] = SATISFACTION_TEMPLATE.map((def) => {
    const label = def.label;
    const xValues = sortedRoles.map((role) => roleStats.get(role)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedRoles,
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
export const TrainingSatisfactionByRole = ({
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
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingSatisfactionByRole"
      processor={processTrainingSatisfactionByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
