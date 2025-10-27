import DiscussionFrequency from "./graphs/DiscussionFrequency";
import TrainingSatisfaction from "./graphs/TrainingSatisfaction";
import TrainingProgramsCount from "./graphs/TrainingProgramsCount";
import DefinitionAwareness from "./graphs/DefinitionAwareness";
import TrainingParticipation from "./graphs/TrainingParticipation";
import TrainingReasonsNo from "./graphs/TrainingReasonsNo";
import TrainingPrivateCapacity from "./graphs/TrainingPrivateCapacity";
import TrainingDescriptionList from "./graphs/TrainingDescriptionList";
import TrainingReasonsNotMore from "./graphs/TrainingReasonsNotMore"; // <-- 1. Add this import

const GeneralAwareness = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
                General Awareness of Sustainability
            </h1>

            <div className="grid grid-cols-1 gap-6">
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