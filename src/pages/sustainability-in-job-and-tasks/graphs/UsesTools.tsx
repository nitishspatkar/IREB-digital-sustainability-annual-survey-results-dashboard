import { useMemo } from 'react';
import type { Layout } from 'plotly.js';
import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { UsesToolsByRole } from '../../explore-graphs/UsesToolsByRole';
import { UsesToolsByOrgType } from '../../explore-graphs/UsesToolsByOrgType';
import {
  yesNoNotSureComparisonStrategy,
  type YesNoNotSureData,
} from '../../../components/comparision-components/YesNoNotSureComparisonStrategy';

// --- DATA EXTRACTOR ---

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const usesToolsDataExtractor: DataExtractor<YesNoNotSureData> = (responses) => {
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase() === 'yes'
  );

  let yesCount = 0;
  let noCount = 0;
  let notSureCount = 0;

  filteredResponses.forEach((r) => {
    const raw = normalize(r.raw.usesTools ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      yesCount++;
    } else if (lower === 'no') {
      noCount++;
    } else if (lower === 'not sure') {
      notSureCount++;
    }
  });

  const total = yesCount + noCount + notSureCount;

  return {
    counts: {
      yes: yesCount,
      no: noCount,
      notSure: notSureCount,
    },
    stats: {
      numberOfResponses: total,
      totalEligible: filteredResponses.length,
    },
  };
};

// The Logic (Pure Function)
// Precondition: Q28 = Yes (personIncorporatesSustainability)
const usesToolsProcessor: ChartProcessor = (responses, palette) => {
  const data = usesToolsDataExtractor(responses);

  const labels = ['Yes', 'No', 'Not sure'];
  const values = [data.counts.yes, data.counts.no, data.counts.notSure];

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => {
            if (label === 'Yes') return palette.spring;
            if (label === 'No') return palette.mandarin;
            return palette.grey02;
          }),
        },
        text: values.map((v) => v.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: palette.grey,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: data.stats,
  };
};

// The Component
const UsesTools = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 40, r: 40, b: 40, l: 40 },
      yaxis: {
        title: {
          text: 'Number of Respondents',
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      xaxis: {
        automargin: true,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="UsesTools"
      processor={usesToolsProcessor}
      layout={layout}
      exploreComponents={[UsesToolsByRole, UsesToolsByOrgType]}
      onExplore={onExplore}
      dataExtractor={usesToolsDataExtractor}
      comparisonStrategy={yesNoNotSureComparisonStrategy}
    />
  );
};

export default UsesTools;
