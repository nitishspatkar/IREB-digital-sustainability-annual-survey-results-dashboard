import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

/**
 * Bar chart: What drives you to incorporate digital sustainability in your role-related tasks?
 *
 * Data columns used (boolean or text):
 * - driveOrganizationalPolicies
 * - drivePersonalBeliefs
 * - driveClientRequirements
 * - driveUserRequirements
 * - driveLegalRequirements
 * - driveOther (counted if non-empty and not "n/a")
 */
const DriversToIncorporateSustainability = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const surveyResponses = useSurveyData();

  const counts = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

    let orgPolicies = 0;
    let personalBeliefs = 0;
    let clientReqs = 0;
    let userReqs = 0;
    let legalReqs = 0;
    let other = 0;

    surveyResponses.forEach((response) => {
      const raw = response.raw;

      if (normalize(raw.driveOrganizationalPolicies) === "yes")
        orgPolicies += 1;
      if (normalize(raw.drivePersonalBeliefs) === "yes") personalBeliefs += 1;
      if (normalize(raw.driveClientRequirements) === "yes") clientReqs += 1;
      if (normalize(raw.driveUserRequirements) === "yes") userReqs += 1;
      if (normalize(raw.driveLegalRequirements) === "yes") legalReqs += 1;

      const otherVal = normalize(raw.driveOther);
      if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
    });

    return {
      labels: [
        "Organizational policies",
        "Personal beliefs",
        "Client requirements",
        "User requirements",
        "Legal requirements",
        "Other",
      ],
      values: [
        orgPolicies,
        personalBeliefs,
        clientReqs,
        userReqs,
        legalReqs,
        other,
      ],
    } as const;
  }, [surveyResponses]);

  const data = useMemo<Data[]>(
    () => [
      {
        x: [...counts.labels],
        y: [...counts.values],
        type: "bar",
        marker: { color: barColor },
        hoverinfo: "none",
      },
    ],
    [counts, barColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 100, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Drivers to incorporate digital sustainability in role-related tasks",
        font: { family: "Inter, sans-serif", size: 18, color: titleColor },
      },
      xaxis: {
        tickangle: -20,
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        title: {
          text: "Number of Respondents",
          font: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
    }),
    [titleColor, tickColor]
  );

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DriversToIncorporateSustainability;
