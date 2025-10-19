import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

/**
 * Bar chart: Reasons the organization does not offer any/more training or resources
 * on sustainable digital solutions.
 *
 * Data columns used (boolean or text):
 * - orgNoTrainingLackAwareness
 * - orgNoTrainingLackUnderstanding
 * - orgNoTrainingNoDemand
 * - orgNoTrainingLimitedBudget
 * - orgNoTrainingNotPriority
 * - orgNoTrainingNotSure
 * - orgNoTrainingOther (counted if non-empty and not "n/a")
 */
const NoTrainingReasons = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

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

    surveyResponses.forEach((response) => {
      const raw = response.raw;

      if (normalize(raw.orgNoTrainingLackAwareness) === "yes")
        lackAwareness += 1;
      if (normalize(raw.orgNoTrainingLackUnderstanding) === "yes")
        lackUnderstanding += 1;
      if (normalize(raw.orgNoTrainingNoDemand) === "yes") noDemand += 1;
      if (normalize(raw.orgNoTrainingLimitedBudget) === "yes")
        limitedBudget += 1;
      if (normalize(raw.orgNoTrainingNotPriority) === "yes") notPriority += 1;
      if (normalize(raw.orgNoTrainingNotSure) === "yes") notSure += 1;

      const otherVal = normalize(raw.orgNoTrainingOther);
      if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
    });

    return {
      labels: [
        "Lack of awareness",
        "Lack of understanding",
        "No demand from employees",
        "Limited budget/resources",
        "Not a priority",
        "Not sure",
        "Other",
      ],
      values: [
        lackAwareness,
        lackUnderstanding,
        noDemand,
        limitedBudget,
        notPriority,
        notSure,
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
      margin: { t: 30, r: 0, b: 110, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Reasons why organizations don’t offer training/resources on sustainable digital solutions",
        font: { family: "Inter, sans-serif", size: 18, color: titleColor },
      },
      xaxis: {
        tickangle: -25,
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

export default NoTrainingReasons;
