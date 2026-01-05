import CustomerNotRequestingReasons from './graphs/CustomerNotRequestingReasons';
import CustomerRequirementFrequency from './graphs/CustomerRequirementFrequency';
import { NoTrainingReasons } from './graphs/NoTrainingReasons';
import OrganizationDepartmentCoordination from './graphs/OrganizationDepartmentCoordination';
import OrganizationHasGoals from './graphs/OrganizationHasGoals';
import OrganizationHasSustainabilityTeam from './graphs/OrganizationHasSustainabilityTeam';
import OrganizationIncorporatesPractices from './graphs/OrganizationIncorporatesPractices';
import OrganizationOffersTraining from './graphs/OrganizationOffersTraining';
import OrganizationReportsOnSustainability from './graphs/OrganizationReportsOnSustainability';
import OrganizationTrainingDescriptionList from './graphs/OrganizationTrainingDescriptionList';
import { SustainabilityDimensions } from './graphs/SustainabilityDimensions';

const DigitalSustainabilityRole = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        The Role of Digital Sustainability in Organizations
      </h1>

      <div className="grid grid-cols-1 gap-18">
        <OrganizationHasGoals />
        <OrganizationHasSustainabilityTeam />
        <OrganizationIncorporatesPractices />
        <OrganizationDepartmentCoordination />
        <SustainabilityDimensions />
        <OrganizationReportsOnSustainability />
        <OrganizationOffersTraining />
        <OrganizationTrainingDescriptionList />
        <NoTrainingReasons />
        <CustomerRequirementFrequency />
        <CustomerNotRequestingReasons />
      </div>
    </div>
  );
};

export default DigitalSustainabilityRole;
