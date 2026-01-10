import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { TrainingSatisfactionByOrgType } from '../../explore-graphs/TrainingSatisfactionByOrgType.tsx';
import { OrganizationDepartmentCoordinationByOrgType } from '../../explore-graphs/OrganizationDepartmentCoordinationByOrgType.tsx';
import { OrganizationHasGoalsByOrgType } from '../../explore-graphs/OrganizationHasGoalsByOrgType.tsx';
import { OrganizationHasSustainabilityTeamByOrgType } from '../../explore-graphs/OrganizationHasSustainabilityTeamByOrgType.tsx';
import { OrganizationIncorporatesPracticesByOrgType } from '../../explore-graphs/OrganizationIncorporatesPracticesByOrgType.tsx';
import { OrganizationOffersTrainingByOrgType } from '../../explore-graphs/OrganizationOffersTrainingByOrgType.tsx';
import { OrganizationReportsOnSustainabilityByOrgType } from '../../explore-graphs/OrganizationReportsOnSustainabilityByOrgType.tsx';

// Helper function to normalize organization type strings
const normalizeOrganizationType = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- DATA EXTRACTOR ---
const organizationTypeDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const orgType = normalizeOrganizationType(response.raw.organizationType ?? '');
    if (orgType.length > 0 && orgType.toLowerCase() !== 'n/a') {
      counts.set(orgType, (counts.get(orgType) ?? 0) + 1);
    }
  });

  const items = Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return {
    items,
    stats: {
      numberOfResponses: total,
    },
  };
};

// 1. The Logic (Pure Function)
// It receives data and colors. It returns Traces and Stats.
const processData: ChartProcessor = (responses, palette) => {
  const data = organizationTypeDataExtractor(responses);

  // Sort ascending by count so highest bar is at the top
  const sorted = [...data.items].sort((a, b) => a.value - b.value);

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: sorted.map((item) => item.value),
        y: sorted.map((item) => item.label),
        marker: { color: palette.berry },
        text: sorted.map((item) => item.value.toString()),
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
    stats: data.stats,
  };
};

// 2. The Component
const DemographicOrganizationType = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicOrganizationType"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 40, l: 200 },
        xaxis: { title: { text: 'Number of Respondents' } },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
      exploreComponents={[
        TrainingSatisfactionByOrgType,
        OrganizationDepartmentCoordinationByOrgType,
        OrganizationHasGoalsByOrgType,
        OrganizationHasSustainabilityTeamByOrgType,
        OrganizationIncorporatesPracticesByOrgType,
        OrganizationOffersTrainingByOrgType,
        OrganizationReportsOnSustainabilityByOrgType,
      ]}
      onExplore={onExplore}
      dataExtractor={organizationTypeDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default DemographicOrganizationType;
