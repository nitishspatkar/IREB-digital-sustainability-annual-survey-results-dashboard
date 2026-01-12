import { SustainabilityGroupedChart } from '../../components/SustainabilityGroupedChart';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

const EXPERIENCE_GROUPS = ['0 – 10 years', '11 – 20 years', 'More than 20 years'];

const getExperienceGroup = (raw: SurveyRecord) => {
  const exp = (raw.professionalExperienceYears ?? '').trim();
  if (!exp || exp.toLowerCase() === 'n/a') return null;

  // Map original experience ranges to our 3 groups
  if (exp === 'Less than 1 year' || exp === '1 – 5 years' || exp === '6 – 10 years') {
    return '0 – 10 years';
  }
  if (exp === '11 – 20 years') {
    return '11 – 20 years';
  }
  if (exp === 'More than 20 years') {
    return 'More than 20 years';
  }

  return null;
};

export const SustainabilityDimensionsByExperience = ({
  onBack,
  showBackButton,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => (
  <SustainabilityGroupedChart
    graphId="SustainabilityDimensionsByExperience"
    groups={EXPERIENCE_GROUPS}
    getGroup={getExperienceGroup}
    onBack={onBack}
    showBackButton={showBackButton}
  />
);
