import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- Constants & Helpers ---
const DIMENSIONS_TEMPLATE = [
  { key: 'lackKnowledgeEnvironmental', label: 'Environmental' },
  { key: 'lackKnowledgeSocial', label: 'Social' },
  { key: 'lackKnowledgeIndividual', label: 'Individual' },
  { key: 'lackKnowledgeEconomic', label: 'Economic' },
  { key: 'lackKnowledgeTechnical', label: 'Technical' },
  { key: 'lackKnowledgeNone', label: 'Sufficient resources' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const hasValidDimensionAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.lackKnowledgeEnvironmental) === 'yes') return true;
  if (norm(raw.lackKnowledgeSocial) === 'yes') return true;
  if (norm(raw.lackKnowledgeIndividual) === 'yes') return true;
  if (norm(raw.lackKnowledgeEconomic) === 'yes') return true;
  if (norm(raw.lackKnowledgeTechnical) === 'yes') return true;
  if (norm(raw.lackKnowledgeNone) === 'yes') return true;

  // Also count as valid if all are explicitly 'no' (matching main graph logic)
  if (
    norm(raw.lackKnowledgeEnvironmental) === 'no' &&
    norm(raw.lackKnowledgeSocial) === 'no' &&
    norm(raw.lackKnowledgeIndividual) === 'no' &&
    norm(raw.lackKnowledgeEconomic) === 'no' &&
    norm(raw.lackKnowledgeTechnical) === 'no' &&
    norm(raw.lackKnowledgeNone) === 'no'
  ) {
    return true;
  }

  const oVal = norm(raw.lackKnowledgeOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return false;
};

// --- The Processor Logic ---
const processKnowledgeGapsByDimensionByExperience: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    let exp = normalize(r.raw.professionalExperienceYears ?? '');
    // Normalize experience labels (remove " years")
    exp = exp.replace(' years', '').trim();

    if (!exp || exp.toLowerCase() === 'n/a' || exp === '') {
      return;
    }

    if (!groupStats.has(exp)) {
      groupStats.set(exp, new Map());
      groupEligibleTotals.set(exp, 0);
      groupAnsweredTotals.set(exp, 0);
    }

    // Eligible
    groupEligibleTotals.set(exp, (groupEligibleTotals.get(exp) ?? 0) + 1);

    // Answered
    if (hasValidDimensionAnswer(r)) {
      groupAnsweredTotals.set(exp, (groupAnsweredTotals.get(exp) ?? 0) + 1);
      const stats = groupStats.get(exp)!;

      DIMENSIONS_TEMPLATE.forEach((dimDef) => {
        const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
        if (isSelected) {
          stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
        }
      });
    }
  });

  // 2. Sort Groups (Lowest to Highest, which Plotly renders as Bottom to Top)
  const sortedGroups = Array.from(groupEligibleTotals.keys()).sort((a, b) => {
    const aLabel = a;
    const bLabel = b;
    const aMatch = aLabel.match(/^(\d+)/);
    const bMatch = bLabel.match(/^(\d+)/);

    if (aLabel.startsWith('Less than')) return -1;
    if (bLabel.startsWith('Less than')) return 1;
    if (aLabel.startsWith('More than')) return 1;
    if (bLabel.startsWith('More than')) return -1;
    if (aMatch && bMatch) return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    return aLabel.localeCompare(bLabel);
  });

  const totalEligible = Array.from(groupEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(groupAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const dimColors: Record<string, string> = {
    Environmental: palette.spring,
    Social: palette.mandarin,
    Individual: palette.berry,
    Economic: palette.transport,
    Technical: palette.grey02,
    'Sufficient resources': palette.grey,
  };

  // 4. Build Traces
  const traces: Data[] = DIMENSIONS_TEMPLATE.map((dimDef) => {
    const label = dimDef.label;
    const xValues = sortedGroups.map((g) => groupStats.get(g)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedGroups,
      x: xValues,
      marker: {
        color: dimColors[label] || palette.grey,
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      hoverinfo: 'x+y+name',
    };
  });

  return {
    stats: {
      numberOfResponses: totalAnswered,
      totalEligible: totalEligible,
    },
    traces: traces,
  };
};

// --- The Component ---
export const KnowledgeGapsByDimensionByExperience = ({
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
      margin: { t: 40, r: 20, b: 60, l: 150 },
      uniformtext: { mode: 'show', minsize: 10 },
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
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="KnowledgeGapsByDimensionByExperience"
      processor={processKnowledgeGapsByDimensionByExperience}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
