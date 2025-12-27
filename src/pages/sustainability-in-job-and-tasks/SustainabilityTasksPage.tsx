import { useState } from 'react';

// Imports
// Updated Import
import {
  AdditionalSupportResources,
  AdditionalSupportResourcesDetails,
} from './graphs/AdditionalSupportResources';
import {
  DriversToIncorporateSustainability,
  DriversToIncorporateSustainabilityDetails,
} from './graphs/DriversToIncorporateSustainability';
import {
  HindrancesToIncorporateSustainability,
  HindrancesToIncorporateSustainabilityDetails,
} from './graphs/HindrancesToIncorporateSustainability';
import {
  KnowledgeGapsByDimension,
  KnowledgeGapsByDimensionDetails,
} from './graphs/KnowledgeGapsByDimension';
import PersonIncorporatesSustainability from './graphs/PersonIncorporatesSustainability';
import {
  SustainabilityDimensionsInTasks,
  SustainabilityDimensionsInTasksDetails,
} from './graphs/SustainabilityDimensionsInTasks';
import ToolsDescriptionList from './graphs/ToolsDescriptionList';
import UsesTools from './graphs/UsesTools';

// --- HELPER COMPONENT ---
const GraphAnchor = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <div id={id}>{children}</div>
);

// --- CONFIGURATION ---
const EXPLORE_VIEWS = {
  drivers_incorporate: {
    Component: DriversToIncorporateSustainabilityDetails,
    anchorId: 'graph-drivers-incorporate',
  },
  sustainability_dims_tasks: {
    Component: SustainabilityDimensionsInTasksDetails,
    anchorId: 'graph-sustainability-dims-tasks',
  },
  hindrances_incorporate: {
    Component: HindrancesToIncorporateSustainabilityDetails,
    anchorId: 'graph-hindrances-incorporate',
  },
  knowledge_gaps: {
    Component: KnowledgeGapsByDimensionDetails,
    anchorId: 'graph-knowledge-gaps',
  },
  support_resources: {
    Component: AdditionalSupportResourcesDetails,
    anchorId: 'graph-support-resources',
  },
} as const;

type ExploreViewId = keyof typeof EXPLORE_VIEWS;

const SustainabilityTasks = () => {
  const [activeView, setActiveView] = useState<ExploreViewId | null>(null);

  const handleBack = (anchorId: string) => {
    setActiveView(null);
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 1. RENDER EXPLORE VIEW
  if (activeView) {
    const { Component, anchorId } = EXPLORE_VIEWS[activeView];
    return <Component onBack={() => handleBack(anchorId)} />;
  }

  // 2. RENDER MAIN DASHBOARD
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

        <GraphAnchor id="graph-drivers-incorporate">
          <DriversToIncorporateSustainability
            onExplore={() => setActiveView('drivers_incorporate')}
          />
        </GraphAnchor>

        <GraphAnchor id="graph-sustainability-dims-tasks">
          <SustainabilityDimensionsInTasks
            onExplore={() => setActiveView('sustainability_dims_tasks')}
          />
        </GraphAnchor>

        <UsesTools />
        <ToolsDescriptionList />

        <GraphAnchor id="graph-hindrances-incorporate">
          <HindrancesToIncorporateSustainability
            onExplore={() => setActiveView('hindrances_incorporate')}
          />
        </GraphAnchor>

        <GraphAnchor id="graph-knowledge-gaps">
          <KnowledgeGapsByDimension onExplore={() => setActiveView('knowledge_gaps')} />
        </GraphAnchor>

        {/* Wrapped Component */}
        <GraphAnchor id="graph-support-resources">
          <AdditionalSupportResources onExplore={() => setActiveView('support_resources')} />
        </GraphAnchor>
      </div>
    </div>
  );
};

export default SustainabilityTasks;
