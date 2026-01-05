import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  // Precondition: Q31 = Yes
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.usesTools ?? '').toLowerCase() === 'yes'
  );

  // Get their descriptions from Q32
  const items = filteredResponses
    .map((r) => normalize(r.raw.toolsDescription ?? ''))
    .filter((desc) => desc.length > 0 && desc.toLowerCase() !== 'n/a');

  return {
    items,
    stats: {
      numberOfResponses: items.length,
      totalEligible: filteredResponses.length,
    },
  };
};

const ToolsDescriptionList = () => {
  return <GenericChart graphId="ToolsDescriptionList" processor={processor} />;
};

export default ToolsDescriptionList;
