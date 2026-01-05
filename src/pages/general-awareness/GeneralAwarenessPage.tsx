import { DefinitionAwareness } from './graphs/DefinitionAwareness';
import { DiscussionFrequency } from './graphs/DiscussionFrequency';
import TrainingDescriptionList from './graphs/TrainingDescriptionList';
import TrainingParticipation from './graphs/TrainingParticipation';
import TrainingPrivateCapacity from './graphs/TrainingPrivateCapacity';
import TrainingProgramsCount from './graphs/TrainingProgramsCount';
import { TrainingReasonsNo } from './graphs/TrainingReasonsNo';
import { TrainingReasonsNotMore } from './graphs/TrainingReasonsNotMore';
import TrainingSatisfaction from './graphs/TrainingSatisfaction';

const GeneralAwareness = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        General Awareness of Sustainability
      </h1>

      <div className="grid grid-cols-1 gap-18">
        <DefinitionAwareness />
        <DiscussionFrequency />
        <TrainingParticipation />
        <TrainingReasonsNo />
        <TrainingProgramsCount />
        <TrainingPrivateCapacity />
        <TrainingDescriptionList />
        <TrainingSatisfaction />
        <TrainingReasonsNotMore />
      </div>
    </div>
  );
};

export default GeneralAwareness;
