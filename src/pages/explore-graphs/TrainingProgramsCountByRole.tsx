import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Reusing the categorization logic from TrainingProgramsCount
function categorizeCount(rawValue: string): { label: string; sortKey: number } | null {
  const value = normalize(rawValue);
  if (!value || value.toLowerCase() === 'n/a') return null;

  if (/^\d+$/.test(value)) {
    const n = Number(value);
    return { label: String(n), sortKey: n };
  }

  const lower = value.toLowerCase();

  const plusMatch = value.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const n = Number(plusMatch[1]);
    return { label: value, sortKey: n + 0.001 };
  }
  const moreThanMatch = lower.match(/more than\s*(\d+)/);
  if (moreThanMatch) {
    const n = Number(moreThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }
  const greaterThanMatch = value.match(/>\s*(\d+)/);
  if (greaterThanMatch) {
    const n = Number(greaterThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }

  const rangeMatch = value.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return { label: value, sortKey: lo + (hi - lo) / 100 };
  }

  const firstNum = value.match(/(\d+)/);
  if (firstNum) {
    const n = Number(firstNum[1]);
    return { label: value, sortKey: n };
  }

  return { label: value, sortKey: Number.POSITIVE_INFINITY };
}

// --- The Processor Logic ---
const processTrainingProgramsCountByRole: ChartProcessor = (responses, palette) => {
  const roleCountsMap = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();
  // To keep track of all unique count labels encountered, to build traces
  const uniqueCountLabels = new Map<string, number>(); // Label -> SortKey

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Precondition: Must have participated
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const role = normalize(r.raw.role ?? '');
    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    const countCat = categorizeCount(r.raw.trainingCount ?? '');
    if (!countCat) return;

    if (!roleCountsMap.has(role)) {
      roleCountsMap.set(role, new Map());
      roleTotals.set(role, 0);
    }
    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const counts = roleCountsMap.get(role)!;
    counts.set(countCat.label, (counts.get(countCat.label) ?? 0) + 1);

    if (!uniqueCountLabels.has(countCat.label)) {
      uniqueCountLabels.set(countCat.label, countCat.sortKey);
    }
  });

  // 2. Sort Roles (by total respondents)
  const sortedRoles = Array.from(roleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalRespondents = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Sort Count Labels (for consistent stacking)
  const sortedCountLabels = Array.from(uniqueCountLabels.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label);

  // 4. Define Colors
  // We'll cycle through a few colors or use a gradient approach if possible.
  // Given we don't know how many buckets, let's just cycle the palette.
  const colors = [
    palette.berry,
    palette.spring,
    palette.mandarin,
    palette.lightBerry,
    palette.darkSpring,
    palette.grey02,
    palette.superLightBerry,
  ];

  // 5. Build Traces
  const traces: Data[] = sortedCountLabels.map((label, index) => {
    const xValues = sortedRoles.map((role) => roleCountsMap.get(role)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedRoles,
      x: xValues,
      marker: {
        color: colors[index % colors.length],
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
    stats: { numberOfResponses: totalRespondents },
    traces: traces,
  };
};

// --- The Component ---
export const TrainingProgramsCountByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 200 },
      uniformtext: {
        mode: 'show',
        minsize: 10,
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
      graphId="TrainingProgramsCountByRole"
      processor={processTrainingProgramsCountByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
