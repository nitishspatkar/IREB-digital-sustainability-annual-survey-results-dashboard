import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const COORDINATION_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- The Processor Logic ---
const processOrganizationDepartmentCoordinationByRole: ChartProcessor = (responses, palette) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Filter Data: Precondition Q17 = Yes
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  );

  // 2. Parse Data
  filteredResponses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    const coordination = norm(r.raw.organizationDepartmentCoordination ?? '');

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    // Filter valid answers
    if (coordination !== 'yes' && coordination !== 'no' && coordination !== 'not sure') {
      return;
    }

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleTotals.set(role, 0);
    }

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const statMap = roleStats.get(role)!;

    let label = '';
    if (coordination === 'yes') label = 'Yes';
    else if (coordination === 'no') label = 'No';
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
  const traces: Data[] = COORDINATION_TEMPLATE.map((def) => {
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
      totalEligible: filteredResponses.length,
    },
    traces: traces,
  };
};

// --- The Component ---
export const OrganizationDepartmentCoordinationByRole = ({
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
      graphId="OrganizationDepartmentCoordinationByRole"
      processor={processOrganizationDepartmentCoordinationByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
