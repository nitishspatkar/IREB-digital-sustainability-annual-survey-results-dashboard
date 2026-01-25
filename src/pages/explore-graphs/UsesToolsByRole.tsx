import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const ANSWERS_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- Comparison Strategy & Data Extractor ---

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
      dtick: 1,
    };
    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);
    result.layout.height = dynamicHeight;
  }

  return result;
};

const extractUsesToolsByRoleData: DataExtractor<HorizontalBarData> = (responses) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();
  let totalValidResponses = 0;

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    // 1. Filter: Must incorporate sustainability
    if (norm(r.raw.personIncorporatesSustainability) !== 'yes') return;

    // 2. Filter: Valid Role
    const role = normalize(r.raw.role ?? '');
    if (!role || role.toLowerCase() === 'n/a') return;

    // 3. Filter: Valid Answer
    const answer = norm(r.raw.usesTools ?? '');
    if (answer !== 'yes' && answer !== 'no' && answer !== 'not sure') return;

    totalValidResponses++;

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
    }

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
    const statMap = roleStats.get(role)!;

    // Normalize answer label
    const label = answer === 'yes' ? 'Yes' : answer === 'no' ? 'No' : 'Not sure';
    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  const items: { label: string; value: number }[] = [];

  roleStats.forEach((stats, role) => {
    const totalInGroup = roleTotals.get(role) ?? 0;
    if (totalInGroup > 0) {
      stats.forEach((count, answerLabel) => {
        // Calculate percentage relative to TOTAL valid responses, not just the group
        const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
        items.push({
          label: `${role}<br>${answerLabel}`,
          value: pct,
        });
      });
    }
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

// --- The Processor Logic ---
const processUsesToolsByRole: ChartProcessor = (responses, palette) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Calculate Total Eligible Population (Q28=Yes)
  const targetPopulation = responses.filter(
    (r) => norm(r.raw.personIncorporatesSustainability) === 'yes'
  );

  // 2. Parse Data
  targetPopulation.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    const answer = norm(r.raw.usesTools ?? '');

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    // Filter valid answers
    if (answer !== 'yes' && answer !== 'no' && answer !== 'not sure') {
      return;
    }

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
    }

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const statMap = roleStats.get(role)!;

    // Normalize label
    let label = '';
    if (answer === 'yes') label = 'Yes';
    else if (answer === 'no') label = 'No';
    else label = 'Not sure';

    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 3. Sort & Filter (Sort by total count)
  const sortedRoles = Array.from(roleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalRespondents = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    'Not sure': palette.grey02,
  };

  // 5. Build Traces
  const traces: Data[] = ANSWERS_TEMPLATE.map((def) => {
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
    stats: { numberOfResponses: totalRespondents, totalEligible: targetPopulation.length },
    traces: traces,
  };
};

// --- The Component ---
export const UsesToolsByRole = ({
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
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Increased left margin
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
      graphId="UsesToolsByRole"
      processor={processUsesToolsByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractUsesToolsByRoleData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
