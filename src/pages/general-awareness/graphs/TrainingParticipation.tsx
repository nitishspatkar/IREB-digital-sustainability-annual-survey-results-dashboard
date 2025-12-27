import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import GraphWrapper from '../../../components/GraphWrapper';
import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { columnDefinitions } from '../../../data/SurveyColumnDefinitions';

type ParticipationStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const TrainingParticipation = () => {
  const questionHeader = columnDefinitions.find((c) => c.key === 'participatedInTraining')?.header;
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');

  const titleColor = useThemeColor('--color-ireb-grey-01');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const stats = useMemo<ParticipationStat[]>(() => {
    const counts = new Map<string, number>();
    counts.set('Yes', 0);
    counts.set('No', 0);

    responses.forEach((r) => {
      // Data key for Q10
      const raw = normalize(r.raw.participatedInTraining ?? '');
      const lower = raw.toLowerCase();

      if (lower === 'yes') {
        counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
      } else if (lower === 'no') {
        counts.set('No', (counts.get('No') ?? 0) + 1);
      }
      // Other values (empty, "n/a", etc.) are ignored
    });

    // Return in a fixed order for the bar chart
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
        // Add text labels on top of bars
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ];
  }, [stats, yesColor, noColor, tickColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 60, l: 48 }, // Increased top margin for labels
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

  const question = questionHeader ?? 'Have you participated in training on digital sustainability?';
  const description =
    'Shows whether respondents have participated in digital sustainability training programs.';

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={chartData}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </GraphWrapper>
  );
};

export default TrainingParticipation;
