import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

// --- Constants ---
const DIMENSIONS = [
  'Environmental',
  'Social',
  'Individual',
  'Economic',
  'Technical',
  'Sufficient<br>knowledge',
] as const;

type DimensionLabel = (typeof DIMENSIONS)[number];

// Mapping series to data columns
// Series 1: Development activities (Org)
const ORG_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'considerEnvironmental',
  Social: 'considerSocial',
  Individual: 'considerIndividual',
  Economic: 'considerEconomic',
  Technical: 'considerTechnical',
  // Sufficient knowledge: N/A
};

// Series 2: Role-specific tasks (Role)
const ROLE_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'roleConsiderEnvironmental',
  Social: 'roleConsiderSocial',
  Individual: 'roleConsiderIndividual',
  Economic: 'roleConsiderEconomic',
  Technical: 'roleConsiderTechnical',
  // Sufficient knowledge: N/A
};

// Series 3: Lack knowledge/tools (Lack)
const LACK_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'lackKnowledgeEnvironmental',
  Social: 'lackKnowledgeSocial',
  Individual: 'lackKnowledgeIndividual',
  Economic: 'lackKnowledgeEconomic',
  Technical: 'lackKnowledgeTechnical',
  'Sufficient<br>knowledge': 'lackKnowledgeNone', // Special case mapping
};

const normalize = (value: string | undefined | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

export const SusAFDimensionsComparison = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      // 1. Calculate Denominators (Populations)

      // Org: Q23 = Yes
      const orgPopulation = responses.filter(
        (r) => normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
      ).length;

      // Role: Q28 = Yes
      const rolePopulation = responses.filter(
        (r) => normalize(r.raw.personIncorporatesSustainability) === 'yes'
      ).length;

      // Lack: Answered any lack question (Proxy for reached/answered this section)
      // We check if they have at least one valid answer in the Lack block
      const lackPopulation = responses.filter((r) => {
        const raw = r.raw;
        // Check "Yes" to any option
        if (Object.values(LACK_MAPPING).some((col) => normalize(raw[col]) === 'yes')) return true;

        // Check "No" to all (valid answer)
        // Note: The logic in KnowledgeGapsByDimension checks explicit 'no' for all.
        // Simplified check: if 'lackKnowledgeEnvironmental' is not empty/n/a, they likely saw the question.
        // But to be consistent with 'KnowledgeGapsByDimension', let's just count total respondents
        // if we assume it was a mandatory/general question.
        // However, to align with "Response Rate", counting explicit interactions is safer.
        // Let's use the count of people who have *some* data in these columns.
        const hasData = Object.values(LACK_MAPPING).some((col) => {
          const v = normalize(raw[col]);
          return v.length > 0 && v !== 'n/a';
        });
        return hasData;
      }).length;

      // 2. Initialize counts
      // Map<SeriesName, Map<Dimension, Count>>
      const seriesData = {
        'Development activities': new Map<DimensionLabel, number>(),
        'Role-specific tasks': new Map<DimensionLabel, number>(),
        'Lack knowledge/tools': new Map<DimensionLabel, number>(),
      };

      // Pre-fill 0
      DIMENSIONS.forEach((dim) => {
        seriesData['Development activities'].set(dim, 0);
        seriesData['Role-specific tasks'].set(dim, 0);
        seriesData['Lack knowledge/tools'].set(dim, 0);
      });

      // 3. Aggregate
      responses.forEach((r) => {
        // Series 1: Org (Only valid if Q23=Yes, strictly speaking,
        // but the data might contain artifacts. We filter by numerator logic usually,
        // but here we just count 'Yes'.
        // Note: The denominator filtered by Q23=Yes.
        // Should we only count numerators from that subset? YES, for consistency.)

        if (normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes') {
          Object.entries(ORG_MAPPING).forEach(([dim, col]) => {
            if (normalize(r.raw[col]) === 'yes') {
              const map = seriesData['Development activities'];
              map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
            }
          });
        }

        // Series 2: Role (Only valid if Q28=Yes)
        if (normalize(r.raw.personIncorporatesSustainability) === 'yes') {
          Object.entries(ROLE_MAPPING).forEach(([dim, col]) => {
            if (normalize(r.raw[col]) === 'yes') {
              const map = seriesData['Role-specific tasks'];
              map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
            }
          });
        }

        // Series 3: Lack
        // No strict pre-condition filter for counting 'Yes',
        // assuming 'lackPopulation' includes everyone who answered.
        Object.entries(LACK_MAPPING).forEach(([dim, col]) => {
          if (normalize(r.raw[col]) === 'yes') {
            const map = seriesData['Lack knowledge/tools'];
            map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
          }
        });
      });

      // Build Traces
      const xValues = [...DIMENSIONS];

      const buildTrace = (
        name: keyof typeof seriesData,
        color: string,
        denominator: number
      ): Data => {
        // Calculate Percentages
        const yValues = xValues.map((dim) => {
          const count = seriesData[name].get(dim) ?? 0;
          return denominator > 0 ? (count / denominator) * 100 : 0;
        });

        return {
          type: 'bar',
          name: name,
          x: xValues,
          y: yValues,
          marker: { color: color },
          hovertemplate: `<b>${name}</b><br>%{x}: %{y:.1f}% (N=${denominator})<extra></extra>`,
        };
      };

      const traces: Data[] = [
        buildTrace('Development activities', palette.transport, orgPopulation),
        buildTrace('Role-specific tasks', palette.spring, rolePopulation),
        buildTrace('Lack knowledge/tools', palette.mandarin, lackPopulation),
      ];

      return {
        stats: {
          numberOfResponses: responses.length, // General total
        },
        traces,
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 60 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
      },
      xaxis: {
        automargin: true,
      },
      yaxis: {
        title: { text: 'Percentage of Applicable Respondents', standoff: 20 }, // Clarified title
        range: [0, 100],
        ticksuffix: '%  ',
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
      graphId="SusAFDimensionsComparison"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
