import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";

const SustainabilityDimensionsInTasks = () => {
  const questionHeader =
    "Which sustainability dimensions do you consider in your role-specific tasks?";
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "roleConsiderOther"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const responses = useSurveyData();

  const counts = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? "";

    let environmental = 0;
    let social = 0;
    let individual = 0;
    let economic = 0;
    let technical = 0;
    let other = 0;

    // --- Precondition: Q28 = Yes ---
    const filteredResponses = responses.filter(
      (r) => norm(r.raw.personIncorporatesSustainability) === "yes"
    );

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      if (norm(raw.roleConsiderEnvironmental) === "yes") environmental += 1;
      if (norm(raw.roleConsiderSocial) === "yes") social += 1;
      if (norm(raw.roleConsiderIndividual) === "yes") individual += 1;
      if (norm(raw.roleConsiderEconomic) === "yes") economic += 1;
      if (norm(raw.roleConsiderTechnical) === "yes") technical += 1;

      const otherVal = norm(raw.roleConsiderOther);
      if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
    });

    const items = [
      { label: "Environmental", value: environmental },
      { label: "Social", value: social },
      { label: "Individual", value: individual },
      { label: "Economic", value: economic },
      { label: "Technical", value: technical },
      { label: "Other", value: other },
    ];

    // Sort ascending by value for horizontal chart
    items.sort((a, b) => a.value - b.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
    } as const;
  }, [responses]);

  const roleOtherTexts = useMemo(() => {
    return responses
      .map((r) => (r.raw.roleConsiderOther ?? "").trim())
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
      margin: { t: 50, r: 40, b: 60, l: 120 }, // Adjusted margins
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

  const numberOfResponses = counts.values.reduce((a, b) => a + b, 0);
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? Math.round((numberOfResponses / totalResponses) * 100)
      : 0;

  const question = questionHeader;
  const description =
    "Shows which sustainability dimensions respondents consider in their role-specific tasks.";

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
      {roleOtherTexts.length > 0 && (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg text-center" style={{ color: tickColor }}>
            {questionHeaderOther}
          </h3>
          <div className="mt-4 h-[520px]">
            <ul
              className="h-[calc(100%-40px)] overflow-y-auto"
              style={{ color: tickColor }}
            >
              {roleOtherTexts.map((text, index) => (
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
        </div>
      )}
    </>
  );
};

export default SustainabilityDimensionsInTasks;
