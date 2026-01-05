import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const normalizeRole = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  let otherCount = 0;
  const texts: string[] = [];

  responses.forEach((response) => {
    const role = normalizeRole(response.raw.role ?? '');
    if (role.toLowerCase() === 'other') {
      otherCount++;
      const otherText = normalizeRole(response.raw.roleOther ?? '');
      if (otherText.length > 0) {
        texts.push(otherText);
      }
    }
  });

  return {
    items: texts,
    stats: {
      numberOfResponses: texts.length,
      totalEligible: otherCount,
    },
  };
};

export const DemographicOrganizationalRoleOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicOrganizationalRoleDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
