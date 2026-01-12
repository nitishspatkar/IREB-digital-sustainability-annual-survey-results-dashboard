import { SustainabilityGroupedChart } from '../../components/SustainabilityGroupedChart';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

const ORG_GROUPS = ['Large company', 'Research', 'Other organizations'];

const getOrgGroup = (raw: SurveyRecord) => {
  const t = (raw.organizationType ?? '').toLowerCase();
  if (t.includes('large enterprise')) return 'Large company';
  if (t.includes('university') || t.includes('research')) return 'Research';
  if (!t || t === 'n/a') return null;
  return 'Other organizations';
};

export const SustainabilityDimensionsByOrgType = ({
  onBack,
  showBackButton,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => (
  <SustainabilityGroupedChart
    graphId="SustainabilityDimensionsByOrgType"
    groups={ORG_GROUPS}
    getGroup={getOrgGroup}
    onBack={onBack}
    showBackButton={showBackButton}
  />
);
