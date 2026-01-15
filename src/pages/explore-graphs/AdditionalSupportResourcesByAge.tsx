import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

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

const processAdditionalSupportByAge: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();

  // Initialize
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
  // For horizontal bar charts, Plotly renders the first item at the bottom.
  // We want the youngest ('18-28') at the TOP usually, or at the bottom if following x-axis logic.
  // Let's reverse the standard order so '18-28' (index 0 in AGE_ORDER) is last in the array, thus rendered at the top.
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
    palette.superLightBerry,
    palette.mandarin,
    palette.transport,
    palette.spring,
    palette.lightSpring,
    palette.grey,
  ];

  const traces: Data[] = SUPPORT_TYPES.map((t, index) => {
    const values = sortedGroups.map((g) => groupStats.get(g)?.get(t.label) ?? 0);

    // Calculate percentages for tooltip
    const totalInGroup = sortedGroups.map((g) => groupAnsweredTotals.get(g) ?? 0);
    const percentages = values.map((val, i) =>
      totalInGroup[i] > 0 ? ((val / totalInGroup[i]) * 100).toFixed(1) + '%' : '0%'
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
      hovertemplate: `<b>${t.label}</b><br>Count: %{y}<br>Share in Age Group: %{customdata}<extra></extra>`,
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
    />
  );
};
