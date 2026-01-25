import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants ---
const MEASURE_GROUPS = [
  'No sustainability',
  'Unclear communication',
  'One measure',
  'Two measures',
  'Three measures',
  'Four measures',
];

const MEASURE_COLUMNS = [
  'organizationHasDigitalSustainabilityGoals',
  'organizationHasSustainabilityTeam',
  'organizationIncorporatesSustainablePractices',
  'organizationDepartmentCoordination',
  'organizationReportsOnSustainability',
  'organizationOffersTraining',
] as const;

const ROLE_DIMENSIONS = [
  { key: 'roleConsiderEnvironmental', label: 'Environmental' },
  { key: 'roleConsiderSocial', label: 'Social' },
  { key: 'roleConsiderIndividual', label: 'Individual' },
  { key: 'roleConsiderEconomic', label: 'Economic' },
  { key: 'roleConsiderTechnical', label: 'Technical' },
  { key: 'roleConsiderOther', label: 'Other' },
] as const;

const normalize = (value: string | undefined | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

const getMeasureGroup = (raw: SurveyRecord): string | null => {
  const incPractices = normalize(raw.organizationIncorporatesSustainablePractices);

  if (incPractices === 'no') {
    return 'No sustainability';
  } else if (incPractices === 'not sure') {
    return 'Unclear communication';
  }

  let count = 0;
  for (const col of MEASURE_COLUMNS) {
    const val = normalize(raw[col]);
    if (val === 'yes') {
      count++;
    }
  }

  if (count === 1) return 'One measure';
  if (count === 2) return 'Two measures';
  if (count === 3) return 'Three measures';
  if (count >= 4) return 'Four measures';

  return 'One measure';
};

// --- Data Extractor ---
const sustainabilityDimensionsExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  // Map<Group, Map<DimensionKey, Count>>
  const groupStats = new Map<string, Map<string, number>>();

  // Initialize map
  MEASURE_GROUPS.forEach((g) => {
    const dimMap = new Map<string, number>();
    ROLE_DIMENSIONS.forEach((d) => dimMap.set(d.key, 0));
    groupStats.set(g, dimMap);
  });

  let totalResponses = 0;

  responses.forEach((r) => {
    // Filter: Must incorporate sustainability
    const incorporates = normalize(r.raw.personIncorporatesSustainability) === 'yes';
    if (!incorporates) return;

    const group = getMeasureGroup(r.raw);
    if (!group) return;

    totalResponses++;
    const entry = groupStats.get(group)!;

    ROLE_DIMENSIONS.forEach((d) => {
      // Check if this dimension is selected
      if (normalize((r.raw as any)[d.key]) === 'yes') {
        entry.set(d.key, (entry.get(d.key) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  groupStats.forEach((dimMap, groupName) => {
    dimMap.forEach((count, dimKey) => {
      if (count > 0) {
        const dimLabel = ROLE_DIMENSIONS.find((d) => d.key === dimKey)?.label || dimKey;
        items.push({
          label: `${groupName} - ${dimLabel}`,
          value: count, // Raw count, strategy will normalize
        });
      }
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: totalResponses,
      totalEligible: totalResponses,
    },
  };
};

// --- Comparison Strategy ---
const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: true, // Divide raw count by total responses
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
    // Dynamic height: This chart can have many items (6 groups * 6 dims = 36 max)
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 35 + 100);

    result.layout.height = dynamicHeight;

    // Adjust margin for long labels (e.g., "Unclear communication - Environmental")
    result.layout.margin = {
      ...(result.layout.margin || {}),
      l: 260,
    };
  }

  return result;
};

// --- Component ---
export const SustainabilityDimensionsInTasksByMeasureCount = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const targetPopulation = responses.filter((r) => {
        const incorporates = normalize(r.raw.personIncorporatesSustainability) === 'yes';
        const group = getMeasureGroup(r.raw);
        return incorporates && group !== null;
      });

      const groupStats = new Map<string, Map<string, number>>();
      MEASURE_GROUPS.forEach((g) => {
        const dimMap = new Map<string, number>();
        ROLE_DIMENSIONS.forEach((d) => dimMap.set(d.key, 0));
        groupStats.set(g, dimMap);
      });

      targetPopulation.forEach((r) => {
        const group = getMeasureGroup(r.raw)!;
        const entry = groupStats.get(group)!;

        ROLE_DIMENSIONS.forEach((d) => {
          if (normalize((r.raw as any)[d.key]) === 'yes') {
            entry.set(d.key, (entry.get(d.key) ?? 0) + 1);
          }
        });
      });

      const plotGroups = [...MEASURE_GROUPS].reverse();

      const dimColors: Record<string, string> = {
        Environmental: palette.spring,
        Social: palette.mandarin,
        Individual: palette.berry,
        Economic: palette.transport,
        Technical: palette.grey02,
        Other: palette.grey,
      };

      const traces: Data[] = ROLE_DIMENSIONS.map((dim) => {
        const yValues = plotGroups;
        const xValues = plotGroups.map((g) => groupStats.get(g)?.get(dim.key) ?? 0);

        return {
          type: 'bar',
          name: dim.label,
          orientation: 'h',
          y: yValues,
          x: xValues,
          marker: { color: dimColors[dim.label] },
          text: xValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: '#FFFFFF',
          },
          hovertemplate: `<b>%{y}</b><br>${dim.label}: %{x}<extra></extra>`,
        };
      });

      return {
        stats: {
          numberOfResponses: targetPopulation.length,
          totalEligible: targetPopulation.length,
        },
        traces: traces,
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 160 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
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
    }),
    []
  );

  return (
    <GenericChart
      graphId="SustainabilityDimensionsInTasksByMeasureCount"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={sustainabilityDimensionsExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
