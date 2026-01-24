import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const ORG_GROUPS = ['Large company', 'Research', 'Other organizations'];
const DEFAULT_DIMENSIONS = [
  { key: 'considerEnvironmental', label: 'Environmental' },
  { key: 'considerSocial', label: 'Social' },
  { key: 'considerIndividual', label: 'Individual' },
  { key: 'considerEconomic', label: 'Economic' },
  { key: 'considerTechnical', label: 'Technical' },
] as const;

const norm = (v: string) => v?.trim().toLowerCase() ?? '';

const getOrgGroup = (raw: SurveyRecord) => {
  const t = (raw.organizationType ?? '').toLowerCase();
  if (t.includes('large enterprise')) return 'Large company';
  if (t.includes('university') || t.includes('research')) return 'Research';
  if (!t || t === 'n/a') return null;
  return 'Other organizations';
};

// --- Data Extractor (Comparison) ---
const extractSustainabilityDimensionsByOrgTypeData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const statsMap = new Map<string, Map<string, { yes: number; total: number }>>();

  // Initialize Map
  ORG_GROUPS.forEach((group) => {
    const dimMap = new Map();
    DEFAULT_DIMENSIONS.forEach((d) => dimMap.set(d.key, { yes: 0, total: 0 }));
    statsMap.set(group, dimMap);
  });

  // Filter
  const filtered = responses.filter(
    (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  );

  // Aggregate
  filtered.forEach((r) => {
    const groupName = getOrgGroup(r.raw);
    if (!groupName || !statsMap.has(groupName)) return;

    const dimMap = statsMap.get(groupName)!;
    DEFAULT_DIMENSIONS.forEach((dim) => {
      const val = norm((r.raw as any)[dim.key] ?? '');

      const s = dimMap.get(dim.key)!;
      s.total++;
      if (val === 'yes') s.yes++;
    });
  });

  const items: { label: string; value: number }[] = [];

  ORG_GROUPS.forEach((group) => {
    DEFAULT_DIMENSIONS.forEach((dim) => {
      const s = statsMap.get(group)!.get(dim.key)!;
      if (s.total > 0) {
        const yesPct = (s.yes / s.total) * 100;
        const noPct = ((s.total - s.yes) / s.total) * 100;

        items.push({ label: `${group}<br>${dim.label} - Yes`, value: yesPct });
        items.push({ label: `${group}<br>${dim.label} - No`, value: noPct });
      }
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: filtered.length,
      totalEligible: responses.length,
    },
  };
};

// --- Comparison Strategy ---
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

// --- Single Year Processor ---
const processSustainabilityDimensionsByOrgType: ChartProcessor = (responses, palette) => {
  // Filter
  const filtered = responses.filter(
    (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  );

  // Initialize Data Map
  const statsMap = new Map<string, Map<string, { yes: number; total: number }>>();
  ORG_GROUPS.forEach((g) => {
    const dimMap = new Map();
    DEFAULT_DIMENSIONS.forEach((d) => dimMap.set(d.key, { yes: 0, total: 0 }));
    statsMap.set(g, dimMap);
  });

  // Aggregate
  filtered.forEach((r) => {
    const groupName = getOrgGroup(r.raw);
    if (!groupName || !statsMap.has(groupName)) return;

    const dimMap = statsMap.get(groupName)!;
    DEFAULT_DIMENSIONS.forEach((dim) => {
      const val = norm((r.raw as any)[dim.key] ?? '');

      const s = dimMap.get(dim.key)!;
      s.total++;
      if (val === 'yes') s.yes++;
    });
  });

  // Build Plotly Arrays
  const xValues: number[] = [];
  const yesValues: number[] = [];
  const noValues: number[] = [];
  const hoverYes: string[] = [];
  const hoverNo: string[] = [];

  let currentX = 0;
  const GAP = 1;

  ORG_GROUPS.forEach((g) => {
    DEFAULT_DIMENSIONS.forEach((dim) => {
      const s = statsMap.get(g)!.get(dim.key)!;
      const yesPct = s.total > 0 ? (s.yes / s.total) * 100 : 0;
      const noPct = s.total > 0 ? ((s.total - s.yes) / s.total) * 100 : 0;

      xValues.push(currentX);
      yesValues.push(yesPct);
      noValues.push(noPct);

      const h = `<b>${g}</b><br>${dim.label}`;
      hoverYes.push(`${h}<br>Yes: ${s.yes} (${yesPct.toFixed(1)}%)`);
      hoverNo.push(`${h}<br>No: ${s.total - s.yes} (${noPct.toFixed(1)}%)`);
      currentX++;
    });
    currentX += GAP;
  });

  return {
    stats: { numberOfResponses: filtered.length, totalEligible: responses.length },
    traces: [
      {
        type: 'bar',
        name: 'Yes',
        x: xValues,
        y: yesValues,
        marker: { color: palette.spring },
        hovertemplate: '%{hovertext}<extra></extra>',
        hovertext: hoverYes,
      },
      {
        type: 'bar',
        name: 'No',
        x: xValues,
        y: noValues,
        marker: { color: palette.mandarin },
        hovertemplate: '%{hovertext}<extra></extra>',
        hovertext: hoverNo,
      },
    ] as Data[],
  };
};

export const SustainabilityDimensionsByOrgType = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(() => {
    const barsPerGroup = DEFAULT_DIMENSIONS.length;
    const stride = barsPerGroup + 1;
    const tickVals = ORG_GROUPS.map((_, i) => i * stride + (barsPerGroup - 1) / 2);

    return {
      barmode: 'stack',
      bargap: 0,
      xaxis: {
        tickmode: 'array',
        tickvals: tickVals,
        ticktext: ORG_GROUPS,
        fixedrange: true,
      },
      yaxis: { range: [0, 100], ticksuffix: '%', fixedrange: true },
      legend: { orientation: 'h', y: 1.12, x: 1, xanchor: 'right', traceorder: 'normal' },
      margin: { t: 40, r: 20, b: 80, l: 60 },
    };
  }, []);

  return (
    <GenericChart
      graphId="SustainabilityDimensionsByOrgType"
      processor={processSustainabilityDimensionsByOrgType}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      showResponseStats={false}
      dataExtractor={extractSustainabilityDimensionsByOrgTypeData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
