import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";
import GraphWrapper from "../../../components/GraphWrapper";

const NoTrainingReasons = () => {
  const questionHeader =
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?";
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "orgNoTrainingOther"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const surveyResponses = useSurveyData();

  const counts = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

    let lackAwareness = 0;
    let lackUnderstanding = 0;
    let noDemand = 0;
    let limitedBudget = 0;
    let notPriority = 0;
    let notSure = 0;
    let other = 0;
    let numberOfRespondents = 0;

    // Filter: organizationOffersTraining != "yes" and not empty
    const filteredResponses = surveyResponses.filter((r) => {
      const offer = normalize(r.raw.organizationOffersTraining);
      return offer !== "yes" && offer !== "";
    });

    filteredResponses.forEach((response) => {
      const raw = response.raw;
      let hasAnswer = false;

      if (normalize(raw.orgNoTrainingLackAwareness) === "yes") {
        lackAwareness += 1;
        hasAnswer = true;
      }
      if (normalize(raw.orgNoTrainingLackUnderstanding) === "yes") {
        lackUnderstanding += 1;
        hasAnswer = true;
      }
      if (normalize(raw.orgNoTrainingNoDemand) === "yes") {
        noDemand += 1;
        hasAnswer = true;
      }
      if (normalize(raw.orgNoTrainingLimitedBudget) === "yes") {
        limitedBudget += 1;
        hasAnswer = true;
      }
      if (normalize(raw.orgNoTrainingNotPriority) === "yes") {
        notPriority += 1;
        hasAnswer = true;
      }
      if (normalize(raw.orgNoTrainingNotSure) === "yes") {
        notSure += 1;
        hasAnswer = true;
      }

      const otherVal = normalize(raw.orgNoTrainingOther);
      if (otherVal.length > 0 && otherVal !== "n/a") {
        other += 1;
        hasAnswer = true;
      }

      if (hasAnswer) numberOfRespondents += 1;
    });

    const items = [
      { label: "Lack of awareness", value: lackAwareness },
      { label: "Lack of understanding", value: lackUnderstanding },
      { label: "No demand from employees", value: noDemand },
      { label: "Limited budget/resources", value: limitedBudget },
      { label: "Not a priority", value: notPriority },
      { label: "Not sure", value: notSure },
      { label: "Other", value: other },
    ];

    // Sort ascending by value for horizontal chart
    items.sort((a, b) => a.value - b.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
      numberOfRespondents,
      totalEligible: filteredResponses.length,
    } as const;
  }, [surveyResponses]);

  const orgNoTrainingOtherTexts = useMemo(() => {
    return surveyResponses
      .map((r) => (r.raw.orgNoTrainingOther ?? "").trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== "n/a";
      });
  }, [surveyResponses]);

  const data = useMemo<Data[]>(
    () => [
      {
        // --- CONVERTED TO HORIZONTAL BAR ---
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
      margin: { t: 50, r: 40, b: 40, l: 200 }, // Adjusted margins
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        // Now the value axis
        title: {
          text: "Number of Respondents",
          font: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        // Now the category axis
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
    }),
    [tickColor]
  );

  const total = counts.numberOfRespondents;
  const responseRate =
    counts.totalEligible > 0
      ? Math.round((total / counts.totalEligible) * 100)
      : 0;

  const question = questionHeader;
  const description =
    "Shows the reasons why organizations do not offer training on sustainable digital solutions.";

  return (
    <>
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={total}
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
      {orgNoTrainingOtherTexts.length > 0 && (
        <GraphWrapper
          question={questionHeaderOther ?? ""}
          numberOfResponses={orgNoTrainingOtherTexts.length}
          responseRate={
            counts.totalEligible > 0
              ? (orgNoTrainingOtherTexts.length / counts.totalEligible) * 100
              : 0
          }
        >
          <div className="mt-4 h-[520px]">
            <ul
              className="h-[calc(100%-40px)] overflow-y-auto"
              style={{ color: tickColor }}
            >
              {orgNoTrainingOtherTexts.map((text, index) => (
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

export default NoTrainingReasons;
