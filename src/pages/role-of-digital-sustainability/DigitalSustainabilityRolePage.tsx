import SustainabilityDimensions from "./graphs/SustainabilityDimensions";
import NoTrainingReasons from "./graphs/NoTrainingReasons";
import OrganizationOffersTraining from "./graphs/OrganizationOffersTraining";
import OrganizationHasGoals from "./graphs/OrganizationHasGoals";
import OrganizationHasSustainabilityTeam from "./graphs/OrganizationHasSustainabilityTeam";
import OrganizationIncorporatesPractices from "./graphs/OrganizationIncorporatesPractices";
import OrganizationDepartmentCoordination from "./graphs/OrganizationDepartmentCoordination";
import OrganizationReportsOnSustainability from "./graphs/OrganizationReportsOnSustainability";
import OrganizationTrainingDescriptionList from "./graphs/OrganizationTrainingDescriptionList";
import CustomerRequirementFrequency from "./graphs/CustomerRequirementFrequency";
import CustomerNotRequestingReasons from "./graphs/CustomerNotRequestingReasons"; // <-- 1. Add this import

const DigitalSustainabilityRole = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
                The Role of Digital Sustainability in Your Organization
            </h1>

            <div className="grid grid-cols-1 gap-6">
                <OrganizationHasGoals />
                <OrganizationHasSustainabilityTeam />
                <OrganizationIncorporatesPractices />
                <OrganizationDepartmentCoordination />
                <OrganizationReportsOnSustainability />
                <SustainabilityDimensions />
                <CustomerRequirementFrequency />
                <CustomerNotRequestingReasons />
                <OrganizationOffersTraining />
                <OrganizationTrainingDescriptionList />
                <NoTrainingReasons />
            </div>
        </div>
    );
};

export default DigitalSustainabilityRole;