import { useMemo, useState } from 'react';

import { useSurveyData } from '../../data/SurveyContext';

// Deine Diagramm-Imports
import DemographicAgeGroup from './graphs/DemographicAgeGroup';
import DemographicChoropleth from './graphs/DemographicChoropleth';
import DemographicCountryTable from './graphs/DemographicCountryTable';
import DemographicOrganizationType from './graphs/DemographicOrganizationType';
import { DemographicProfessionalExperience } from './graphs/DemographicProfessionalExperience';
import {
  DemographicApplicationDomain,
  DemographicApplicationDomainDetails,
} from './graphs/DemographicApplicationDomain';
import {
  DemographicOrganizationalRole,
  DemographicOrganizationalRoleDetails,
} from './graphs/DemographicOrganizationalRole';
import type { RespondentStat } from './demographicTypes';

// Hilfs-Komponente für den Anker (spart Schreibarbeit im JSX)
const GraphAnchor = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <div id={id}>{children}</div>
);

// Definition der Views (Mapping)
const EXPLORE_VIEWS = {
  org_role: {
    Component: DemographicOrganizationalRoleDetails,
    anchorId: 'graph-org-role',
  },
  app_domain: {
    Component: DemographicApplicationDomainDetails,
    anchorId: 'graph-app-domain',
  },
} as const;

type ExploreViewId = keyof typeof EXPLORE_VIEWS;

const Demographic = () => {
  const surveyResponses = useSurveyData();
  const [activeView, setActiveView] = useState<ExploreViewId | null>(null);

  // --- Data Logic (gekürzt für Übersicht) ---
  const normalizeCountry = (val: string) => val.replace(/\s+/g, ' ').trim();
  const year = surveyResponses.length > 0 ? surveyResponses[0].year : '';

  const respondentStats = useMemo<RespondentStat[]>(() => {
    // ... deine existierende Logik ...
    const counts = new Map<string, number>();
    surveyResponses.forEach((r) => {
      const c = normalizeCountry(r.getCountryOfResidence());
      if (c && c.toLowerCase() !== 'n/a') counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const totalRespondents = surveyResponses.length;
  const totalCountries = respondentStats.length;

  // --- Back Logic ---
  const handleBack = (anchorId: string) => {
    setActiveView(null);
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 1. RENDER EXPLORE VIEW (Dynamisch basierend auf dem Mapping oben)
  if (activeView) {
    const { Component, anchorId } = EXPLORE_VIEWS[activeView];
    return <Component onBack={() => handleBack(anchorId)} />;
  }

  // 2. RENDER DASHBOARD (Explizites JSX = bessere Lesbarkeit)
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
          Demographics
        </h1>
        <p className="mt-2 text-sm text-ireb-grey-01 font-mori">
          Snapshot of where respondents are located. Based on {totalRespondents} responses across{' '}
          {totalCountries} countries from the {year} survey.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-18">
        <DemographicCountryTable respondentStats={respondentStats} />
        <DemographicChoropleth respondentStats={respondentStats} />
        <DemographicAgeGroup />
        <DemographicProfessionalExperience />
        <GraphAnchor id="graph-org-role">
          <DemographicOrganizationalRole onExplore={() => setActiveView('org_role')} />
        </GraphAnchor>
        <DemographicOrganizationType />
        <GraphAnchor id="graph-app-domain">
          <DemographicApplicationDomain onExplore={() => setActiveView('app_domain')} />
        </GraphAnchor>
      </div>
    </div>
  );
};

export default Demographic;
