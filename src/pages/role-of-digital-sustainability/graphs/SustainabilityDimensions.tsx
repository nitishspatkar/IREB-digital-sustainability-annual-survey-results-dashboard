import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";
import GraphWrapper from "../../../components/GraphWrapper";

const SustainabilityDimensions = () => {
  const questionHeader =
    "Which dimensions of sustainability are actively considered in your organization's software development projects?";
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "considerOther"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const surveyResponses = useSurveyData();

  const counts = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

    let environmental = 0;
    let social = 0;
    let individual = 0;
    let economic = 0;
    let technical = 0;
    let other = 0;
    // --- ADDED "NOT SURE" (from screenshot Q21g) ---
    let notSure = 0;

    let respondentsWithAnyAnswer = 0;

    surveyResponses.forEach((response) => {
      const raw = response.raw;
      let hasAny = false;

      if (normalize(raw.considerEnvironmental) === "yes") {
        environmental += 1;
        hasAny = true;
      }
      if (normalize(raw.considerSocial) === "yes") {
        social += 1;
        hasAny = true;
      }
      if (normalize(raw.considerIndividual) === "yes") {
        individual += 1;
        hasAny = true;
      }
      if (normalize(raw.considerEconomic) === "yes") {
        economic += 1;
        hasAny = true;
      }
      if (normalize(raw.considerTechnical) === "yes") {
        technical += 1;
        hasAny = true;
      }
      if (normalize(raw.considerNotSure) === "yes") {
        notSure += 1;
        hasAny = true;
      }

      const otherVal = normalize(raw.considerOther);
      if (otherVal.length > 0 && otherVal !== "n/a") {
        other += 1;
        hasAny = true;
      }

      if (hasAny) {
        respondentsWithAnyAnswer += 1;
      }
    });

    const items = [
      { label: "Environmental", value: environmental },
      { label: "Social", value: social },
      { label: "Individual", value: individual },
      { label: "Economic", value: economic },
      { label: "Technical", value: technical },
      { label: "Not sure", value: notSure },
      { label: "Other", value: other },
    ];

    // Sort ascending by value
    items.sort((a, b) => a.value - b.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
      respondentsWithAnyAnswer,
    } as const;
  }, [surveyResponses]);

  const otherNotConsiderTexts = useMemo(() => {
    return surveyResponses
      .map((r) => (r.raw.considerOther ?? "").trim())
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
      margin: { t: 50, r: 40, b: 40, l: 120 }, // Adjusted margins
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

  const numberOfRespondents = counts.respondentsWithAnyAnswer;

  const responseRate =
    surveyResponses.length > 0
      ? (numberOfRespondents / surveyResponses.length) * 100
      : 0;

  console.log(numberOfRespondents);
  console.log(surveyResponses.length);

  const question = questionHeader;
  const description =
    "Shows which dimensions of sustainability are actively considered in software development projects.";

  return (
    <>
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={numberOfRespondents}
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
      {otherNotConsiderTexts.length > 0 && (
        <GraphWrapper
          question={questionHeaderOther ?? ""}
          numberOfResponses={otherNotConsiderTexts.length}
          responseRate={
            surveyResponses.length > 0
              ? (otherNotConsiderTexts.length / surveyResponses.length) * 100
              : 0
          }
        >
          <div className="mt-4 h-[520px]">
            <ul
              className="h-[calc(100%-40px)] overflow-y-auto"
              style={{ color: tickColor }}
            >
              {otherNotConsiderTexts.map((text, index) => (
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

export default SustainabilityDimensions;
