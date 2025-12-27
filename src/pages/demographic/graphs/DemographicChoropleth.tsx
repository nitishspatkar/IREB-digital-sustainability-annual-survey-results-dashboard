import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import GraphWrapper from '../../../components/GraphWrapper';
import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import type { RespondentStat } from '../demographicTypes';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

type DemographicChoroplethProps = {
  respondentStats: RespondentStat[];
};

const DemographicChoropleth = ({ respondentStats }: DemographicChoroplethProps) => {
  const landColor = useThemeColor('--color-lavender-50');
  const coastlineColor = useThemeColor('--color-ireb-grey-01');
  const lakeColor = useThemeColor('--color-lavender-100');
  const markerLineColor = useThemeColor('--color-lavender-100');
  const surveyResponses = useSurveyData();
  const choroplethData = useMemo<Data[]>(
    () => [
      {
        type: 'choropleth',
        locationmode: 'country names',
        locations: respondentStats.map((item) => item.country),
        z: respondentStats.map((item) => item.count),
        text: respondentStats.map((item) => `${item.country}: ${item.count} respondents`),
        hovertemplate: '%{text}<extra></extra>',
        colorscale: [
          [0.0, '#0c2c84'],
          [0.2, '#225ea8'],
          [0.4, '#1d91c0'],
          [0.6, '#41b6c4'],
          [0.8, '#7fcdbb'],
          [1.0, '#c7e9b4'],
        ],
        marker: {
          line: {
            width: 0.5,
            color: markerLineColor,
          },
        },
        colorbar: {
          title: {
            text: 'Respondents',
          },
        },
      },
    ],
    [respondentStats, markerLineColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      geo: {
        scope: 'world',
        projection: {
          type: 'natural earth',
        },
        showcoastlines: true,
        coastlinecolor: coastlineColor,
        landcolor: landColor,
        bgcolor: 'rgba(0,0,0,0)',
        lakecolor: lakeColor,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: 40, r: 0, l: 0, b: 0 },
    }),
    [landColor, coastlineColor, lakeColor]
  );

  const numberOfResponses = respondentStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = surveyResponses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const { question, description } = useGraphDescription('DemographicChoropleth');

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={choroplethData}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </GraphWrapper>
  );
};

export default DemographicChoropleth;
