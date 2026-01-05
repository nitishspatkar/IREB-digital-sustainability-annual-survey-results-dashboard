import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  // Precondition: Q26 = "Rarely..." or "Never"
  const rarely = 'rarely, but it has happened';
  const never = 'never';

  const filteredResponses = responses.filter((r) => {
    const freq = normalize(r.raw.customerRequirementFrequency ?? '').toLowerCase();
    return freq === rarely || freq === never;
  });

  // Get their descriptions from Q27
  const items = filteredResponses
    .map((r) => normalize(r.raw.customerNotRequestingReasons ?? ''))
    .filter((reason) => reason.length > 0 && reason.toLowerCase() !== 'n/a');

  return {
    items,
    stats: {
      numberOfResponses: items.length,
      totalEligible: filteredResponses.length,
    },
  };
};

const CustomerNotRequestingReasons = () => {
  return <GenericChart graphId="CustomerNotRequestingReasons" processor={processor} />;
};

export default CustomerNotRequestingReasons;
