import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";

const HindrancesToIncorporateSustainability = () => {
  const questionHeader =
    "What hinders you from incorporating sustainability in your role-specific tasks?";
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "hindranceOther"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const responses = useSurveyData();

  const counts = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? "";

    let lackInterest = 0;
    let lackKnowledge = 0;
    let limitedResources = 0;
    let financialConstraints = 0;
    let insufficientTime = 0;
    let lackSupport = 0;
    let complexity = 0;
    let culturalBarriers = 0;
    let stakeholderResistance = 0;
    let other = 0;

    // --- Precondition: Q28 = No ---
    const filteredResponses = responses.filter(
      (r) => norm(r.raw.personIncorporatesSustainability) === "no"
    );

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      if (norm(raw.hindranceLackInterest) === "yes") lackInterest += 1;
      if (norm(raw.hindranceLackKnowledge) === "yes") lackKnowledge += 1;
      if (norm(raw.hindranceLimitedResources) === "yes") limitedResources += 1;
      if (norm(raw.hindranceFinancialConstraints) === "yes")
        financialConstraints += 1;
      if (norm(raw.hindranceInsufficientTime) === "yes") insufficientTime += 1;
      if (norm(raw.hindranceLackSupport) === "yes") lackSupport += 1;
      if (norm(raw.hindranceComplexity) === "yes") complexity += 1;
      if (norm(raw.hindranceCulturalBarriers) === "yes") culturalBarriers += 1;
      if (norm(raw.hindranceStakeholderResistance) === "yes")
        stakeholderResistance += 1;

      const otherVal = norm(raw.hindranceOther);
      if (otherVal === "yes" || (otherVal.length > 0 && otherVal !== "n/a"))
        other += 1;
    });

    const items = [
      { label: "Lack of personal interest", value: lackInterest },
      { label: "Lack of knowledge or awareness", value: lackKnowledge },
      { label: "Limited resources or budget", value: limitedResources },
      { label: "Financial constraints", value: financialConstraints },
      {
        label: "Insufficient time or competing priorities",
        value: insufficientTime,
      },
      {
        label: "Lack of organizational or leadership support",
        value: lackSupport,
      },
      { label: "Complexity or uncertainty of solutions", value: complexity },
      { label: "Cultural or social barriers", value: culturalBarriers },
      { label: "Resistance from stakeholders", value: stakeholderResistance },
      { label: "Other", value: other },
    ];

    // Sort ascending by value
    items.sort((a, b) => a.value - b.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
    } as const;
  }, [responses]);

  const hindranceOtherTexts = useMemo(() => {
    return responses
      .map((r) => (r.raw.hindranceOther ?? "").trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== "n/a";
      });
  }, [responses]);

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
      margin: { t: 50, r: 40, b: 60, l: 300 }, // Wide left margin
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
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? Math.round((numberOfResponses / totalResponses) * 100)
      : 0;

  const question = questionHeader;
  const description =
    "Shows barriers preventing respondents from incorporating sustainability in their tasks.";

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
      {hindranceOtherTexts.length > 0 && (
        <GraphWrapper
          question={questionHeaderOther ?? ""}
          numberOfResponses={hindranceOtherTexts.length}
          responseRate={100}
        >
          <div className="mt-4 h-[520px]">
            <ul
              className="h-[calc(100%-40px)] overflow-y-auto"
              style={{ color: tickColor }}
            >
              {hindranceOtherTexts.map((text, index) => (
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

export default HindrancesToIncorporateSustainability;
