import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { SurveyChart } from '../../../components/GraphViews.tsx';
import { DefinitionAwarenessByRole } from '../../explore-graphs/DefinitionAwarenessByRole.tsx';
import { DefinitionAwarenessByExperience } from '../../explore-graphs/DefinitionAwarenessByExperience.tsx';
import { DefinitionAwarenessByAge } from '../../explore-graphs/DefinitionAwarenessByAge.tsx';

type AwarenessStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export const DefinitionAwareness = ({
  onExplore,
  className,
}: {
  onExplore: () => void;
  className?: string;
}) => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const titleColor = useThemeColor('--color-ireb-grey-01');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const stats = useMemo<AwarenessStat[]>(() => {
    const counts = new Map<string, number>();
    counts.set('Yes', 0);
    counts.set('No', 0);

    responses.forEach((r) => {
      const raw = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '');
      const lower = raw.toLowerCase();

      if (lower === 'yes') {
        counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
      } else if (lower === 'no') {
        counts.set('No', (counts.get('No') ?? 0) + 1);
      }
    });

    return [
      { label: 'Yes', count: counts.get('Yes') ?? 0 },
      { label: 'No', count: counts.get('No') ?? 0 },
    ];
  }, [responses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: 'bar',
        marker: {
          color: stats.map((s) => (s.label === 'Yes' ? yesColor : noColor)),
        },
        // --- CHANGES START HERE ---
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        // --- CHANGES END HERE ---
        hoverinfo: 'none',
      },
    ];
  }, [stats, yesColor, noColor, tickColor]); // Added tickColor

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 60, l: 48 }, // t: 60 is already good
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
      },
      yaxis: {
        title: {
          text: 'Number of Respondents',
          font: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: tickColor,
          },
        },
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
      },
    }),
    [titleColor, tickColor]
  );

  const numberOfResponses = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = responses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const { question: graphQuestion, description } = useGraphDescription('DefinitionAwareness');
  const question = graphQuestion;

  return (
    <SurveyChart
      className={className}
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={true}
      onExplore={onExplore}
    />
  );
};

export const DefinitionAwarenessDetails = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-12">
      <DefinitionAwarenessByRole onBack={onBack} />
      <DefinitionAwarenessByAge onBack={onBack} />
      <DefinitionAwarenessByExperience onBack={onBack} />
    </div>
  );
};
