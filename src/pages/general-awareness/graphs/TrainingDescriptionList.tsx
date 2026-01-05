import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  // 1. Filter for users who answered "Yes" to Q10
  const participants = responses.filter(
    (r) => normalize(r.raw.participatedInTraining ?? '').toLowerCase() === 'yes'
  );

  // 2. Get their descriptions
  const items = participants
    .map((r) => normalize(r.raw.trainingDescription ?? ''))
    .filter((desc) => desc.length > 0 && desc.toLowerCase() !== 'n/a');

  return {
    items,
    stats: {
      numberOfResponses: items.length,
      totalEligible: participants.length,
    },
  };
};

const TrainingDescriptionList = () => {
  return <GenericChart graphId="TrainingDescriptionList" processor={processor} />;
};

export default TrainingDescriptionList;
