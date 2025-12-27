import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/SurveyContext';
import type { AgeGroupStat } from '../demographicTypes';
import useThemeColor from '../../../hooks/useThemeColor';
import GraphWrapper from '../../../components/GraphWrapper';

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, ' ').trim();

const DemographicAgeGroup = () => {
  const chartBarColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const surveyResponses = useSurveyData();

  const ageGroupStats = useMemo<AgeGroupStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? '');
      if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
        counts.set(ageGroup, (counts.get(ageGroup) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const question = 'Which age group do you belong to?';
  const description =
    'This chart shows the distribution of survey respondents across different age groups. The data helps us understand the demographic composition of the survey participants and identify which age groups are most represented in the responses.';
  const numberOfResponses = ageGroupStats.reduce((sum, stat) => sum + stat.count, 0);
  const responseRate =
    surveyResponses.length > 0 ? (numberOfResponses / surveyResponses.length) * 100 : 0;

  const chartData = useMemo<Data[]>(() => {
    const sortedStats = [...ageGroupStats].sort((a, b) => {
      const aMatch = a.ageGroup.match(/^(\d+)/);
      const bMatch = b.ageGroup.match(/^(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }

      return a.ageGroup.localeCompare(b.ageGroup);
    });

    return [
      {
        x: sortedStats.map((item) => item.ageGroup),
        y: sortedStats.map((item) => item.count),
        type: 'bar',
        marker: {
          color: chartBarColor,
        },
        // --- ADDED TEXT LABELS ---
        text: sortedStats.map((item) => item.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        // --- END OF CHANGES ---
        hoverinfo: 'none',
      },
    ];
  }, [ageGroupStats, chartBarColor, tickColor]); // Added tickColor

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 40 }, // Adjusted top/bottom margins
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        // --- REMOVED tickangle: -45 ---
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
      },
      yaxis: {
        // --- ADDED Y-AXIS TITLE ---
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
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </GraphWrapper>
  );
};

export default DemographicAgeGroup;
