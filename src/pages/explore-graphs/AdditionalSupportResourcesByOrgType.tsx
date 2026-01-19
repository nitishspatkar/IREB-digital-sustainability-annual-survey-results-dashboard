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

const normalize = (value: string) => value?.replace(/\s+/g, ' ').trim() ?? '';

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

const processAdditionalSupportByOrgType: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();

  // Initialize
  responses.forEach((r) => {
    const orgType = normalize(r.raw.organizationType ?? '');

    if (!orgType || orgType.toLowerCase() === 'n/a' || orgType === '') return;

    if (!groupStats.has(orgType)) {
      groupStats.set(orgType, new Map());
      groupEligibleTotals.set(orgType, 0);
      groupAnsweredTotals.set(orgType, 0);
    }

    groupEligibleTotals.set(orgType, (groupEligibleTotals.get(orgType) ?? 0) + 1);

    if (hasValidSupportAnswer(r)) {
      groupAnsweredTotals.set(orgType, (groupAnsweredTotals.get(orgType) ?? 0) + 1);
      const stats = groupStats.get(orgType)!;

      SUPPORT_TYPES.forEach((t) => {
        if (normalize(r.raw[t.key as keyof typeof r.raw]).toLowerCase() === 'yes') {
          stats.set(t.label, (stats.get(t.label) ?? 0) + 1);
        }
      });
    }
  });

  // Sort by count (descending)
  const sortedGroups = Array.from(groupEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1]) // Ascending for horizontal bar chart
    .map((entry) => entry[0]);

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
    const xValues = sortedGroups.map((g) => groupStats.get(g)?.get(t.label) ?? 0);

    // Calculate percentages for tooltip
    const totalInGroup = sortedGroups.map((g) => groupAnsweredTotals.get(g) ?? 0);
    const percentages = xValues.map((val, i) =>
      totalInGroup[i] > 0 ? ((val / totalInGroup[i]) * 100).toFixed(1) + '%' : '0%'
    );

    return {
      type: 'bar',
      name: t.label,
      orientation: 'h',
      y: sortedGroups,
      x: xValues,
      marker: { color: colors[index % colors.length] },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'none',
      hovertemplate: `<b>${t.label}</b><br>Count: %{x}<br>Share in Org Type: %{customdata}<extra></extra>`,
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

export const AdditionalSupportResourcesByOrgType = ({ onBack }: { onBack: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 0, r: 20, b: 60, l: 300 },
      xaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      yaxis: {
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
      graphId="AdditionalSupportResourcesByOrgType"
      processor={processAdditionalSupportByOrgType}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
