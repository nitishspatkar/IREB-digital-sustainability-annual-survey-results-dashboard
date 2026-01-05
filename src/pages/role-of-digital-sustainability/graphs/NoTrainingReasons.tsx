import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import { NoTrainingReasonsOther } from '../../explore-graphs/NoTrainingReasonsOther';

const processChartData: ChartProcessor = (responses, palette) => {
  const counts: Record<string, number> = {
    'Lack of awareness': 0,
    'Lack of understanding': 0,
    'No demand from employees': 0,
    'Limited budget/resources': 0,
    'Not a priority': 0,
    'Not sure': 0,
    Other: 0,
  };

  let totalResponses = 0;

  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((response) => {
    const raw = response.raw;
    let hasSelection = false;

    if (normalize(raw.orgNoTrainingLackAwareness) === 'yes') {
      counts['Lack of awareness']++;
      hasSelection = true;
    }
    if (normalize(raw.orgNoTrainingLackUnderstanding) === 'yes') {
      counts['Lack of understanding']++;
      hasSelection = true;
    }
    if (normalize(raw.orgNoTrainingNoDemand) === 'yes') {
      counts['No demand from employees']++;
      hasSelection = true;
    }
    if (normalize(raw.orgNoTrainingLimitedBudget) === 'yes') {
      counts['Limited budget/resources']++;
      hasSelection = true;
    }
    if (normalize(raw.orgNoTrainingNotPriority) === 'yes') {
      counts['Not a priority']++;
      hasSelection = true;
    }
    if (normalize(raw.orgNoTrainingNotSure) === 'yes') {
      counts['Not sure']++;
      hasSelection = true;
    }

    const otherVal = normalize(raw.orgNoTrainingOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      counts['Other']++;
      hasSelection = true;
    }

    if (hasSelection) {
      totalResponses++;
    }
  });

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  // Sort by value ascending
  const items = labels.map((label, i) => ({ label, value: values[i] }));
  items.sort((a, b) => a.value - b.value);

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: items.map((i) => i.value),
        y: items.map((i) => i.label),
        marker: { color: palette.berry },
        text: items.map((i) => i.value.toString()),
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
      numberOfResponses: totalResponses,
    },
  };
};

export const NoTrainingReasons = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="NoTrainingReasons"
      processor={processChartData}
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
      exploreComponents={[NoTrainingReasonsOther]}
      onExplore={onExplore}
    />
  );
};
