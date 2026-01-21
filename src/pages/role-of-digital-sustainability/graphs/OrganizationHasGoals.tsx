import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { OrganizationHasGoalsByAge } from '../../explore-graphs/OrganizationHasGoalsByAge.tsx';
import { OrganizationHasGoalsByRole } from '../../explore-graphs/OrganizationHasGoalsByRole.tsx';
import { OrganizationHasGoalsByOrgType } from '../../explore-graphs/OrganizationHasGoalsByOrgType.tsx';
import { PersonIncorporatesSustainabilityByOrgGoals } from '../../explore-graphs/PersonIncorporatesSustainabilityByOrgGoals.tsx';
import OrganizationMeasures from '../../explore-graphs/OrganizationMeasures.tsx';
import { dumbbellComparisonStrategy } from '../../../components/comparision-components/DumbbellComparisonStrategy';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Data Extractor: Extracts Yes/No/Not Sure counts for dumbbell plot
const dataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  let yesCount = 0;
  let noCount = 0;
  let notSureCount = 0;

  responses.forEach((r) => {
    const raw = normalize(r.raw.organizationHasDigitalSustainabilityGoals ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      yesCount++;
    } else if (lower === 'no') {
      noCount++;
    } else if (lower === 'not sure') {
      notSureCount++;
    }
  });

  const total = yesCount + noCount + notSureCount;

  return {
    items: [
      { label: 'Yes', value: yesCount },
      { label: 'No', value: noCount },
      { label: 'Not sure', value: notSureCount },
    ],
    stats: {
      numberOfResponses: total,
    },
  };
};

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const data = dataExtractor(responses);
  // Reconstruct values from items
  const yesCount = data.items.find((i) => i.label === 'Yes')?.value ?? 0;
  const noCount = data.items.find((i) => i.label === 'No')?.value ?? 0;
  const notSureCount = data.items.find((i) => i.label === 'Not sure')?.value ?? 0;

  const labels = ['Yes', 'No', 'Not sure'];
  const values = [yesCount, noCount, notSureCount];

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => {
            if (label === 'Yes') return palette.spring;
            if (label === 'No') return palette.mandarin;
            return palette.grey02;
          }),
        },
        text: values.map((v) => v.toString()),
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

// The Component
const OrganizationHasGoals = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="OrganizationHasGoals"
      processor={processData}
      layout={{
        margin: { t: 50, r: 20, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
      exploreComponents={[
        OrganizationMeasures,
        OrganizationHasGoalsByAge,
        OrganizationHasGoalsByRole,
        OrganizationHasGoalsByOrgType,
        PersonIncorporatesSustainabilityByOrgGoals,
      ]}
      onExplore={onExplore}
      dataExtractor={dataExtractor}
      comparisonStrategy={dumbbellComparisonStrategy}
    />
  );
};

export default OrganizationHasGoals;
