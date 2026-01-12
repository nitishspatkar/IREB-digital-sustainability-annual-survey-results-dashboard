import { SustainabilityGroupedChart } from '../../components/SustainabilityGroupedChart';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

const AGE_GROUPS = ['18 - 28', '29 - 44', '45 - 60', 'Above 60'];

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, ' ').trim();

const getAgeGroup = (raw: SurveyRecord) => {
  const ageGroup = normalizeAgeGroup(raw.ageGroup ?? '');
  if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
    // Check if the normalized age group is in our list
    if (AGE_GROUPS.includes(ageGroup)) {
      return ageGroup;
    }
  }
  return null;
};

export const SustainabilityDimensionsByAge = ({
  onBack,
  showBackButton,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => (
  <SustainabilityGroupedChart
    graphId="SustainabilityDimensionsByAge"
    groups={AGE_GROUPS}
    getGroup={getAgeGroup}
    onBack={onBack}
    showBackButton={showBackButton}
  />
);
