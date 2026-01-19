import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const CAPACITY_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'mixed', label: 'Mixed' },
];

const capacityOptions = [
  { label: 'Yes', searchTerms: ['yes'] },
  { label: 'No', searchTerms: ['no'] },
  {
    label: 'Mixed',
    searchTerms: ['my organization paid it on some occasions, and i paid it myself on others.'],
  },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- The Processor Logic ---
const processTrainingPrivateCapacityByRole: ChartProcessor = (responses, palette) => {
  const roleCapacityStats = new Map<string, Map<string, number>>();
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
    const rawCapacity = norm(r.raw.trainingPrivateCapacity ?? '');

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    if (!roleCapacityStats.has(role)) {
      roleCapacityStats.set(role, new Map());
      roleTotals.set(role, 0);
      roleEligibleTotals.set(role, 0);
    }

    // Count eligible (Denominator)
    roleEligibleTotals.set(role, (roleEligibleTotals.get(role) ?? 0) + 1);

    // Determine capacity category
    const matchedOption = capacityOptions.find((opt) =>
      opt.searchTerms.some((term) => rawCapacity.startsWith(term))
    );

    if (!matchedOption) return;

    // Count total responses per role (Numerator)
    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const capacityMap = roleCapacityStats.get(role)!;
    capacityMap.set(matchedOption.label, (capacityMap.get(matchedOption.label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedRoles = Array.from(roleEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalRespondents = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(roleEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Capacity
  const capacityColors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    Mixed: palette.grey02,
  };

  // 4. Build Traces (One per Capacity type)
  const traces: Data[] = CAPACITY_TEMPLATE.map((capacityDef) => {
    const capacityLabel = capacityDef.label;
    const xValues = sortedRoles.map((role) => roleCapacityStats.get(role)?.get(capacityLabel) ?? 0);

    return {
      type: 'bar',
      name: capacityLabel,
      orientation: 'h',
      y: sortedRoles,
      x: xValues,
      marker: {
        color: capacityColors[capacityLabel],
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
export const TrainingPrivateCapacityByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Stacked bars
      bargap: 0.15, // Thicker bars
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Left margin for Roles
      uniformtext: {
        mode: 'show',
        minsize: 13,
      },
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
        y: 1.1, // Position legend above chart
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingPrivateCapacityByRole"
      processor={processTrainingPrivateCapacityByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
