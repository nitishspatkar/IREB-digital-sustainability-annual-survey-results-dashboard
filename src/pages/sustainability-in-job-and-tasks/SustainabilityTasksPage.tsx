import { AdditionalSupportResources } from './graphs/AdditionalSupportResources';
import DriversToIncorporateSustainability from './graphs/DriversToIncorporateSustainability';
import HindrancesToIncorporateSustainability from './graphs/HindrancesToIncorporateSustainability';
import KnowledgeGapsByDimension from './graphs/KnowledgeGapsByDimension';
import PersonIncorporatesSustainability from './graphs/PersonIncorporatesSustainability';
import SustainabilityDimensionsInTasks from './graphs/SustainabilityDimensionsInTasks';
import ToolsDescriptionList from './graphs/ToolsDescriptionList';
import UsesTools from './graphs/UsesTools';

const SustainabilityTasks = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
          Sustainability in Role-specific Tasks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ireb-grey-01 font-mori">
          What drives professionals to integrate digital sustainability into their role-specific
          tasks based on the latest survey data.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-18">
        <PersonIncorporatesSustainability />
        <DriversToIncorporateSustainability />
        <SustainabilityDimensionsInTasks />
        <UsesTools />
        <ToolsDescriptionList />
        <HindrancesToIncorporateSustainability />
        <KnowledgeGapsByDimension />
        <AdditionalSupportResources />
      </div>
    </div>
  );
};

export default SustainabilityTasks;
