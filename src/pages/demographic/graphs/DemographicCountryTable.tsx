import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import type { RespondentStat } from '../demographicTypes';

type DemographicCountryTableProps = {
  respondentStats: RespondentStat[];
};

const DemographicCountryTable = ({ respondentStats }: DemographicCountryTableProps) => {
  const processor: ChartProcessor = useMemo(
    () => (_responses, palette) => {
      const numberOfResponses = respondentStats.reduce((sum, stat) => sum + stat.count, 0);

      const traces = [
        {
          type: 'table',
          columnwidth: [250, 100],
          header: {
            values: ['Country', 'Respondents'],
            align: ['left', 'right'],
            fill: {
              color: palette.lightBerry,
            },
            font: {
              family: 'PP Mori, sans-serif',
              size: 14,
              color: palette.grey,
              weight: 600,
            },
            line: {
              color: 'rgba(148, 163, 184, 0.4)',
              width: 1,
            },
          },
          cells: {
            values: [
              respondentStats.map((item) => item.country),
              respondentStats.map((item) => item.count),
            ],
            align: ['left', 'right'],
            fill: {
              color: palette.superLightBerry,
            },
            font: {
              family: 'PP Mori, sans-serif',
              size: 13,
              color: palette.grey,
            },
            line: {
              color: 'rgba(148, 163, 184, 0.2)',
              width: 1,
            },
            height: 28,
          },
          hoverinfo: 'skip',
        },
      ] as unknown as Data[];

      return {
        traces,
        stats: {
          numberOfResponses,
        },
      };
    },
    [respondentStats]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 0, l: 0 },
    }),
    []
  );

  return <GenericChart graphId="DemographicCountryTable" processor={processor} layout={layout} />;
};

export default DemographicCountryTable;
