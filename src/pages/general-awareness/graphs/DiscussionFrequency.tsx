import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import {
  SurveyExploreList,
  GenericChart,
  type ChartProcessor,
} from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { DiscussionFrequencyByRole } from '../../explore-graphs/DiscussionFrequencyByRole.tsx';

type DiscussionFrequencyStat = {
  frequency: string;
  count: number;
};

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

// --- SHARED DATA LOGIC (Kept for Explore Views) ---
const useDiscussionFrequencyData = () => {
  const surveyResponses = useSurveyData();

  const frequencyStats = useMemo<DiscussionFrequencyStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const frequency = normalizeFrequency(response.raw.discussionFrequency ?? '');
      if (frequency.length > 0 && frequency.toLowerCase() !== 'n/a') {
        counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([frequency, count]) => ({ frequency, count }))
      .sort((a, b) => a.count - b.count);
  }, [surveyResponses]);

  const otherFrequencyTexts = useMemo(() => {
    return surveyResponses
      .filter((response) => {
        // 1. Get the main frequency
        const frequency = normalizeFrequency(response.raw.discussionFrequency ?? '');
        // 2. Only keep this response if the frequency is actually "other"
        // (Adjust "other" to match exactly how your normalizeFrequency outputs it)
        return frequency.toLowerCase() === 'other';
      })
      .map((response) => normalizeFrequency(response.raw.discussionFrequencyOther ?? ''))
      .filter((value) => value.length > 0);
  }, [surveyResponses]);

  return {
    frequencyStats,
    otherFrequencyTexts,
  };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const DiscussionFrequency = ({
  onExplore,
}: {
  onExplore: () => void;
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
      onExplore={onExplore}
    />
  );
};

export const DiscussionFrequencyOther = ({ onBack }: { onBack: () => void }) => {
  const { frequencyStats, otherFrequencyTexts } = useDiscussionFrequencyData();

  const { title, question, description } = useGraphDescription('DiscussionFrequencyDetails');

  // Stats Logic for "Other"
  const numberOfResponsesOther = otherFrequencyTexts.length;
  const numberOfResponsesOtherAll = useMemo(() => {
    const otherStat = frequencyStats.find((s) => s.frequency.toLowerCase().includes('other'));
    return otherStat ? otherStat.count : 0;
  }, [frequencyStats]);

  const otherResponseRate =
    numberOfResponsesOtherAll > 0 ? (numberOfResponsesOther / numberOfResponsesOtherAll) * 100 : 0;

  if (otherFrequencyTexts.length === 0) {
    return null;
  }

  return (
    <SurveyExploreList
      title={title}
      items={otherFrequencyTexts}
      question={question}
      description={description}
      numberOfResponses={numberOfResponsesOther}
      responseRate={otherResponseRate}
      onBack={onBack}
    />
  );
};

export const DiscussionFrequencyDetails = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-12">
      <DiscussionFrequencyOther onBack={onBack} />
      <DiscussionFrequencyByRole onBack={onBack} />
    </div>
  );
};
