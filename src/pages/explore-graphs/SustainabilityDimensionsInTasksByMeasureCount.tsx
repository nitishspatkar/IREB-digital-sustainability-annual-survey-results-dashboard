import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

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

  // Count positive measures
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

  // Fallback for cases where they said Yes to practices but 0 to specific measures
  // Analysis suggests treating this as 'One measure' or broadly part of the 'Yes' group
  return 'One measure';
};

export const SustainabilityDimensionsInTasksByMeasureCount = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      // 1. Filter: Only people who incorporate sustainability in their tasks (Target Population)
      // AND who have a valid Measure Group
      const targetPopulation = responses.filter((r) => {
        const incorporates = normalize(r.raw.personIncorporatesSustainability) === 'yes';
        const group = getMeasureGroup(r.raw);
        return incorporates && group !== null;
      });

      // 2. Initialize Data Structure
      const groupStats = new Map<string, Map<string, number>>();
      MEASURE_GROUPS.forEach((g) => {
        const dimMap = new Map<string, number>();
        ROLE_DIMENSIONS.forEach((d) => dimMap.set(d.key, 0));
        groupStats.set(g, dimMap);
      });

      // 3. Aggregate
      targetPopulation.forEach((r) => {
        const group = getMeasureGroup(r.raw)!; // Checked in filter
        const entry = groupStats.get(group)!;

        ROLE_DIMENSIONS.forEach((d) => {
          // Type assertion needed for dynamic key access on SurveyRecord
          if (normalize((r.raw as any)[d.key]) === 'yes') {
            entry.set(d.key, (entry.get(d.key) ?? 0) + 1);
          }
        });
      });

      // 4. Build Traces
      // Stacked bar chart of counts
      // Y-axis: Measure Groups (reversed)
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
            color: '#FFFFFF', // White text for better contrast on colors
          },
          // Custom hover info
          hovertemplate: `<b>%{y}</b><br>${dim.label}: %{x}<extra></extra>`,
        };
      });

      return {
        stats: {
          numberOfResponses: targetPopulation.length,
          totalEligible: targetPopulation.length, // Rate is relative to the filtered population
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
        y: 1.1,
        x: 0,
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
    />
  );
};
