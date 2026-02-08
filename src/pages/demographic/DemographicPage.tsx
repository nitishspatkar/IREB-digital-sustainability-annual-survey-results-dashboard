import { useMemo } from 'react';

import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';

import DemographicAgeGroup from './graphs/DemographicAgeGroup';
import DemographicChoropleth from './graphs/DemographicChoropleth';
import DemographicCountryTable from './graphs/DemographicCountryTable';
import DemographicOrganizationType from './graphs/DemographicOrganizationType';
import { DemographicProfessionalExperience } from './graphs/DemographicProfessionalExperience';
import { DemographicApplicationDomain } from './graphs/DemographicApplicationDomain';
import { DemographicOrganizationalRole } from './graphs/DemographicOrganizationalRole';
import type { RespondentStat } from './demographicTypes';
import DemographicRegionDistribution from './graphs/DemographicRegionDistribution.tsx';

const Demographic = () => {
  const surveyResponses = useSurveyData();

  // --- Data Logic (gekürzt für Übersicht) ---
  const normalizeCountry = (val: string) => val.replace(/\s+/g, ' ').trim();
  const year = surveyResponses.length > 0 ? surveyResponses[0].year : '';

  const respondentStats = useMemo<RespondentStat[]>(() => {
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
        <DemographicRegionDistribution respondentStats={respondentStats} />
        <DemographicCountryTable respondentStats={respondentStats} />
        <DemographicChoropleth respondentStats={respondentStats} />
        <DemographicAgeGroup />
        <DemographicProfessionalExperience />
        <DemographicOrganizationalRole />
        <DemographicOrganizationType />
        <DemographicApplicationDomain />
      </div>
    </div>
  );
};

export default Demographic;
