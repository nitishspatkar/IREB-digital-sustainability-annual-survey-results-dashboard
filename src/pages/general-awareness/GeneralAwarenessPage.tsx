import { useState } from 'react';

import { DefinitionAwareness } from './graphs/DefinitionAwareness';
import { DiscussionFrequency, DiscussionFrequencyDetails } from './graphs/DiscussionFrequency';
import TrainingDescriptionList from './graphs/TrainingDescriptionList';
import TrainingParticipation from './graphs/TrainingParticipation';
import TrainingPrivateCapacity from './graphs/TrainingPrivateCapacity';
import TrainingProgramsCount from './graphs/TrainingProgramsCount';
import { TrainingReasonsNo } from './graphs/TrainingReasonsNo';
import { TrainingReasonsNoDetails } from '../explore-graphs/TrainingReasonsNoDetails';
import { TrainingReasonsNotMore } from './graphs/TrainingReasonsNotMore';
import { TrainingReasonsNotMoreOther } from '../explore-graphs/TrainingReasonsNotMoreOther';
import TrainingSatisfaction from './graphs/TrainingSatisfaction';

// --- HELPER COMPONENT (DRY) ---
const GraphAnchor = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <div id={id}>{children}</div>
);

// --- CONFIGURATION ---
const EXPLORE_VIEWS = {
  discussion_freq: {
    Component: DiscussionFrequencyDetails,
    anchorId: 'graph-discussion-freq',
  },
  training_reasons_no: {
    Component: TrainingReasonsNoDetails,
    anchorId: 'graph-training-reasons-no',
  },
  training_reasons_not_more: {
    Component: TrainingReasonsNotMoreOther,
    anchorId: 'graph-training-reasons-not-more',
  },
} as const;

type ExploreViewId = keyof typeof EXPLORE_VIEWS;

const GeneralAwareness = () => {
  // State für die aktive Detail-Ansicht
  const [activeView, setActiveView] = useState<ExploreViewId | null>(null);

  // Handler für den "Back"-Button (scrollt zurück zum Diagramm)
  const handleBack = (anchorId: string) => {
    setActiveView(null);
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 1. RENDER EXPLORE VIEW (Falls aktiv)
  if (activeView) {
    const { Component, anchorId } = EXPLORE_VIEWS[activeView];
    return <Component onBack={() => handleBack(anchorId)} />;
  }

  // 2. RENDER MAIN DASHBOARD
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        General Awareness of Sustainability
      </h1>

      <div className="grid grid-cols-1 gap-18">
        <GraphAnchor id="graph-definition-awareness">
          <DefinitionAwareness />
        </GraphAnchor>

        <GraphAnchor id="graph-discussion-freq">
          <DiscussionFrequency onExplore={() => setActiveView('discussion_freq')} />
        </GraphAnchor>

        <TrainingParticipation />
        <GraphAnchor id="graph-training-reasons-no">
          <TrainingReasonsNo onExplore={() => setActiveView('training_reasons_no')} />
        </GraphAnchor>
        <TrainingProgramsCount />
        <TrainingPrivateCapacity />
        <TrainingDescriptionList />
        <TrainingSatisfaction />
        <GraphAnchor id="graph-training-reasons-not-more">
          <TrainingReasonsNotMore onExplore={() => setActiveView('training_reasons_not_more')} />
        </GraphAnchor>
      </div>
    </div>
  );
};

export default GeneralAwareness;
