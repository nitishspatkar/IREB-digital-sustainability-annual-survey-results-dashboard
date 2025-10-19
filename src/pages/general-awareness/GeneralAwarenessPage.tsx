import DiscussionFrequency from "./graphs/DiscussionFrequency";
import TrainingSatisfaction from "./graphs/TrainingSatisfaction";
import TrainingProgramsCount from "./graphs/TrainingProgramsCount";

const GeneralAwareness = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
        General Awareness of Sustainability
      </h1>

      <div className="grid grid-cols-1 gap-6">
        <DiscussionFrequency />
        <TrainingProgramsCount />
        <TrainingSatisfaction />
      </div>
    </div>
  );
};

export default GeneralAwareness;
