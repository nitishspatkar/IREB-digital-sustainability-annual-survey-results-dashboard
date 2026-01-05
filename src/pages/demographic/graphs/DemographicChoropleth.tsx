import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import useThemeColor from '../../../hooks/useThemeColor';
import type { RespondentStat } from '../demographicTypes';

type DemographicChoroplethProps = {
  respondentStats: RespondentStat[];
};

const DemographicChoropleth = ({ respondentStats }: DemographicChoroplethProps) => {
  const landColor = useThemeColor('--color-lavender-50');
  const coastlineColor = useThemeColor('--color-ireb-grey-01');
  const lakeColor = useThemeColor('--color-lavender-100');
  const markerLineColor = useThemeColor('--color-lavender-100');

  const processor: ChartProcessor = useMemo(
    () => () => {
      const numberOfResponses = respondentStats.reduce((sum, stat) => sum + stat.count, 0);

      const traces: Data[] = [
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
      ];

      return {
        traces,
        stats: {
          numberOfResponses,
        },
      };
    },
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
      margin: { t: 40, r: 0, l: 0, b: 0 },
    }),
    [landColor, coastlineColor, lakeColor]
  );

  return <GenericChart graphId="DemographicChoropleth" processor={processor} layout={layout} />;
};

export default DemographicChoropleth;
