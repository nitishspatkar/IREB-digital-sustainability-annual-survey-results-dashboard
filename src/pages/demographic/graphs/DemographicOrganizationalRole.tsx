import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { DemographicOrganizationalRoleOther } from '../../explore-graphs/DemographicOrganizationalRoleOther';
import { DefinitionAwarenessByRole } from '../../explore-graphs/DefinitionAwarenessByRole.tsx';
import { DiscussionFrequencyByRole } from '../../explore-graphs/DiscussionFrequencyByRole.tsx';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { TrainingParticipationByRole } from '../../explore-graphs/TrainingParticipationByRole.tsx';
import { TrainingPrivateCapacityByRole } from '../../explore-graphs/TrainingPrivateCapacityByRole.tsx';
import { TrainingProgramsCountByRole } from '../../explore-graphs/TrainingProgramsCountByRole.tsx';
import { TrainingReasonsNoByRole } from '../../explore-graphs/TrainingReasonsNoByRole.tsx';
import { TrainingSatisfactionByRole } from '../../explore-graphs/TrainingSatisfactionByRole.tsx';
import { OrganizationDepartmentCoordinationByRole } from '../../explore-graphs/OrganizationDepartmentCoordinationByRole.tsx';
import { OrganizationHasGoalsByRole } from '../../explore-graphs/OrganizationHasGoalsByRole.tsx';
import { OrganizationHasSustainabilityTeamByRole } from '../../explore-graphs/OrganizationHasSustainabilityTeamByRole.tsx';
import { OrganizationIncorporatesPracticesByRole } from '../../explore-graphs/OrganizationIncorporatesPracticesByRole.tsx';
import { OrganizationOffersTrainingByRole } from '../../explore-graphs/OrganizationOffersTrainingByRole.tsx';
import { OrganizationReportsOnSustainabilityByRole } from '../../explore-graphs/OrganizationReportsOnSustainabilityByRole.tsx';
import { PersonIncorporatesSustainabilityByRole } from '../../explore-graphs/PersonIncorporatesSustainabilityByRole.tsx';
import { HindrancesToIncorporateSustainabilityByRole } from '../../explore-graphs/HindrancesToIncorporateSustainabilityByRole.tsx';
import { SustainabilityDimensionsInTasksByRole } from '../../explore-graphs/SustainabilityDimensionsInTasksByRole.tsx';
import { UsesToolsByRole } from '../../explore-graphs/UsesToolsByRole.tsx';

const normalizeRole = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- DATA EXTRACTOR ---
const organizationalRoleDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const role = normalizeRole(response.raw.role ?? '');
    if (role.length > 0 && role.toLowerCase() !== 'n/a') {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  });

  const items = Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  const numberOfResponses = items.reduce((sum, item) => sum + item.value, 0);

  return {
    items,
    stats: {
      numberOfResponses,
    },
  };
};

const processData: ChartProcessor = (responses, palette) => {
  const data = organizationalRoleDataExtractor(responses);

  // Sort ascending by count
  const roleStats = [...data.items]
    .map(({ label, value }) => ({ role: label, count: value }))
    .sort((a, b) => a.count - b.count);

  return {
    traces: [
      {
        x: roleStats.map((item) => item.count),
        y: roleStats.map((item) => item.role),
        type: 'bar',
        orientation: 'h',
        marker: { color: palette.berry },
        text: roleStats.map((item) => item.count.toString()),
        textposition: 'outside',
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: data.stats,
  };
};

export const DemographicOrganizationalRole = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicOrganizationalRole"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 40, l: 200 },
        xaxis: {
          title: {
            text: 'Number of Respondents',
          },
        },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
      exploreComponents={[
        DemographicOrganizationalRoleOther,
        DefinitionAwarenessByRole,
        DiscussionFrequencyByRole,
        TrainingParticipationByRole,
        TrainingPrivateCapacityByRole,
        TrainingProgramsCountByRole,
        TrainingReasonsNoByRole,
        TrainingSatisfactionByRole,
        OrganizationDepartmentCoordinationByRole,
        OrganizationHasGoalsByRole,
        OrganizationHasSustainabilityTeamByRole,
        OrganizationIncorporatesPracticesByRole,
        OrganizationOffersTrainingByRole,
        OrganizationReportsOnSustainabilityByRole,
        PersonIncorporatesSustainabilityByRole,
        HindrancesToIncorporateSustainabilityByRole,
        SustainabilityDimensionsInTasksByRole,
        UsesToolsByRole,
      ]}
      onExplore={onExplore}
      dataExtractor={organizationalRoleDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default DemographicOrganizationalRole;
