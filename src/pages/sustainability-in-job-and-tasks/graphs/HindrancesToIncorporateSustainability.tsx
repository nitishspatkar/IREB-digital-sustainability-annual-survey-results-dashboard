import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import { HindrancesToIncorporateSustainabilityOther } from '../../explore-graphs/HindrancesToIncorporateSustainabilityOther';

// --- PROCESSOR ---
const hindrancesProcessor: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  let lackInterest = 0;
  let lackKnowledge = 0;
  let limitedResources = 0;
  let financialConstraints = 0;
  let insufficientTime = 0;
  let lackSupport = 0;
  let complexity = 0;
  let culturalBarriers = 0;
  let stakeholderResistance = 0;
  let other = 0;
  let numberOfRespondents = 0;

  // --- Precondition: Q28 = No ---
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.personIncorporatesSustainability) === 'no'
  );

  filteredResponses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.hindranceLackInterest) === 'yes') {
      lackInterest += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceLackKnowledge) === 'yes') {
      lackKnowledge += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceLimitedResources) === 'yes') {
      limitedResources += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceFinancialConstraints) === 'yes') {
      financialConstraints += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceInsufficientTime) === 'yes') {
      insufficientTime += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceLackSupport) === 'yes') {
      lackSupport += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceComplexity) === 'yes') {
      complexity += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceCulturalBarriers) === 'yes') {
      culturalBarriers += 1;
      hasAnswer = true;
    }
    if (norm(raw.hindranceStakeholderResistance) === 'yes') {
      stakeholderResistance += 1;
      hasAnswer = true;
    }

    if (
      norm(raw.hindranceLackInterest) === 'no' &&
      norm(raw.hindranceLackKnowledge) === 'no' &&
      norm(raw.hindranceLimitedResources) === 'no' &&
      norm(raw.hindranceFinancialConstraints) === 'no' &&
      norm(raw.hindranceInsufficientTime) === 'no' &&
      norm(raw.hindranceLackSupport) === 'no' &&
      norm(raw.hindranceComplexity) === 'no' &&
      norm(raw.hindranceCulturalBarriers) === 'no' &&
      norm(raw.hindranceStakeholderResistance) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = norm(raw.hindranceOther);
    if (otherVal === 'yes' || (otherVal.length > 0 && otherVal !== 'n/a')) {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) numberOfRespondents += 1;
  });

  const items = [
    { label: 'Lack of personal interest', value: lackInterest },
    { label: 'Lack of knowledge or awareness', value: lackKnowledge },
    { label: 'Limited resources or budget', value: limitedResources },
    { label: 'Financial constraints', value: financialConstraints },
    { label: 'Insufficient time or competing priorities', value: insufficientTime },
    { label: 'Lack of organizational or leadership support', value: lackSupport },
    { label: 'Complexity or uncertainty of solutions', value: complexity },
    { label: 'Cultural or social barriers', value: culturalBarriers },
    { label: 'Resistance from stakeholders', value: stakeholderResistance },
    { label: 'Other', value: other },
  ];

  // Sort ascending by value
  items.sort((a, b) => a.value - b.value);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: items.map((i) => i.value),
      y: items.map((i) => i.label),
      marker: { color: palette.berry },
      text: items.map((i) => i.value.toString()),
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
      numberOfResponses: numberOfRespondents,
      totalEligible: filteredResponses.length,
    },
  };
};

// --- COMPONENT 1: Main Chart ---
export const HindrancesToIncorporateSustainability = ({
  onExplore,
}: {
  onExplore?: () => void;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 300 }, // Preserved wide margin
      xaxis: {
        title: {
          text: 'Number of Respondents',
        },
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
      graphId="HindrancesToIncorporateSustainability"
      processor={hindrancesProcessor}
      layout={layout}
      exploreComponents={[HindrancesToIncorporateSustainabilityOther]}
      onExplore={onExplore}
    />
  );
};

export default HindrancesToIncorporateSustainability;
