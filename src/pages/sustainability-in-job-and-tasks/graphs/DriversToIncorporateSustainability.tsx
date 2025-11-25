import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";

const DriversToIncorporateSustainability = () => {
  const questionHeader =
    "What drives you to incorporate digital sustainability in your role-related tasks?";
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "driveOther"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const surveyResponses = useSurveyData();

  const counts = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

    let orgPolicies = 0;
    let personalBeliefs = 0;
    let clientReqs = 0;
    let userReqs = 0;
    let legalReqs = 0;
    let other = 0;

    // --- Precondition: Q28 = Yes ---
    const filteredResponses = surveyResponses.filter(
      (r) => normalize(r.raw.personIncorporatesSustainability) === "yes"
    );

    filteredResponses.forEach((response) => {
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

    const items = [
      { label: "Organizational policies", value: orgPolicies },
      { label: "Personal beliefs", value: personalBeliefs },
      { label: "Client requirements", value: clientReqs },
      { label: "User requirements", value: userReqs },
      { label: "Legal requirements", value: legalReqs },
      { label: "Other", value: other },
    ];

    // Sort ascending by value
    items.sort((a, b) => a.value - b.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
    } as const;
  }, [surveyResponses]);

  const driveOtherTexts = useMemo(() => {
    return surveyResponses
      .map((r) => (r.raw.driveOther ?? "").trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== "n/a" && lower !== "yes";
      });
  }, [surveyResponses]);

  const data = useMemo<Data[]>(
    () => [
      {
        type: "bar",
        orientation: "h",
        x: counts.values,
        y: counts.labels,
        marker: { color: barColor },
        // --- ADDED TEXT LABELS ---
        text: counts.values.map((v) => v.toString()),
        textposition: "outside",
        textfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: "none",
      },
    ],
    [counts, barColor, tickColor] // Added tickColor
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 180 }, // Adjusted margins
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: {
          text: "Number of Respondents",
          font: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
    }),
    [tickColor]
  );

  const numberOfResponses = counts.values.reduce((a, b) => a + b, 0);
  const totalResponses = surveyResponses.length;
  const responseRate =
    totalResponses > 0
      ? Math.round((numberOfResponses / totalResponses) * 100)
      : 0;

  const question = questionHeader;
  const description =
    "Shows which factors motivate respondents to integrate digital sustainability into their role-specific tasks.";

  return (
    <>
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={numberOfResponses}
        responseRate={responseRate}
      >
        <div className="h-[520px]">
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </GraphWrapper>
      {driveOtherTexts.length > 0 && (
        <GraphWrapper
          question={questionHeaderOther ?? ""}
          numberOfResponses={driveOtherTexts.length}
          responseRate={
            totalResponses > 0
              ? (driveOtherTexts.length / totalResponses) * 100
              : 0
          }
        >
          <div className="mt-4 h-[520px]">
            <ul
              className="h-[calc(100%-40px)] overflow-y-auto"
              style={{ color: tickColor }}
            >
              {driveOtherTexts.map((text, index) => (
                <li
                  key={index}
                  className="border-b px-2 py-3 text-sm"
                  style={{ borderColor: borderColor }}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </GraphWrapper>
      )}
    </>
  );
};

export default DriversToIncorporateSustainability;
