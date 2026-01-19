import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

const HINDRANCES = [
  { key: 'hindranceLackInterest', label: 'Lack of personal interest' },
  { key: 'hindranceLackKnowledge', label: 'Lack of knowledge or awareness' },
  { key: 'hindranceLimitedResources', label: 'Limited resources or budget' },
  { key: 'hindranceFinancialConstraints', label: 'Financial constraints' },
  { key: 'hindranceInsufficientTime', label: 'Insufficient time or competing priorities' },
  { key: 'hindranceLackSupport', label: 'Lack of organizational or leadership support' },
  { key: 'hindranceComplexity', label: 'Complexity or uncertainty of solutions' },
  { key: 'hindranceCulturalBarriers', label: 'Cultural or social barriers' },
  { key: 'hindranceStakeholderResistance', label: 'Resistance from stakeholders' },
  { key: 'hindranceOther', label: 'Other' },
] as const;

const AGE_GROUPS = ['18 - 28', '29 - 44', '45 - 60', 'Above 60'];

const normalize = (value: string | undefined | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

const getAgeGroup = (raw: SurveyRecord) => {
  const age = (raw.ageGroup ?? '').trim(); // Don't normalize completely to preserve case matching with AGE_GROUPS if needed, but here we check strictly.
  // Actually the raw data usually matches the labels exactly or needs simple trim.
  // Let's use exact match or normalized check.
  const normAge = normalize(age);
  if (normAge === '18 - 28') return '18 - 28';
  if (normAge === '29 - 44') return '29 - 44';
  if (normAge === '45 - 60') return '45 - 60';
  if (normAge === 'above 60') return 'Above 60';
  return null;
};

const processData: ChartProcessor = (responses, palette) => {
  // 1. Filter: Q28 = No
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'no'
  );

  // 2. Initialize Data
  const statsMap = new Map<string, Map<string, number>>();
  const groupTotals = new Map<string, number>();

  AGE_GROUPS.forEach((g) => {
    const map = new Map<string, number>();
    HINDRANCES.forEach((h) => map.set(h.label, 0));
    statsMap.set(g, map);
    groupTotals.set(g, 0);
  });

  // 3. Aggregate
  filteredResponses.forEach((r) => {
    const group = getAgeGroup(r.raw);
    if (!group || !statsMap.has(group)) return;

    groupTotals.set(group, (groupTotals.get(group) ?? 0) + 1);
    const stats = statsMap.get(group)!;

    HINDRANCES.forEach((h) => {
      let isSelected = false;
      if (h.key === 'hindranceOther') {
        const val = normalize(r.raw.hindranceOther);
        isSelected = val === 'yes' || (val.length > 0 && val !== 'n/a');
      } else {
        isSelected = normalize(r.raw[h.key as keyof SurveyRecord]) === 'yes';
      }

      if (isSelected) {
        stats.set(h.label, (stats.get(h.label) ?? 0) + 1);
      }
    });
  });

  const activeGroups = AGE_GROUPS.filter((g) => (groupTotals.get(g) ?? 0) > 0);
  // Sort age groups naturally (they are already sorted in array, so just keep them?)
  // Usually age groups should remain in chronological order.

  const colors = [
    palette.berry,
    palette.spring,
    palette.mandarin,
    palette.transport,
    palette.night,
    palette.lightBerry,
    palette.darkSpring,
    palette.grey,
    palette.superLightBerry,
    palette.grey02,
  ];

  const traces: Data[] = activeGroups.map((group, idx) => {
    const xValues = HINDRANCES.map((h) => statsMap.get(group)?.get(h.label) ?? 0);
    const yValues = HINDRANCES.map((h) => h.label);

    return {
      type: 'bar',
      name: group,
      orientation: 'h',
      y: yValues, // Hindrances
      x: xValues, // Counts
      marker: { color: colors[idx % colors.length] },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      hoverinfo: 'x+name',
    };
  });

  return {
    stats: {
      numberOfResponses: filteredResponses.length,
      totalEligible: filteredResponses.length,
    },
    traces,
  };
};

export const HindrancesToIncorporateSustainabilityByAge = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 140, r: 20, b: 60, l: 300 },
      uniformtext: { mode: 'show', minsize: 13 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
      },
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
    }),
    []
  );

  return (
    <GenericChart
      graphId="HindrancesToIncorporateSustainabilityByAge"
      processor={processData}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
