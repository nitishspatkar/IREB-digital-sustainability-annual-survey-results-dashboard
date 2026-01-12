import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants ---
const DIMENSIONS = [
  { key: 'considerEnvironmental', label: 'Environmental' },
  { key: 'considerSocial', label: 'Social' },
  { key: 'considerIndividual', label: 'Individual' },
  { key: 'considerEconomic', label: 'Economic' },
  { key: 'considerTechnical', label: 'Technical' },
] as const;

const ORG_ORDER = ['Large company', 'Research', 'Other organizations'];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const norm = (v: string) => v?.trim().toLowerCase() ?? '';

// Helper to group organization types
const groupOrganizationType = (orgType: string): string | null => {
  const normalized = normalize(orgType).toLowerCase();
  if (normalized.includes('large enterprise')) return 'Large company';
  if (normalized.includes('university') || normalized.includes('research institute'))
    return 'Research';
  if (!orgType || normalized === 'n/a') return null;
  return 'Other organizations';
};

// --- Processor ---
const processSustainabilityDimensionsByOrgType: ChartProcessor = (responses, palette) => {
  // 1. Filter: Only respondents who incorporate sustainable practices
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  );

  // 2. Initialize Data Structure
  const orgStats = new Map<string, Map<string, { yes: number; total: number }>>();
  ORG_ORDER.forEach((group) => {
    const dimensionMap = new Map<string, { yes: number; total: number }>();
    DIMENSIONS.forEach((dim) => {
      dimensionMap.set(dim.key, { yes: 0, total: 0 });
    });
    orgStats.set(group, dimensionMap);
  });

  // 3. Aggregate Counts
  filteredResponses.forEach((r) => {
    const orgGroup = groupOrganizationType(r.raw.organizationType ?? '');
    if (!orgGroup) return;

    const dimensionMap = orgStats.get(orgGroup)!;

    DIMENSIONS.forEach((dim) => {
      const value = norm(r.raw[dim.key] ?? '');
      const stats = dimensionMap.get(dim.key)!;
      stats.total += 1;
      if (value === 'yes') stats.yes += 1;
    });
  });

  // 4. Prepare Coordinate-based Data for Plotly
  // We use specific integers for X to create groups with gaps.
  // Group 1: 0,1,2,3,4 | Gap | Group 2: 6,7,8,9,10 | Gap | Group 3: 12,13,14,15,16

  const xValues: number[] = [];
  const yesValues: number[] = [];
  const noValues: number[] = [];
  const hoverTextsYes: string[] = [];
  const hoverTextsNo: string[] = [];

  let currentX = 0;
  const GAP_SIZE = 1;

  ORG_ORDER.forEach((group) => {
    DIMENSIONS.forEach((dim) => {
      const stats = orgStats.get(group)!.get(dim.key)!;
      const total = stats.total;
      const yes = stats.yes;
      const no = total - yes;

      const yesPct = total > 0 ? (yes / total) * 100 : 0;
      const noPct = total > 0 ? (no / total) * 100 : 0;

      xValues.push(currentX);
      yesValues.push(yesPct);
      noValues.push(noPct);

      // Detailed hover info since we removed text labels
      const baseHover = `<b>${group}</b><br>${dim.label}`;
      hoverTextsYes.push(`${baseHover}<br>Yes: ${yes} (${yesPct.toFixed(1)}%)`);
      hoverTextsNo.push(`${baseHover}<br>No: ${no} (${noPct.toFixed(1)}%)`);

      currentX++; // Next bar
    });
    currentX += GAP_SIZE; // Add gap between organizations
  });

  // 5. Build Traces
  const traces: Data[] = [
    {
      type: 'bar',
      name: 'Yes',
      x: xValues,
      y: yesValues,
      marker: { color: palette.spring }, // Green
      hovertemplate: '%{hovertext}<extra></extra>',
      hovertext: hoverTextsYes,
    },
    {
      type: 'bar',
      name: 'No',
      x: xValues,
      y: noValues,
      marker: { color: palette.mandarin }, // Red
      hovertemplate: '%{hovertext}<extra></extra>',
      hovertext: hoverTextsNo,
    },
  ];

  return {
    stats: {
      numberOfResponses: filteredResponses.length,
      totalEligible: responses.filter(
        (r) => norm(r.raw.organizationIncorporatesSustainablePractices) !== ''
      ).length,
    },
    traces,
  };
};

// --- Component ---
export const SustainabilityDimensionsByOrgType = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0, // Bars within a group touch each other
      margin: { t: 40, r: 20, b: 80, l: 60 },
      xaxis: {
        title: { text: '' },
        tickmode: 'array',
        // Center ticks based on the coordinate logic:
        // Large (0-4) center: 2
        // Research (6-10) center: 8
        // Other (12-16) center: 14
        tickvals: [2, 8, 14],
        ticktext: ORG_ORDER,
        tickfont: { size: 12 },
        fixedrange: true,
      },
      yaxis: {
        title: { text: 'Percentage' },
        range: [0, 100],
        ticksuffix: '%',
        fixedrange: true,
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="SustainabilityDimensionsByOrgType"
      processor={processSustainabilityDimensionsByOrgType}
      layout={layout}
      isEmbedded={showBackButton}
      onBack={showBackButton ? onBack : undefined}
      showResponseStats={false}
    />
  );
};
