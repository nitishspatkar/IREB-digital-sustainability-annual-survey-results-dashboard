import { useState } from "react";

// Imports
import CustomerNotRequestingReasons from "./graphs/CustomerNotRequestingReasons";
import CustomerRequirementFrequency from "./graphs/CustomerRequirementFrequency";
// Updated Imports
import { NoTrainingReasons, NoTrainingReasonsDetails
} from "./graphs/NoTrainingReasons";
import OrganizationDepartmentCoordination from "./graphs/OrganizationDepartmentCoordination";
import OrganizationHasGoals from "./graphs/OrganizationHasGoals";
import OrganizationHasSustainabilityTeam from "./graphs/OrganizationHasSustainabilityTeam";
import OrganizationIncorporatesPractices from "./graphs/OrganizationIncorporatesPractices";
import OrganizationOffersTraining from "./graphs/OrganizationOffersTraining";
import OrganizationReportsOnSustainability from "./graphs/OrganizationReportsOnSustainability";
import OrganizationTrainingDescriptionList from "./graphs/OrganizationTrainingDescriptionList";
import {
    SustainabilityDimensions,
    SustainabilityDimensionsDetails
} from "./graphs/SustainabilityDimensions";

// --- HELPER COMPONENT ---
const GraphAnchor = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <div id={id}>
        {children}
    </div>
);

// --- CONFIGURATION ---
const EXPLORE_VIEWS = {
    sustainability_dims: {
        Component: SustainabilityDimensionsDetails,
        anchorId: "graph-sustainability-dims",
    },
    no_training_reasons: {
        Component: NoTrainingReasonsDetails,
        anchorId: "graph-no-training-reasons",
    },
} as const;

type ExploreViewId = keyof typeof EXPLORE_VIEWS;

const DigitalSustainabilityRole = () => {
    const [activeView, setActiveView] = useState<ExploreViewId | null>(null);

    const handleBack = (anchorId: string) => {
        setActiveView(null);
        setTimeout(() => {
            document
                .getElementById(anchorId)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
                The Role of Digital Sustainability in Organizations
            </h1>

            <div className="grid grid-cols-1 gap-18">
                <OrganizationHasGoals />
                <OrganizationHasSustainabilityTeam />
                <OrganizationIncorporatesPractices />
                <OrganizationDepartmentCoordination />
                <OrganizationReportsOnSustainability />

                <GraphAnchor id="graph-sustainability-dims">
                    <SustainabilityDimensions
                        onExplore={() => setActiveView("sustainability_dims")}
                    />
                </GraphAnchor>

                <CustomerRequirementFrequency />
                <CustomerNotRequestingReasons />
                <OrganizationOffersTraining />
                <OrganizationTrainingDescriptionList />

                {/* Wrapped Component */}
                <GraphAnchor id="graph-no-training-reasons">
                    <NoTrainingReasons
                        onExplore={() => setActiveView("no_training_reasons")}
                    />
                </GraphAnchor>
            </div>
        </div>
    );
};

export default DigitalSustainabilityRole;