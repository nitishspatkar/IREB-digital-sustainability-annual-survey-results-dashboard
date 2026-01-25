import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

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

const ROLES = [
  'Requirements Engineer / Business Analyst / Product Owner',
  'Software Architect',
  'Software Developer',
  'Project Manager / Team Lead',
  'Tester / QA',
  'Consultant',
  'Researcher / Educator',
  'Student',
  'Other',
];

const getRoleGroup = (raw: SurveyRecord): string | null => {
  const role = raw.role;
  if (!role || role === 'n/a') return null;
  const r = role.toLowerCase();

  if (r.includes('requirements') || r.includes('analyst') || r.includes('product owner'))
    return 'Requirements Engineer / Business Analyst / Product Owner';
  if (r.includes('architect')) return 'Software Architect';
  if (r.includes('developer') || r.includes('engineer') || r.includes('programmer'))
    return 'Software Developer';
  if (
    r.includes('manager') ||
    r.includes('lead') ||
    r.includes('head') ||
    r.includes('scrum master')
  )
    return 'Project Manager / Team Lead';
  if (r.includes('test') || r.includes('qa') || r.includes('quality')) return 'Tester / QA';
  if (r.includes('consultant')) return 'Consultant';
  if (
    r.includes('research') ||
    r.includes('educator') ||
    r.includes('academic') ||
    r.includes('professor') ||
    r.includes('teacher')
  )
    return 'Researcher / Educator';
  if (r.includes('student')) return 'Student';

  return 'Other';
};

const normalize = (value: string | undefined | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

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

const extractHindrancesToIncorporateSustainabilityByRoleData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();
  let totalValidResponses = 0;

  ROLES.forEach((role) => {
    const map = new Map<string, number>();
    HINDRANCES.forEach((h) => map.set(h.label, 0));
    roleStats.set(role, map);
    roleTotals.set(role, 0);
  });

  // 1. Filter: Q28 = No
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'no'
  );

  totalValidResponses = filteredResponses.length;

  filteredResponses.forEach((r) => {
    const role = getRoleGroup(r.raw);
    if (!role || !roleStats.has(role)) return;

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
    const stats = roleStats.get(role)!;

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

  const items: { label: string; value: number }[] = [];

  roleStats.forEach((stats, role) => {
    // Only include roles that have respondents
    if ((roleTotals.get(role) ?? 0) > 0) {
      stats.forEach((count, hindranceLabel) => {
        // Calculate percentage relative to TOTAL valid responses (subset Q28=No)
        const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
        items.push({
          label: `${role}<br>${hindranceLabel}`,
          value: pct,
        });
      });
    }
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

// --- Processor (Single Year) ---

const processData: ChartProcessor = (responses, palette) => {
  // 1. Filter: Q28 = No
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'no'
  );

  // 2. Initialize Data
  // Map<Role, Map<HindranceLabel, Count>>
  const roleStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>(); // Count of people in role (denominator)

  ROLES.forEach((role) => {
    const map = new Map<string, number>();
    HINDRANCES.forEach((h) => map.set(h.label, 0));
    roleStats.set(role, map);
    roleTotals.set(role, 0);
  });

  // 3. Aggregate
  filteredResponses.forEach((r) => {
    const role = getRoleGroup(r.raw);
    if (!role || !roleStats.has(role)) return;

    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
    const stats = roleStats.get(role)!;

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

  // 4. Build Traces
  // Y-axis = Hindrances
  // Stacks (Traces) = Roles

  const activeRoles = ROLES.filter((r) => (roleTotals.get(r) ?? 0) > 0);
  // Sort roles by total respondents to keep legend organized?
  activeRoles.sort((a, b) => (roleTotals.get(a) ?? 0) - (roleTotals.get(b) ?? 0));

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

  const traces: Data[] = activeRoles.map((role, idx) => {
    const xValues = HINDRANCES.map((h) => roleStats.get(role)?.get(h.label) ?? 0);
    const yValues = HINDRANCES.map((h) => h.label);

    return {
      type: 'bar',
      name: role,
      orientation: 'h',
      y: yValues, // Hindrances on Y
      x: xValues, // Counts on X
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

export const HindrancesToIncorporateSustainabilityByRole = ({
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
      margin: { t: 140, r: 20, b: 60, l: 300 }, // Large top margin for legend, left for text
      uniformtext: { mode: 'show', minsize: 13 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
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
      graphId="HindrancesToIncorporateSustainabilityByRole"
      processor={processData}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractHindrancesToIncorporateSustainabilityByRoleData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
