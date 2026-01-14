import { useMemo } from 'react';
import type { Layout } from 'plotly.js';
import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { UsesToolsByRole } from '../../explore-graphs/UsesToolsByRole';
import { UsesToolsByOrgType } from '../../explore-graphs/UsesToolsByOrgType';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- DATA EXTRACTOR ---

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const usesToolsDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();
  // Initialize to ensure order/presence
  counts.set('Yes', 0);
  counts.set('No', 0);
  counts.set('Not sure', 0);

  let numberOfResponses = 0;

  responses.forEach((r) => {
    // Precondition: Q28 = Yes
    if (normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase() !== 'yes') return;

    const raw = normalize(r.raw.usesTools ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes' || lower === 'no' || lower === 'not sure') {
      let label = 'Not sure';
      if (lower === 'yes') label = 'Yes';
      if (lower === 'no') label = 'No';

      counts.set(label, (counts.get(label) ?? 0) + 1);
      numberOfResponses++;
    }
  });

  const items = Array.from(counts.entries()).map(([label, value]) => ({ label, value }));

  return {
    items,
    stats: {
      numberOfResponses,
    },
  };
};

// The Logic (Pure Function)
// Precondition: Q28 = Yes (personIncorporatesSustainability)
const usesToolsProcessor: ChartProcessor = (responses, palette) => {
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase() === 'yes'
  );

  const counts = new Map<string, number>();
  counts.set('Yes', 0);
  counts.set('No', 0);
  counts.set('Not sure', 0);

  filteredResponses.forEach((r) => {
    const raw = normalize(r.raw.usesTools ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
    } else if (lower === 'no') {
      counts.set('No', (counts.get('No') ?? 0) + 1);
    } else if (lower === 'not sure') {
      counts.set('Not sure', (counts.get('Not sure') ?? 0) + 1);
    }
  });

  const labels = ['Yes', 'No', 'Not sure'];
  const values = labels.map((label) => counts.get(label) ?? 0);
  const total = values.reduce((a, b) => a + b, 0);

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
    stats: {
      numberOfResponses: total,
      totalEligible: filteredResponses.length,
    },
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
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default UsesTools;
