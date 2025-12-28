import { useCallback, useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import type { SurveyResponse } from '../../../data/data-parsing-logic/SurveyResponse';
import type { AgeGroupStat } from '../demographicTypes';
import useThemeColor from '../../../hooks/useThemeColor';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { useChartComparison } from '../../../hooks/useChartComparison';
import { SurveyChart } from '../../../components/GraphViews';

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, ' ').trim();

const DemographicAgeGroup = () => {
  const chartBarColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const surveyResponses = useSurveyData();

  // 1. Define the data processing logic (Pure function)
  const processData = useCallback((responses: readonly SurveyResponse[]) => {
    const counts = new Map<string, number>();

    responses.forEach((response) => {
      const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? '');
      if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
        counts.set(ageGroup, (counts.get(ageGroup) ?? 0) + 1);
      }
    });

    const stats = Array.from(counts.entries())
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .sort((a, b) => b.count - a.count);

    // Sort logic specific to Age Groups
    return stats.sort((a, b) => {
      const aMatch = a.ageGroup.match(/^(\d+)/);
      const bMatch = b.ageGroup.match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }
      return a.ageGroup.localeCompare(b.ageGroup);
    });
  }, []);

  // 2. Define trace creation logic
  const createTrace = useCallback(
    (stats: AgeGroupStat[], year: string, color: string) => {
      return {
        x: stats.map((item) => item.ageGroup),
        y: stats.map((item) => item.count),
        type: 'bar',
        name: year,
        marker: {
          color: color,
        },
        text: stats.map((item) => item.count.toString()),
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
    [tickColor]
  );

  // 3. Define base layout
  const baseLayout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 40 },
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

  // 4. Use the hook
  const { data, layout, wrapperProps, activeStats } = useChartComparison({
    processData,
    createTrace,
    baseLayout,
    primaryColor: chartBarColor,
  });

  // Calculate stats for the active view (for the info box)
  const numberOfResponses = activeStats
    ? activeStats.reduce((sum, stat) => sum + stat.count, 0)
    : 0;
  const responseRate =
    surveyResponses.length > 0 ? (numberOfResponses / surveyResponses.length) * 100 : 0;

  const { question, description } = useGraphDescription('DemographicAgeGroup');

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

export default DemographicAgeGroup;
