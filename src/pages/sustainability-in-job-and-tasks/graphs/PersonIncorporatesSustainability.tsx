import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { PersonIncorporatesSustainabilityByAge } from '../../explore-graphs/PersonIncorporatesSustainabilityByAge';
import { PersonIncorporatesSustainabilityByRole } from '../../explore-graphs/PersonIncorporatesSustainabilityByRole';
import { PersonIncorporatesSustainabilityByOrgGoals } from '../../explore-graphs/PersonIncorporatesSustainabilityByOrgGoals';
import { PersonIncorporatesSustainabilityByExperience } from '../../explore-graphs/PersonIncorporatesSustainabilityByExperience';
import { PersonIncorporatesSustainabilityByMeasureCount } from '../../explore-graphs/PersonIncorporatesSustainabilityByMeasureCount';
import { dumbbellComparisonStrategy } from '../../../components/comparision-components/DumbbellComparisonStrategy';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();
  counts.set('Yes', 0);
  counts.set('No', 0);

  responses.forEach((r) => {
    const raw = normalize(r.raw.personIncorporatesSustainability ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
    } else if (lower === 'no') {
      counts.set('No', (counts.get('No') ?? 0) + 1);
    }
  });

  const labels = ['Yes', 'No'];
  const values = labels.map((label) => counts.get(label) ?? 0);
  const total = values.reduce((a, b) => a + b, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => (label === 'Yes' ? palette.spring : palette.mandarin)),
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
    stats: {
      numberOfResponses: total,
    },
  };
};

const personIncorporatesSustainabilityDataExtractor: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const counts = new Map<string, number>();
  counts.set('Yes', 0);
  counts.set('No', 0);

  responses.forEach((r) => {
    const raw = normalize(r.raw.personIncorporatesSustainability ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
    } else if (lower === 'no') {
      counts.set('No', (counts.get('No') ?? 0) + 1);
    }
  });

  const labels = ['Yes', 'No'];
  const items = labels.map((label) => ({
    label,
    value: counts.get(label) ?? 0,
  }));

  return {
    items,
    stats: {
      numberOfResponses: items.reduce((sum, item) => sum + item.value, 0),
    },
  };
};

// The Component
const PersonIncorporatesSustainability = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="PersonIncorporatesSustainability"
      processor={processData}
      dataExtractor={personIncorporatesSustainabilityDataExtractor}
      comparisonStrategy={dumbbellComparisonStrategy}
      layout={{
        margin: { t: 50, r: 20, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
      exploreComponents={[
        PersonIncorporatesSustainabilityByAge,
        PersonIncorporatesSustainabilityByRole,
        PersonIncorporatesSustainabilityByOrgGoals,
        PersonIncorporatesSustainabilityByExperience,
        PersonIncorporatesSustainabilityByMeasureCount,
      ]}
      onExplore={onExplore}
    />
  );
};

export default PersonIncorporatesSustainability;
