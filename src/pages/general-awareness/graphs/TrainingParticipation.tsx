import { useCallback, useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { SurveyChart } from '../../../components/GraphViews';
import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import type { SurveyResponse } from '../../../data/data-parsing-logic/SurveyResponse';
import useThemeColor from '../../../hooks/useThemeColor';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { useChartComparison } from '../../../hooks/useChartComparison';

type ParticipationStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const TrainingParticipation = () => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');

  const tickColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  // 1. Process Data
  const processData = useCallback((surveyResponses: readonly SurveyResponse[]) => {
    const counts = new Map<string, number>();
    counts.set('Yes', 0);
    counts.set('No', 0);

    surveyResponses.forEach((r) => {
      const raw = normalize(r.raw.participatedInTraining ?? '');
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
  }, []);

  // 2. Create Trace
  const createTrace = useCallback(
    (stats: ParticipationStat[], year: string, color: string, isPrimary: boolean) => {
      return {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: 'bar',
        name: year,
        // For primary year, we use specific colors for Yes/No. For comparison, we use single color.
        marker: {
          color: isPrimary ? stats.map((s) => (s.label === 'Yes' ? yesColor : noColor)) : color,
        },
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'y+name',
      } as Data;
    },
    [yesColor, noColor, tickColor]
  );

  // 3. Base Layout
  const baseLayout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 60, l: 48 },
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
    [tickColor]
  );

  // 4. Use Hook
  const { data, layout, wrapperProps, activeStats } = useChartComparison({
    processData,
    createTrace,
    baseLayout,
    primaryColor: '#000', // Dummy, overridden in createTrace
  });

  const numberOfResponses = activeStats
    ? activeStats.reduce((sum, stat) => sum + stat.count, 0)
    : 0;
  const totalResponses = responses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const { question: graphQuestion, description } = useGraphDescription('TrainingParticipation');
  const question = graphQuestion;

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
      data={data}
      layout={layout}
      hasExploreData={false}
      {...wrapperProps}
    />
  );
};

export default TrainingParticipation;
