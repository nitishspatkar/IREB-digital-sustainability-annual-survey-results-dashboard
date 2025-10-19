import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

/**
 * Bar chart: What additional support or resources would help you integrate digital sustainability into your work?
 *
 * Data columns used (boolean or text):
 * - supportNeedTheoretical
 * - supportNeedTutorials
 * - supportNeedCurricula
 * - supportNeedPractical
 * - supportNeedCaseStudies
 * - supportNeedStructures
 * - supportNeedTools
 * - supportNeedNone
 * - supportNeedOther (counted if non-empty and not "n/a")
 */
const AdditionalSupportResources = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const responses = useSurveyData();

  const counts = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? "";

    let theoretical = 0;
    let tutorials = 0;
    let curricula = 0;
    let practical = 0;
    let caseStudies = 0;
    let structures = 0;
    let tools = 0;
    let none = 0;
    let other = 0;

    responses.forEach((r) => {
      const raw = r.raw;
      if (norm(raw.supportNeedTheoretical) === "yes") theoretical += 1;
      if (norm(raw.supportNeedTutorials) === "yes") tutorials += 1;
      if (norm(raw.supportNeedCurricula) === "yes") curricula += 1;
      if (norm(raw.supportNeedPractical) === "yes") practical += 1;
      if (norm(raw.supportNeedCaseStudies) === "yes") caseStudies += 1;
      if (norm(raw.supportNeedStructures) === "yes") structures += 1;
      if (norm(raw.supportNeedTools) === "yes") tools += 1;
      if (norm(raw.supportNeedNone) === "yes") none += 1;

      const otherVal = norm(raw.supportNeedOther);
      if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
    });

    return {
      labels: [
        "Theoretical knowledge (self-study)",
        "Tutorials (training)",
        "Curricula (programs)",
        "Practical knowledge (how-to's)",
        "Positive case studies",
        "Structures (frameworks/standards)",
        "Tools (checklists/methods)",
        "No additional support needed",
        "Other",
      ],
      values: [
        theoretical,
        tutorials,
        curricula,
        practical,
        caseStudies,
        structures,
        tools,
        none,
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
      margin: { t: 30, r: 0, b: 120, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Support/resources needed to integrate digital sustainability",
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

export default AdditionalSupportResources;
