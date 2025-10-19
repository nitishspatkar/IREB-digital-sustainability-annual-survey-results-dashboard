import { useMemo } from "react";

import { useSurveyData } from "../../data/SurveyContext";
import DemographicAgeGroup from "./graphs/DemographicAgeGroup";
import DemographicApplicationDomain from "./graphs/DemographicApplicationDomain";
import DemographicChoropleth from "./graphs/DemographicChoropleth";
import DemographicCountryTable from "./graphs/DemographicCountryTable";
import DemographicOrganizationalRole from "./graphs/DemographicOrganizationalRole";
import DemographicOrganizationType from "./graphs/DemographicOrganizationType";
import { DemographicProfessionalExperience } from "./graphs/DemographicProfessionalExperience";
import type { RespondentStat } from "./demographicTypes";

const normalizeCountry = (value: string) => value.replace(/\s+/g, " ").trim();

const Demographic = () => {
  const surveyResponses = useSurveyData();
  const year = surveyResponses.length > 0 ? surveyResponses[0].year : "";

  const respondentStats = useMemo<RespondentStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const country = normalizeCountry(response.getCountryOfResidence());

      if (country.length > 0 && country.toLowerCase() !== "n/a") {
        counts.set(country, (counts.get(country) ?? 0) + 1);
      }
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
        <h1 className="text-3xl font-semibold tracking-tight text-plum-500">
          Demographic
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Snapshot of where respondents are located. Based on {totalRespondents}
          responses across {totalCountries} countries from the {year} survey.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
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
