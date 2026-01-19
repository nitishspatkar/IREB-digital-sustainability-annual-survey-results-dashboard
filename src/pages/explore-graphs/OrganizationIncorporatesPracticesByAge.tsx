import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const PRACTICES_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- The Processor Logic ---
const processOrganizationIncorporatesPracticesByAge: ChartProcessor = (responses, palette) => {
  const ageStats = new Map<string, Map<string, number>>();
  const ageTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    const hasPractices = norm(r.raw.organizationIncorporatesSustainablePractices ?? '');

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') {
      return;
    }

    // Filter valid answers
    if (hasPractices !== 'yes' && hasPractices !== 'no' && hasPractices !== 'not sure') {
      return;
    }

    if (!ageStats.has(ageGroup)) {
      ageStats.set(ageGroup, new Map());
      ageTotals.set(ageGroup, 0);
    }

    ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + 1);

    const statMap = ageStats.get(ageGroup)!;

    let label = '';
    if (hasPractices === 'yes') label = 'Yes';
    else if (hasPractices === 'no') label = 'No';
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
  const traces: Data[] = PRACTICES_TEMPLATE.map((def) => {
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
export const OrganizationIncorporatesPracticesByAge = ({
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
      graphId="OrganizationIncorporatesPracticesByAge"
      processor={processOrganizationIncorporatesPracticesByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
