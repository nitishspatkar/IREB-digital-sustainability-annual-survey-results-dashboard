import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import {
  stackedBarComparisonStrategy,
  type StackedBarData,
} from '../../components/comparision-components/StackedBarComparisonStrategy';

// --- Constants & Helpers ---
const COORDINATION_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const norm = (v: string) => v?.trim().toLowerCase() ?? '';

// --- The Extractor Logic ---
const extractOrganizationDepartmentCoordinationByOrgType: DataExtractor<StackedBarData> = (
  responses
) => {
  const orgStats = new Map<string, Map<string, number>>();
  const orgTotals = new Map<string, number>();

  // 1. Filter Data: Precondition Q17 = Yes
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  );

  // 2. Parse Data
  filteredResponses.forEach((r) => {
    const orgType = normalize(r.raw.organizationType ?? '');
    const coordination = norm(r.raw.organizationDepartmentCoordination ?? '');

    if (!orgType || orgType.toLowerCase() === 'n/a') {
      return;
    }

    // Filter valid answers
    if (coordination !== 'yes' && coordination !== 'no' && coordination !== 'not sure') {
      return;
    }

    if (!orgStats.has(orgType)) {
      orgStats.set(orgType, new Map());
      orgTotals.set(orgType, 0);
    }

    orgTotals.set(orgType, (orgTotals.get(orgType) ?? 0) + 1);

    const statMap = orgStats.get(orgType)!;

    let label = '';
    if (coordination === 'yes') label = 'Yes';
    else if (coordination === 'no') label = 'No';
    else label = 'Not sure';

    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 3. Sort & Filter (Sort by total count)
  const sortedOrgTypes = Array.from(orgTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([orgType]) => orgType);

  const totalRespondents = Array.from(orgTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Construct Series in StackedBarData format
  const series = COORDINATION_TEMPLATE.map((def) => {
    const label = def.label;
    const values = sortedOrgTypes.map((orgType) => orgStats.get(orgType)?.get(label) ?? 0);
    return { label, values };
  });

  return {
    categories: sortedOrgTypes,
    series,
    stats: {
      numberOfResponses: totalRespondents,
      totalEligible: filteredResponses.length,
    },
  };
};

// --- The Processor Logic ---
const processOrganizationDepartmentCoordinationByOrgType: ChartProcessor = (responses, palette) => {
  const data = extractOrganizationDepartmentCoordinationByOrgType(responses);

  // Define Colors (locally for single-year view)
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    'Not sure': palette.grey02,
  };

  // Build Traces
  const traces: Data[] = data.series.map((s) => {
    return {
      type: 'bar',
      name: s.label,
      orientation: 'h',
      y: data.categories,
      x: s.values,
      marker: {
        color: colors[s.label],
      },
      text: s.values.map((v) => (v > 0 ? v.toString() : '')),
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
    stats: data.stats,
    traces: traces,
  };
};

// --- The Component ---
export const OrganizationDepartmentCoordinationByOrgType = ({
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
      graphId="OrganizationDepartmentCoordinationByOrgType"
      processor={processOrganizationDepartmentCoordinationByOrgType}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractOrganizationDepartmentCoordinationByOrgType}
      comparisonStrategy={stackedBarComparisonStrategy}
    />
  );
};
