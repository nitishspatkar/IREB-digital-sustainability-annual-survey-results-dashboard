import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import { SustainabilityDimensionsOther } from './SustainabilityDimensionsOther';

const processData: ChartProcessor = (responses, palette) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';

  let environmental = 0;
  let social = 0;
  let individual = 0;
  let economic = 0;
  let technical = 0;
  let other = 0;
  let notSure = 0;
  let eligibleParticipants = 0;
  let respondentsWithAnyAnswer = 0;

  responses.forEach((response) => {
    const raw = response.raw;
    let hasAny = false;

    // Wer die Vorfrage mit "Yes" beantwortet hat, ist "eligible"
    if (normalize(raw.organizationIncorporatesSustainablePractices) === 'yes') {
      eligibleParticipants += 1;
    }

    if (normalize(raw.considerEnvironmental) === 'yes') {
      environmental += 1;
      hasAny = true;
    }
    if (normalize(raw.considerSocial) === 'yes') {
      social += 1;
      hasAny = true;
    }
    if (normalize(raw.considerIndividual) === 'yes') {
      individual += 1;
      hasAny = true;
    }
    if (normalize(raw.considerEconomic) === 'yes') {
      economic += 1;
      hasAny = true;
    }
    if (normalize(raw.considerTechnical) === 'yes') {
      technical += 1;
      hasAny = true;
    }

    if (
      normalize(raw.considerEnvironmental) === 'no' &&
      normalize(raw.considerSocial) === 'no' &&
      normalize(raw.considerIndividual) === 'no' &&
      normalize(raw.considerEconomic) === 'no' &&
      normalize(raw.considerTechnical) === 'no'
    ) {
      hasAny = true;
    }

    if (normalize(raw.considerNotSure) === 'yes') {
      notSure += 1;
      hasAny = true;
    }

    const otherVal = normalize(raw.considerOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAny = true;
    }

    if (hasAny) {
      respondentsWithAnyAnswer += 1;
    }
  });

  const items = [
    { label: 'Environmental', value: environmental },
    { label: 'Social', value: social },
    { label: 'Individual', value: individual },
    { label: 'Economic', value: economic },
    { label: 'Technical', value: technical },
    { label: 'Not sure', value: notSure },
    { label: 'Other', value: other },
  ];

  items.sort((a, b) => a.value - b.value);

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: items.map((item) => item.value),
        y: items.map((item) => item.label),
        marker: { color: palette.berry },
        text: items.map((item) => item.value.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: palette.grey,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: {
      numberOfResponses: respondentsWithAnyAnswer,
      totalEligible: eligibleParticipants,
    },
  };
};

export const SustainabilityDimensions = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="SustainabilityDimensions"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 40, l: 120 },
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
      }}
      exploreComponents={[SustainabilityDimensionsOther]}
      onExplore={onExplore}
    />
  );
};

export default SustainabilityDimensions;
