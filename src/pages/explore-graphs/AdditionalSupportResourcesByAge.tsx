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

const AGE_ORDER = ['18-28', '29-39', '40-50', '51-60', '60+'];

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

const extractAdditionalSupportResourcesByAgeData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupAnsweredTotals = new Map<string, number>();
  let totalValidResponses = 0; // Total count of respondents who answered (Global Denominator)

  // 1. Calculate Global Denominator
  responses.forEach((r) => {
    if (hasValidSupportAnswer(r)) {
      totalValidResponses++;
    }
  });

  // 2. Parse Data
  responses.forEach((r) => {
    if (!hasValidSupportAnswer(r)) return;

    let age = normalize(r.raw.ageGroup ?? '');
    age = age.replace(' years', '').trim();

    if (!age || age === 'n/a' || age === '') return;

    if (!groupStats.has(age)) {
      groupStats.set(age, new Map());
      groupAnsweredTotals.set(age, 0);
    }

    groupAnsweredTotals.set(age, (groupAnsweredTotals.get(age) ?? 0) + 1);
    const stats = groupStats.get(age)!;

    SUPPORT_TYPES.forEach((t) => {
      if (normalize(r.raw[t.key as keyof typeof r.raw]) === 'yes') {
        stats.set(t.label, (stats.get(t.label) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  groupStats.forEach((stats, age) => {
    stats.forEach((count, label) => {
      // Percentage relative to TOTAL valid responses (Global Denominator)
      const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
      items.push({
        label: `${age}<br>${label}`,
        value: pct,
      });
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

// --- The Processor Logic ---
const processAdditionalSupportByAge: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();
  let totalValidResponses = 0; // Global denominator

  // 1. Calculate Global Denominator
  responses.forEach((r) => {
    if (hasValidSupportAnswer(r)) {
      totalValidResponses++;
    }
  });

  // 2. Initialize & Parse
  responses.forEach((r) => {
    let age = normalize(r.raw.ageGroup ?? '');
    age = age.replace(' years', '').trim();

    if (!age || age === 'n/a' || age === '') return;

    if (!groupStats.has(age)) {
      groupStats.set(age, new Map());
      groupEligibleTotals.set(age, 0);
      groupAnsweredTotals.set(age, 0);
    }

    groupEligibleTotals.set(age, (groupEligibleTotals.get(age) ?? 0) + 1);

    if (hasValidSupportAnswer(r)) {
      groupAnsweredTotals.set(age, (groupAnsweredTotals.get(age) ?? 0) + 1);
      const stats = groupStats.get(age)!;

      SUPPORT_TYPES.forEach((t) => {
        if (normalize(r.raw[t.key as keyof typeof r.raw]) === 'yes') {
          stats.set(t.label, (stats.get(t.label) ?? 0) + 1);
        }
      });
    }
  });

  // Sort groups.
  const sortedGroups = Array.from(groupEligibleTotals.keys())
    .sort((a, b) => {
      const idxA = AGE_ORDER.indexOf(a);
      const idxB = AGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA === -1) return 1;
      return -1;
    })
    .reverse(); // Reverse to have youngest at top

  const totalAnswered = Array.from(groupAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // Colors for 8 categories
  const colors = [
    palette.berry,
    palette.lightBerry,
    palette.grey02,
    palette.mandarin,
    palette.transport,
    palette.spring,
    palette.lightSpring,
    palette.grey,
  ];

  const traces: Data[] = SUPPORT_TYPES.map((t, index) => {
    const values = sortedGroups.map((g) => groupStats.get(g)?.get(t.label) ?? 0);

    // Calculate percentages relative to TOTAL valid responses (Global Denominator)
    const percentages = values.map((val) =>
      totalValidResponses > 0 ? ((val / totalValidResponses) * 100).toFixed(1) + '%' : '0%'
    );

    return {
      type: 'bar',
      name: t.label,
      orientation: 'h',
      y: sortedGroups, // Categories on Y
      x: values, // Counts on X
      marker: { color: colors[index % colors.length] },
      text: values.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      textangle: 0,
      constraintext: 'none',
      hovertemplate: `<b>${t.label}</b><br>Count: %{y}<br>Share of Total: %{customdata}<extra></extra>`,
      customdata: percentages,
    };
  });

  return {
    stats: {
      numberOfResponses: totalAnswered,
    },
    traces,
  };
};

export const AdditionalSupportResourcesByAge = ({ onBack }: { onBack: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 100 }, // Increased left margin for Age Labels
      xaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      yaxis: {
        // title: { text: 'Age Group' }, // Optional, clear enough from labels
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="AdditionalSupportResourcesByAge"
      processor={processAdditionalSupportByAge}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
      dataExtractor={extractAdditionalSupportResourcesByAgeData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
