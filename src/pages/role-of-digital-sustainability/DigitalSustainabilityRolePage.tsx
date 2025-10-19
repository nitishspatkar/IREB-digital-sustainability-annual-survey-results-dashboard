import SustainabilityDimensions from "./graphs/SustainabilityDimensions";
import NoTrainingReasons from "./graphs/NoTrainingReasons";
import OrganizationOffersTraining from "./graphs/OrganizationOffersTraining";

const DigitalSustainabilityRole = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
        The Role of Digital Sustainability in Your Organization
      </h1>

      <div className="grid grid-cols-1 gap-6">
        <SustainabilityDimensions />

        <div className="space-y-2">
          <h2 className="text-xl font-medium text-ink-700">
            Organizational Training and Resources
          </h2>
          <OrganizationOffersTraining />
          <NoTrainingReasons />
        </div>
      </div>
    </div>
  );
};

export default DigitalSustainabilityRole;
