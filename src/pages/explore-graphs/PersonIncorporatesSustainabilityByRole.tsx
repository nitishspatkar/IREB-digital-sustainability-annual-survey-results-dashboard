import { GroupedYesNoChart } from '../../components/GroupedYesNoChart';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export const PersonIncorporatesSustainabilityByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  // Logic to bucket raw roles into the 4 specific groups
  const getRoleCategory = (raw: any): string | null => {
    const role = normalize(raw.role ?? '').toLowerCase();

    if (!role || role === 'n/a') return null;

    // 1. RE (Requirements Engineering)
    if (
      role.includes('requirements engineer') ||
      role.includes('business analyst') ||
      role.includes('product owner')
    ) {
      return 'RE';
    }

    // 2. Management
    if (
      role.includes('team lead') ||
      role.includes('project manager') ||
      role.includes('executive') ||
      role.includes('ceo') ||
      role.includes('owner') ||
      role.includes('cto')
    ) {
      return 'Management';
    }

    // 3. Tech
    if (
      role.includes('devops') ||
      role.includes('developer') ||
      role.includes('software architect') ||
      role.includes('tester') ||
      role.includes('qa engineer')
    ) {
      return 'Tech';
    }

    // 4. Research
    if (role.includes('researcher') || role.includes('educator')) {
      return 'Research';
    }

    // If no match, return null
    return 'Other';
  };

  const getYesNo = (raw: any) => {
    const val = normalize(raw.personIncorporatesSustainability ?? '').toLowerCase();
    if (val === 'yes') return 'yes';
    if (val === 'no') return 'no';
    return null;
  };

  return (
    <GroupedYesNoChart
      graphId="PersonIncorporatesSustainabilityByRole"
      onBack={onBack}
      showBackButton={showBackButton}
      getCategory={getRoleCategory}
      getYesNo={getYesNo}
      sortOrder={['Management', 'RE', 'Research', 'Tech']} // Matches the screenshot order
      layoutOverrides={{
        xaxis: { title: { text: 'Role' } },
      }}
    />
  );
};
