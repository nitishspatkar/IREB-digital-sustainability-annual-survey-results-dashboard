import { useState } from 'react';

// Imports
import CustomerNotRequestingReasons from './graphs/CustomerNotRequestingReasons';
import CustomerRequirementFrequency from './graphs/CustomerRequirementFrequency';
// Updated Imports
import { NoTrainingReasons } from './graphs/NoTrainingReasons';
import { NoTrainingReasonsOther } from './graphs/NoTrainingReasonsOther';
import OrganizationDepartmentCoordination from './graphs/OrganizationDepartmentCoordination';
import OrganizationHasGoals from './graphs/OrganizationHasGoals';
import OrganizationHasSustainabilityTeam from './graphs/OrganizationHasSustainabilityTeam';
import OrganizationIncorporatesPractices from './graphs/OrganizationIncorporatesPractices';
import OrganizationOffersTraining from './graphs/OrganizationOffersTraining';
import OrganizationReportsOnSustainability from './graphs/OrganizationReportsOnSustainability';
import OrganizationTrainingDescriptionList from './graphs/OrganizationTrainingDescriptionList';
import { SustainabilityDimensions } from './graphs/SustainabilityDimensions';
import { SustainabilityDimensionsOther } from './graphs/SustainabilityDimensionsOther';

// --- HELPER COMPONENT ---
const GraphAnchor = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <div id={id}>{children}</div>
);

// --- CONFIGURATION ---
const EXPLORE_VIEWS = {
  sustainability_dims: {
    Component: SustainabilityDimensionsOther,
    anchorId: 'graph-sustainability-dims',
  },
  no_training_reasons: {
    Component: NoTrainingReasonsOther,
    anchorId: 'graph-no-training-reasons',
  },
} as const;

type ExploreViewId = keyof typeof EXPLORE_VIEWS;

const DigitalSustainabilityRole = () => {
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
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        The Role of Digital Sustainability in Organizations
      </h1>

      <div className="grid grid-cols-1 gap-18">
        <OrganizationHasGoals />
        <OrganizationHasSustainabilityTeam />
        <OrganizationIncorporatesPractices />
        <OrganizationDepartmentCoordination />
        <GraphAnchor id="graph-sustainability-dims">
          <SustainabilityDimensions onExplore={() => setActiveView('sustainability_dims')} />
        </GraphAnchor>
        <OrganizationReportsOnSustainability />
        <OrganizationOffersTraining />
        <OrganizationTrainingDescriptionList />
        {/* Wrapped Component */}
        <GraphAnchor id="graph-no-training-reasons">
          <NoTrainingReasons onExplore={() => setActiveView('no_training_reasons')} />
        </GraphAnchor>
        <CustomerRequirementFrequency />
        <CustomerNotRequestingReasons />
      </div>
    </div>
  );
};

export default DigitalSustainabilityRole;
