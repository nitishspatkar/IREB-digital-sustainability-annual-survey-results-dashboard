import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import GraphWrapper from '../../../components/GraphWrapper';
import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

export function DemographicProfessionalExperience() {
  const surveyResponses = useSurveyData();
  const chartBarColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const experienceStats = useMemo(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const experience = response.raw.professionalExperienceYears ?? '';
      if (experience.length > 0 && experience.toLowerCase() !== 'n/a') {
        counts.set(experience, (counts.get(experience) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([experience, count]) => ({ experience, count }))
      .sort((a, b) => {
        const aMatch = a.experience.match(/^(\d+)/);
        const bMatch = b.experience.match(/^(\d+)/);

        if (a.experience.startsWith('Less than')) return -1;
        if (b.experience.startsWith('Less than')) return 1;
        if (a.experience.startsWith('More than')) return 1;
        if (b.experience.startsWith('More than')) return -1;
        if (aMatch && bMatch) {
          return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
        }

        return a.experience.localeCompare(b.experience);
      });
  }, [surveyResponses]);

  const numberOfResponses = experienceStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = surveyResponses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const data: Data[] = useMemo(
    () => [
      {
        x: experienceStats.map((item) => item.experience),
        y: experienceStats.map((item) => item.count),
        type: 'bar',
        marker: {
          color: chartBarColor,
        },
        text: experienceStats.map((item) => item.count.toString()),
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
    [experienceStats, chartBarColor, tickColor]
  );

  const layout: Partial<Layout> = useMemo(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 60 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        automargin: true,
        title: {
          text: 'Years of Experience',
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

  const { question, description } = useGraphDescription('DemographicProfessionalExperience');

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={data}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </GraphWrapper>
  );
}
