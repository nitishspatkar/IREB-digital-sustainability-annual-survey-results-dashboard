import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import { DiscussionFrequencyByRole } from '../../explore-graphs/DiscussionFrequencyByRole.tsx';
import { DiscussionFrequencyOther } from '../../explore-graphs/DiscussionFrequencyOther';
import { DiscussionFrequencyByAge } from '../../explore-graphs/DiscussionFrequencyByAge.tsx';
import { DiscussionFrequencyByExperience } from '../../explore-graphs/DiscussionFrequencyByExperience.tsx';

const normalizeFrequency = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- PROCESSOR FOR GENERIC CHART ---
const discussionFrequencyProcessor: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const frequency = normalizeFrequency(response.raw.discussionFrequency ?? '');
    if (frequency.length > 0 && frequency.toLowerCase() !== 'n/a') {
      counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
    }
  });

  const frequencyStats = Array.from(counts.entries())
    .map(([frequency, count]) => ({ frequency, count }))
    .sort((a, b) => a.count - b.count);

  const numberOfResponses = frequencyStats.reduce((sum, stat) => sum + stat.count, 0);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: frequencyStats.map((item) => item.count),
      y: frequencyStats.map((item) => item.frequency),
      marker: {
        color: palette.berry,
      },
      text: frequencyStats.map((item) => item.count.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'none',
    },
  ];

  return {
    traces,
    stats: {
      numberOfResponses,
    },
  };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const DiscussionFrequency = ({
  onExplore,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 240 }, // specific margins preserved
    }),
    []
  );

  return (
    <GenericChart
      graphId="DiscussionFrequency"
      processor={discussionFrequencyProcessor}
      layout={layout}
      exploreComponents={[
        DiscussionFrequencyOther,
        DiscussionFrequencyByRole,
        DiscussionFrequencyByAge,
        DiscussionFrequencyByExperience,
      ]}
      onExplore={onExplore}
    />
  );
};
