import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

/**
 * Bar chart: What hinders you from incorporating sustainability in your role-specific tasks?
 *
 * Data columns used (boolean or text):
 * - hindranceLackInterest
 * - hindranceLackKnowledge
 * - hindranceLimitedResources
 * - hindranceFinancialConstraints
 * - hindranceInsufficientTime
 * - hindranceLackSupport
 * - hindranceComplexity
 * - hindranceCulturalBarriers
 * - hindranceStakeholderResistance
 * - hindranceOther (counted if value is "yes" OR non-empty and not "n/a")
 */
const HindrancesToIncorporateSustainability = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

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

    responses.forEach((r) => {
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

    return {
      labels: [
        "Lack of personal interest",
        "Lack of knowledge or awareness",
        "Limited resources or budget",
        "Financial constraints",
        "Insufficient time or competing priorities",
        "Lack of organizational or leadership support",
        "Complexity or uncertainty of solutions",
        "Cultural or social barriers",
        "Resistance from stakeholders",
        "Other",
      ],
      values: [
        lackInterest,
        lackKnowledge,
        limitedResources,
        financialConstraints,
        insufficientTime,
        lackSupport,
        complexity,
        culturalBarriers,
        stakeholderResistance,
        other,
      ],
    } as const;
  }, [responses]);

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
        text: "What hinders you from incorporating sustainability in role-specific tasks?",
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

export default HindrancesToIncorporateSustainability;
