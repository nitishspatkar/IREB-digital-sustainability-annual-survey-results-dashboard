import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const MEASURE_COLUMNS = [
  'organizationHasDigitalSustainabilityGoals',
  'organizationHasSustainabilityTeam',
  'organizationIncorporatesSustainablePractices',
  'organizationDepartmentCoordination',
  'organizationReportsOnSustainability',
  'organizationOffersTraining',
] as const;

// --- Logic Helpers ---

const getCategory = (raw: any): string | null => {
  const incPractices = normalize(
    raw.organizationIncorporatesSustainablePractices ?? ''
  ).toLowerCase();

  if (incPractices === 'no') return 'No sustainability';
  if (incPractices === 'not sure') return 'Unclear communication';

  // For others (likely 'yes'), count the specific measures
  let count = 0;
  for (const col of MEASURE_COLUMNS) {
    const val = normalize(raw[col] ?? '').toLowerCase();
    if (val === 'yes') {
      count++;
    }
  }

  if (count === 1) return 'One measure';
  if (count === 2) return 'Two measures';
  if (count === 3) return 'Three measures';
  if (count >= 4) return 'Four measures';

  return null;
};

const sortOrder = [
  'No sustainability',
  'Unclear communication',
  'One measure',
  'Two measures',
  'Three measures',
  'Four measures',
];

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

const extractPersonIncorporatesSustainabilityByMeasureCountData: DataExtractor<
  HorizontalBarData
> = (responses) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();

  responses.forEach((r) => {
    const category = getCategory(r.raw);
    const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

    if (!category) return;
    if (incorporates !== 'yes' && incorporates !== 'no') return;

    if (!dataMap.has(category)) {
      dataMap.set(category, { yes: 0, no: 0, total: 0 });
    }

    const entry = dataMap.get(category)!;
    entry.total++;

    if (incorporates === 'yes') {
      entry.yes++;
    } else if (incorporates === 'no') {
      entry.no++;
    }
  });

  const sortedCategories = sortOrder.filter((cat) => dataMap.has(cat));

  const items: { label: string; value: number }[] = [];
  const globalTotal = sortedCategories.reduce(
    (acc, cat) => acc + (dataMap.get(cat)?.total ?? 0),
    0
  );

  sortedCategories.forEach((category) => {
    const stats = dataMap.get(category)!;
    const yesPct = globalTotal > 0 ? (stats.yes / globalTotal) * 100 : 0;
    const noPct = globalTotal > 0 ? (stats.no / globalTotal) * 100 : 0;

    items.push({
      label: `${category}<br>Yes`,
      value: yesPct,
    });
    items.push({
      label: `${category}<br>No`,
      value: noPct,
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: globalTotal,
    },
  };
};

// --- Component ---

export const PersonIncorporatesSustainabilityByMeasureCount = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const dataMap = new Map<string, { yes: number; no: number; total: number }>();

      // Pre-fill categories to ensure they all exist even if 0 count
      sortOrder.forEach((cat) => dataMap.set(cat, { yes: 0, no: 0, total: 0 }));

      responses.forEach((r) => {
        const category = getCategory(r.raw);
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

        if (!category) return;
        if (incorporates !== 'yes' && incorporates !== 'no') return;

        if (!dataMap.has(category)) {
          dataMap.set(category, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(category)!;
        entry.total++;
        if (incorporates === 'yes') entry.yes++;
        else entry.no++;
      });

      // Prepare data for plotting
      // We reverse the order for horizontal bars so the first item ('No sustainability') appears at the top
      const plotCategories = [...sortOrder].reverse();

      const yesValues = plotCategories.map((cat) => dataMap.get(cat)?.yes ?? 0);
      const noValues = plotCategories.map((cat) => dataMap.get(cat)?.no ?? 0);
      const validResponses = Array.from(dataMap.values()).reduce(
        (acc, stats) => acc + stats.total,
        0
      );

      const traces: Data[] = [
        {
          y: plotCategories, // Y-axis is categories
          x: yesValues, // X-axis is counts
          name: 'Yes',
          type: 'bar',
          orientation: 'h', // Horizontal bars
          marker: {
            color: palette.spring,
          },
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: '#FFFFFF',
          },
          hoverinfo: 'name' as const,
        },
        {
          y: plotCategories,
          x: noValues,
          name: 'No',
          type: 'bar',
          orientation: 'h',
          marker: {
            color: palette.mandarin,
          },
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: '#FFFFFF',
          },
          hoverinfo: 'name' as const,
        },
      ];

      return {
        traces,
        stats: {
          numberOfResponses: validResponses,
        },
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group', // Side-by-side
      margin: { t: 40, r: 20, b: 60, l: 160 }, // Left margin for labels
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'reversed',
      },
      xaxis: {
        title: {
          text: 'Number of Respondents',
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        automargin: true,
        ticksuffix: '  ', // Add padding between label and axis
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByMeasureCount"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractPersonIncorporatesSustainabilityByMeasureCountData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
