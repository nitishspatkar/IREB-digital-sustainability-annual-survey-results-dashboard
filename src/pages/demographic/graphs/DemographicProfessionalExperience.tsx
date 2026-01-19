import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { DiscussionFrequencyByExperience } from '../../explore-graphs/DiscussionFrequencyByExperience.tsx';
import { DefinitionAwarenessByExperience } from '../../explore-graphs/DefinitionAwarenessByExperience.tsx';
import { TrainingReasonsNoByExperience } from '../../explore-graphs/TrainingReasonsNoByExperience.tsx';
import { TrainingReasonsNotMoreByExperience } from '../../explore-graphs/TrainingReasonsNotMoreByExperience.tsx';
import { TrainingSatisfactionByExperience } from '../../explore-graphs/TrainingSatisfactionByExperience.tsx';
import { SustainabilityDimensionsByExperience } from '../../explore-graphs/SustainabilityDimensionsByExperience';
import { PersonIncorporatesSustainabilityByExperience } from '../../explore-graphs/PersonIncorporatesSustainabilityByExperience.tsx';
import { HindrancesToIncorporateSustainabilityByExperience } from '../../explore-graphs/HindrancesToIncorporateSustainabilityByExperience.tsx';
import { KnowledgeGapsByDimensionByExperience } from '../../explore-graphs/KnowledgeGapsByDimensionByExperience.tsx';
import { createScatterPlotComparisonStrategy } from '../../../components/comparision-components/ScatterPlotComparisonStrategy';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

// Helper to sort experience ranges naturally
const sortExperience = (a: string, b: string) => {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);

  if (a.startsWith('Less than')) return -1;
  if (b.startsWith('Less than')) return 1;
  if (a.startsWith('More than')) return 1;
  if (b.startsWith('More than')) return -1;
  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }

  return a.localeCompare(b);
};

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const experience = response.raw.professionalExperienceYears ?? '';
    if (experience.length > 0 && experience.toLowerCase() !== 'n/a') {
      counts.set(experience, (counts.get(experience) ?? 0) + 1);
    }
  });

  const sorted = Array.from(counts.entries())
    .map(([experience, count]) => ({ experience, count }))
    .sort((a, b) => sortExperience(a.experience, b.experience));

  const total = sorted.reduce((sum, stat) => sum + stat.count, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: sorted.map((item) => item.experience),
        y: sorted.map((item) => item.count),
        marker: { color: palette.berry },
        text: sorted.map((item) => item.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: palette.grey,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: {
      numberOfResponses: total,
    },
  };
};

const professionalExperienceDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const experience = response.raw.professionalExperienceYears ?? '';
    if (experience.length > 0 && experience.toLowerCase() !== 'n/a') {
      counts.set(experience, (counts.get(experience) ?? 0) + 1);
    }
  });

  const sorted = Array.from(counts.entries())
    .map(([experience, count]) => ({ label: experience, value: count }))
    .sort((a, b) => sortExperience(a.label, b.label));

  return {
    items: sorted,
    stats: {
      numberOfResponses: sorted.reduce((sum, item) => sum + item.value, 0),
    },
  };
};

const scatterPlotComparisonStrategy = createScatterPlotComparisonStrategy();

// The Component
export const DemographicProfessionalExperience = ({
  onExplore,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  return (
    <GenericChart
      graphId="DemographicProfessionalExperience"
      processor={processData}
      dataExtractor={professionalExperienceDataExtractor}
      comparisonStrategy={scatterPlotComparisonStrategy}
      layout={{
        margin: { t: 50, r: 40, b: 60, l: 60 },
        xaxis: {
          automargin: true,
          title: { text: 'Years of Experience' },
        },
        yaxis: {
          title: { text: 'Number of Respondents' },
        },
      }}
      exploreComponents={[
        DefinitionAwarenessByExperience,
        DiscussionFrequencyByExperience,
        TrainingReasonsNoByExperience,
        TrainingReasonsNotMoreByExperience,
        TrainingSatisfactionByExperience,
        SustainabilityDimensionsByExperience,
        PersonIncorporatesSustainabilityByExperience,
        HindrancesToIncorporateSustainabilityByExperience,
        KnowledgeGapsByDimensionByExperience,
      ]}
      onExplore={onExplore}
    />
  );
};
