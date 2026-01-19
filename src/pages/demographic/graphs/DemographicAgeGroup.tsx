import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { scatterPlotComparisonStrategy } from '../../../components/comparision-components/ScatterPlotComparisonStrategy';
import { DiscussionFrequencyByAge } from '../../explore-graphs/DiscussionFrequencyByAge.tsx';
import { DefinitionAwarenessByAge } from '../../explore-graphs/DefinitionAwarenessByAge.tsx';
import { PersonIncorporatesSustainabilityByAge } from '../../explore-graphs/PersonIncorporatesSustainabilityByAge.tsx';
import { TrainingReasonsNoByAge } from '../../explore-graphs/TrainingReasonsNoByAge.tsx';
import { TrainingReasonsNotMoreByAge } from '../../explore-graphs/TrainingReasonsNotMoreByAge.tsx';
import { TrainingSatisfactionByAge } from '../../explore-graphs/TrainingSatisfactionByAge.tsx';
import { OrganizationDepartmentCoordinationByAge } from '../../explore-graphs/OrganizationDepartmentCoordinationByAge.tsx';
import { OrganizationHasGoalsByAge } from '../../explore-graphs/OrganizationHasGoalsByAge.tsx';
import { OrganizationHasSustainabilityTeamByAge } from '../../explore-graphs/OrganizationHasSustainabilityTeamByAge.tsx';
import { OrganizationIncorporatesPracticesByAge } from '../../explore-graphs/OrganizationIncorporatesPracticesByAge.tsx';
import { OrganizationOffersTrainingByAge } from '../../explore-graphs/OrganizationOffersTrainingByAge.tsx';
import { OrganizationReportsOnSustainabilityByAge } from '../../explore-graphs/OrganizationReportsOnSustainabilityByAge.tsx';
import { SustainabilityDimensionsByAge } from '../../explore-graphs/SustainabilityDimensionsByAge.tsx';
import { HindrancesToIncorporateSustainabilityByAge } from '../../explore-graphs/HindrancesToIncorporateSustainabilityByAge.tsx';
import { KnowledgeGapsByDimensionByAge } from '../../explore-graphs/KnowledgeGapsByDimensionByAge.tsx';
import { AdditionalSupportResourcesByAge } from '../../explore-graphs/AdditionalSupportResourcesByAge.tsx';

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, ' ').trim();

const ageGroupDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? '');
    if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
      counts.set(ageGroup, (counts.get(ageGroup) ?? 0) + 1);
    }
  });

  const ageGroupStats = Array.from(counts.entries())
    .map(([ageGroup, count]) => ({ ageGroup, count }))
    .sort((a, b) => {
      const aMatch = a.ageGroup.match(/^(\d+)/);
      const bMatch = b.ageGroup.match(/^(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }

      return a.ageGroup.localeCompare(b.ageGroup);
    });

  const numberOfResponses = ageGroupStats.reduce((sum, stat) => sum + stat.count, 0);

  return {
    items: ageGroupStats.map((stat) => ({
      label: stat.ageGroup,
      value: stat.count,
    })),
    stats: {
      numberOfResponses,
      totalEligible: responses.length,
    },
  };
};

const DemographicAgeGroup = ({ onExplore }: { onExplore?: () => void; className?: string }) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const data = ageGroupDataExtractor(responses);

      const traces: Data[] = [
        {
          x: data.items.map((item) => item.label),
          y: data.items.map((item) => item.value),
          type: 'bar',
          marker: {
            color: palette.berry,
          },
          text: data.items.map((item) => item.value.toString()),
          textposition: 'outside',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: palette.grey,
          },
          cliponaxis: false,
          hoverinfo: 'none',
        },
      ];

      return {
        traces,
        stats: data.stats,
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 40 },
      yaxis: {
        title: {
          text: 'Number of Respondents',
        },
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="DemographicAgeGroup"
      processor={processor}
      layout={layout}
      dataExtractor={ageGroupDataExtractor}
      comparisonStrategy={scatterPlotComparisonStrategy}
      exploreComponents={[
        DefinitionAwarenessByAge,
        DiscussionFrequencyByAge,
        PersonIncorporatesSustainabilityByAge,
        TrainingReasonsNoByAge,
        TrainingSatisfactionByAge,
        TrainingReasonsNotMoreByAge,
        OrganizationDepartmentCoordinationByAge,
        OrganizationHasGoalsByAge,
        OrganizationHasSustainabilityTeamByAge,
        OrganizationIncorporatesPracticesByAge,
        OrganizationOffersTrainingByAge,
        OrganizationReportsOnSustainabilityByAge,
        SustainabilityDimensionsByAge,
        HindrancesToIncorporateSustainabilityByAge,
        KnowledgeGapsByDimensionByAge,
        AdditionalSupportResourcesByAge,
      ]}
      onExplore={onExplore}
    />
  );
};

export default DemographicAgeGroup;
