import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import GraphWrapper from '../../../components/GraphWrapper';
import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';

interface OrganizationTypeStat {
  organizationType: string;
  count: number;
}

const normalizeOrganizationType = (value: string) => value.replace(/\s+/g, ' ').trim();

const DemographicOrganizationType = () => {
  const chartBarColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const surveyResponses = useSurveyData();

  const organizationTypeStats = useMemo<OrganizationTypeStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const orgType = normalizeOrganizationType(response.raw.organizationType ?? '');
      if (orgType.length > 0 && orgType.toLowerCase() !== 'n/a') {
        counts.set(orgType, (counts.get(orgType) ?? 0) + 1);
      }
    });

    // Sort ascending by count so highest bar is at the top
    return Array.from(counts.entries())
      .map(([organizationType, count]) => ({ organizationType, count }))
      .sort((a, b) => a.count - b.count);
  }, [surveyResponses]);

  const numberOfResponses = organizationTypeStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = surveyResponses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const chartData = useMemo<Data[]>(
    () => [
      {
        x: organizationTypeStats.map((item) => item.count),
        y: organizationTypeStats.map((item) => item.organizationType),
        type: 'bar',
        orientation: 'h',
        marker: {
          color: chartBarColor,
        },
        text: organizationTypeStats.map((item) => item.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    [organizationTypeStats, chartBarColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 40, l: 200 }, // Adjusted top/right margins
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        title: {
          text: 'Number of Respondents',
          font: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: tickColor,
          },
        },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const question = 'Which of the following organizational types best describes your organization? ';
  const description =
    'Visualizes how respondents classify their organizations across the provided types.';

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

export default DemographicOrganizationType;
