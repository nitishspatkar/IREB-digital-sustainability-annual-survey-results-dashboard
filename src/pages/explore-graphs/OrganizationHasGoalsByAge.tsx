import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const GOALS_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const extractOrganizationHasGoalsByAgeData: DataExtractor<HorizontalBarData> = (responses) => {
  const ageCounts = new Map<string, { yes: number; no: number; notSure: number }>();
  let totalValidResponses = 0;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    const hasGoals = norm(r.raw.organizationHasDigitalSustainabilityGoals ?? '');

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') {
      return;
    }

    if (hasGoals !== 'yes' && hasGoals !== 'no' && hasGoals !== 'not sure') {
      return;
    }

    totalValidResponses++;

    if (!ageCounts.has(ageGroup)) {
      ageCounts.set(ageGroup, { yes: 0, no: 0, notSure: 0 });
    }

    const counts = ageCounts.get(ageGroup)!;
    if (hasGoals === 'yes') counts.yes++;
    else if (hasGoals === 'no') counts.no++;
    else counts.notSure++;
  });

  const items: { label: string; value: number }[] = [];

  const sortedAges = Array.from(ageCounts.keys()).sort((a, b) => {
    const aMatch = a.match(/^(\d+)/);
    const bMatch = b.match(/^(\d+)/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    }
    return a.localeCompare(b);
  });

  sortedAges.forEach((age) => {
    const counts = ageCounts.get(age)!;
    if (totalValidResponses > 0) {
      const yesPct = (counts.yes / totalValidResponses) * 100;
      const noPct = (counts.no / totalValidResponses) * 100;
      const notSurePct = (counts.notSure / totalValidResponses) * 100;

      if (yesPct > 0) items.push({ label: `${age}<br>Yes`, value: yesPct });
      if (noPct > 0) items.push({ label: `${age}<br>No`, value: noPct });
      if (notSurePct > 0) items.push({ label: `${age}<br>Not sure`, value: notSurePct });
    }
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
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

    // Dynamic height adjustment
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

// --- The Processor Logic ---
const processOrganizationHasGoalsByAge: ChartProcessor = (responses, palette) => {
  const ageStats = new Map<string, Map<string, number>>();
  const ageTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    const hasGoals = norm(r.raw.organizationHasDigitalSustainabilityGoals ?? '');

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') {
      return;
    }

    // Filter valid answers
    if (hasGoals !== 'yes' && hasGoals !== 'no' && hasGoals !== 'not sure') {
      return;
    }

    if (!ageStats.has(ageGroup)) {
      ageStats.set(ageGroup, new Map());
      ageTotals.set(ageGroup, 0);
    }

    ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + 1);

    const statMap = ageStats.get(ageGroup)!;

    let label = '';
    if (hasGoals === 'yes') label = 'Yes';
    else if (hasGoals === 'no') label = 'No';
    else label = 'Not sure';

    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter (Numerical Sort for Age)
  const sortedAgeGroups = Array.from(ageTotals.entries())
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

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    'Not sure': palette.grey02,
  };

  // 4. Build Traces
  const traces: Data[] = GOALS_TEMPLATE.map((def) => {
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
    stats: { numberOfResponses: totalRespondents },
    traces: traces,
  };
};

// --- The Component ---
export const OrganizationHasGoalsByAge = ({
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
      uniformtext: { mode: 'show', minsize: 13 },
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
      graphId="OrganizationHasGoalsByAge"
      processor={processOrganizationHasGoalsByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractOrganizationHasGoalsByAgeData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
