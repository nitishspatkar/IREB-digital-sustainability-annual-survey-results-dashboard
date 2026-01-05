import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  // Precondition: Q23 = Yes
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.organizationOffersTraining ?? '').toLowerCase() === 'yes'
  );

  // Get their descriptions from Q24
  const items = filteredResponses
    .map((r) => normalize(r.raw.organizationTrainingDescription ?? ''))
    .filter((desc) => desc.length > 0 && desc.toLowerCase() !== 'n/a');

  return {
    items,
    stats: {
      numberOfResponses: items.length,
      totalEligible: filteredResponses.length,
    },
  };
};

const OrganizationTrainingDescriptionList = () => {
  return <GenericChart graphId="OrganizationTrainingDescriptionList" processor={processor} />;
};

export default OrganizationTrainingDescriptionList;
