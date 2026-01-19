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

// Helper to bucket roles
const getRoleCategory = (rawRole: string): string | null => {
  const role = normalize(rawRole);
  if (!role || role === 'n/a') return null;

  if (
    role.includes('requirements engineer') ||
    role.includes('business analyst') ||
    role.includes('product owner')
  ) {
    return 'RE';
  }
  if (
    role.includes('team lead') ||
    role.includes('project manager') ||
    role.includes('executive') ||
    role.includes('ceo') ||
    role.includes('owner') ||
    role.includes('cto')
  ) {
    return 'Management';
  }
  if (
    role.includes('devops') ||
    role.includes('developer') ||
    role.includes('software architect') ||
    role.includes('tester') ||
    role.includes('qa engineer')
  ) {
    return 'Tech';
  }
  if (role.includes('researcher') || role.includes('educator')) {
    return 'Research';
  }
  return 'Other';
};

const processAdditionalSupportByRole: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();

  // Initialize
  responses.forEach((r) => {
    const role = getRoleCategory(r.raw.role ?? '');

    if (!role) return;

    if (!groupStats.has(role)) {
      groupStats.set(role, new Map());
      groupEligibleTotals.set(role, 0);
      groupAnsweredTotals.set(role, 0);
    }

    groupEligibleTotals.set(role, (groupEligibleTotals.get(role) ?? 0) + 1);

    if (hasValidSupportAnswer(r)) {
      groupAnsweredTotals.set(role, (groupAnsweredTotals.get(role) ?? 0) + 1);
      const stats = groupStats.get(role)!;

      SUPPORT_TYPES.forEach((t) => {
        if (normalize(r.raw[t.key as keyof typeof r.raw]) === 'yes') {
          stats.set(t.label, (stats.get(t.label) ?? 0) + 1);
        }
      });
    }
  });

  // Sort by count (Highest to Lowest)
  // Plotly renders horizontal bars bottom-to-top.
  // To have the Highest at the Top, we need it at the END of the array.
  // So we sort ASCENDING by value.
  const sortedGroups = Array.from(groupAnsweredTotals.entries())
    .sort((a, b) => a[1] - b[1])
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
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      textangle: 0,
      constraintext: 'none',
      hovertemplate: `<b>${t.label}</b><br>Count: %{x}<br>Share in Role: %{customdata}<extra></extra>`,
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

export const AdditionalSupportResourcesByRole = ({ onBack }: { onBack: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 200 },
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
      graphId="AdditionalSupportResourcesByRole"
      processor={processAdditionalSupportByRole}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
