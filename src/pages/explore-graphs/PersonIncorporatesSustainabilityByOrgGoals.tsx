import { GroupedYesNoChart } from '../../components/GroupedYesNoChart';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export const PersonIncorporatesSustainabilityByOrgGoals = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  // Extract the organization's sustainability goals status (X-axis categories)
  const getCategory = (raw: any): string | null => {
    const value = normalize(raw.organizationHasDigitalSustainabilityGoals ?? '').toLowerCase();

    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    if (value === 'not sure') return 'Not sure';

    return null; // Skip invalid/empty responses
  };

  // Extract whether the person incorporates sustainability in their work
  const getYesNo = (raw: any): 'yes' | 'no' | null => {
    const value = normalize(raw.personIncorporatesSustainability ?? '').toLowerCase();

    if (value === 'yes') return 'yes';
    if (value === 'no') return 'no';

    return null; // Skip invalid/empty responses
  };

  return (
    <GroupedYesNoChart
      graphId="PersonIncorporatesSustainabilityByOrgGoals"
      onBack={onBack}
      showBackButton={showBackButton}
      getCategory={getCategory}
      getYesNo={getYesNo}
      sortOrder={['Yes', 'Not sure', 'No']} // Logical order: positive to negative
      layoutOverrides={{
        xaxis: { title: { text: 'Organization Has Sustainability Goals' } },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
    />
  );
};
