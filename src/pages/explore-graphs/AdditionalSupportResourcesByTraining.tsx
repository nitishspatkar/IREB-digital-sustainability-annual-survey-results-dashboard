import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants ---
const SUPPORT_TYPES = [
  { key: 'supportNeedTheoretical', label: 'Theoretical Knowledge' },
  { key: 'supportNeedTutorials', label: 'Tutorials' },
  { key: 'supportNeedCurricula', label: 'Curricula' },
  { key: 'supportNeedPractical', label: 'Practical Knowledge' },
  { key: 'supportNeedCaseStudies', label: 'Positive Case Studies' },
  { key: 'supportNeedStructures', label: 'Structures' },
  { key: 'supportNeedTools', label: 'Tools' },
  { key: 'supportNeedNone', label: 'None' },
];

const normalize = (value: string) => value?.trim().toLowerCase() ?? '';

const hasValidSupportAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (SUPPORT_TYPES.some((t) => norm(raw[t.key as keyof typeof raw]) === 'yes')) return true;

  const allNo = SUPPORT_TYPES.every((t) => norm(raw[t.key as keyof typeof raw]) === 'no');
  if (allNo) return true;

  const oVal = norm(raw.supportNeedOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return false;
};

// --- Comparison Strategy & Data Extractor ---

const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
  sortBy: 'absoluteDifference',
});

const comparisonStrategy: typeof baseComparisonStrategy = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  const result = baseComparisonStrategy(
    currentYearData,
    compareYearData,
    currentYear,
    compareYear,
    palette
  );

  if (result && 'layout' in result && result.layout) {
    result.layout.yaxis = {
      ...result.layout.yaxis,
      dtick: 1,
    };
    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);
    result.layout.height = dynamicHeight;
  }

  return result;
};

const extractAdditionalSupportResourcesByTrainingData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const statsMap = new Map<string, Map<string, number>>();
  const totalsMap = new Map<string, number>();
  const categories = ['With training', 'Without training'];

  categories.forEach((cat) => {
    statsMap.set(cat, new Map());
    totalsMap.set(cat, 0);
  });

  // Parse Data
  responses.forEach((r) => {
    const trainingAnswer = normalize(r.raw.participatedInTraining);
    if (trainingAnswer !== 'yes' && trainingAnswer !== 'no') return;
    if (!hasValidSupportAnswer(r)) return;

    const category = trainingAnswer === 'yes' ? 'With training' : 'Without training';

    // Increment Group Total (Denominator)
    totalsMap.set(category, (totalsMap.get(category) ?? 0) + 1);

    const catStats = statsMap.get(category)!;

    SUPPORT_TYPES.forEach((t) => {
      const val = normalize(r.raw[t.key as keyof typeof r.raw]);
      if (val === 'yes') {
        catStats.set(t.label, (catStats.get(t.label) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  statsMap.forEach((stats, category) => {
    const totalInGroup = totalsMap.get(category) ?? 0;
    stats.forEach((count, label) => {
      // Percentage relative to GROUP total
      const pct = totalInGroup > 0 ? (count / totalInGroup) * 100 : 0;
      items.push({
        label: `${category}<br>${label}`,
        value: pct,
      });
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: Array.from(totalsMap.values()).reduce((a, b) => a + b, 0),
    },
  };
};

// --- The Processor Logic ---
const processAdditionalSupportByTraining: ChartProcessor = (responses, palette) => {
  let trainedCount = 0;
  let untrainedCount = 0;

  const trainedStats = new Map<string, number>();
  const untrainedStats = new Map<string, number>();

  SUPPORT_TYPES.forEach((t) => {
    trainedStats.set(t.label, 0);
    untrainedStats.set(t.label, 0);
  });

  responses.forEach((r) => {
    const trainingAnswer = normalize(r.raw.participatedInTraining);
    // Filter out those who didn't answer the training question
    if (trainingAnswer !== 'yes' && trainingAnswer !== 'no') return;

    // Filter out those who didn't answer the support question
    if (!hasValidSupportAnswer(r)) return;

    const isTrained = trainingAnswer === 'yes';

    if (isTrained) trainedCount++;
    else untrainedCount++;

    SUPPORT_TYPES.forEach((t) => {
      const val = normalize(r.raw[t.key as keyof typeof r.raw]);
      if (val === 'yes') {
        if (isTrained) {
          trainedStats.set(t.label, (trainedStats.get(t.label) ?? 0) + 1);
        } else {
          untrainedStats.set(t.label, (untrainedStats.get(t.label) ?? 0) + 1);
        }
      }
    });
  });

  // Reverse labels for top-to-bottom display
  const plotYLabels = [...SUPPORT_TYPES.map((t) => t.label)].reverse();

  const getPercentage = (count: number, total: number) => (total > 0 ? (count / total) * 100 : 0);

  const trainedYValues = plotYLabels.map((label) =>
    getPercentage(trainedStats.get(label) ?? 0, trainedCount)
  );
  const untrainedYValues = plotYLabels.map((label) =>
    getPercentage(untrainedStats.get(label) ?? 0, untrainedCount)
  );

  const traces: Data[] = [
    {
      type: 'bar',
      name: 'Without training (%)',
      orientation: 'h',
      y: plotYLabels,
      x: untrainedYValues,
      marker: { color: palette.mandarin },
      text: untrainedYValues.map((v) => v.toFixed(1) + '%'),
      textposition: 'none',
      hoverinfo: 'y+text',
    },
    {
      type: 'bar',
      name: 'With training (%)',
      orientation: 'h',
      y: plotYLabels,
      x: trainedYValues,
      marker: { color: palette.spring },
      text: trainedYValues.map((v) => v.toFixed(1) + '%'),
      textposition: 'none',
      hoverinfo: 'y+text',
    },
  ];

  return {
    stats: {
      numberOfResponses: trainedCount + untrainedCount,
    },
    traces,
  };
};

export const AdditionalSupportResourcesByTraining = ({ onBack }: { onBack: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 250 },
      xaxis: {
        title: { text: "Percentage of 'Yes' responses" },
        automargin: true,
        ticksuffix: '%',
      },
      yaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 15,
        tickcolor: 'rgba(0,0,0,0)',
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'reversed',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="AdditionalSupportResourcesByTraining"
      processor={processAdditionalSupportByTraining}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
      dataExtractor={extractAdditionalSupportResourcesByTrainingData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
