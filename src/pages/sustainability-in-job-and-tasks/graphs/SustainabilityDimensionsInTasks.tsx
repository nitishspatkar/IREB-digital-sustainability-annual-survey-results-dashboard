import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import { SustainabilityDimensionsInTasksOther } from '../../explore-graphs/SustainabilityDimensionsInTasksOther';

// --- PROCESSOR ---
const sustainabilityDimensionsProcessor: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  let environmental = 0;
  let social = 0;
  let individual = 0;
  let economic = 0;
  let technical = 0;
  let other = 0;
  let numberOfRespondents = 0;

  // --- Precondition: Q28 = Yes ---
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.personIncorporatesSustainability) === 'yes'
  );

  filteredResponses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.roleConsiderEnvironmental) === 'yes') {
      environmental += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderSocial) === 'yes') {
      social += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderIndividual) === 'yes') {
      individual += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderEconomic) === 'yes') {
      economic += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderTechnical) === 'yes') {
      technical += 1;
      hasAnswer = true;
    }

    if (
      norm(raw.roleConsiderEnvironmental) === 'no' &&
      norm(raw.roleConsiderSocial) === 'no' &&
      norm(raw.roleConsiderIndividual) === 'no' &&
      norm(raw.roleConsiderEconomic) === 'no' &&
      norm(raw.roleConsiderTechnical) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = norm(raw.roleConsiderOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) numberOfRespondents += 1;
  });

  const items = [
    { label: 'Environmental', value: environmental },
    { label: 'Social', value: social },
    { label: 'Individual', value: individual },
    { label: 'Economic', value: economic },
    { label: 'Technical', value: technical },
    { label: 'Other', value: other },
  ];

  // Sort ascending by value for horizontal chart
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
export const SustainabilityDimensionsInTasks = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 120 }, // Preserved margin
    }),
    []
  );

  return (
    <GenericChart
      graphId="SustainabilityDimensionsInTasks"
      processor={sustainabilityDimensionsProcessor}
      layout={layout}
      exploreComponents={[SustainabilityDimensionsInTasksOther]}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const SustainabilityDimensionsInTasksDetails = ({ onBack }: { onBack: () => void }) => {
  return <SustainabilityDimensionsInTasksOther onBack={onBack} />;
};

export default SustainabilityDimensionsInTasks;
