import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const SustainabilityDimensions = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const surveyResponses = useSurveyData();

  const counts = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

    let environmental = 0;
    let social = 0;
    let individual = 0;
    let economic = 0;
    let technical = 0;
    let other = 0;

    surveyResponses.forEach((response) => {
      const raw = response.raw;

      if (normalize(raw.considerEnvironmental) === "yes") environmental += 1;
      if (normalize(raw.considerSocial) === "yes") social += 1;
      if (normalize(raw.considerIndividual) === "yes") individual += 1;
      if (normalize(raw.considerEconomic) === "yes") economic += 1;
      if (normalize(raw.considerTechnical) === "yes") technical += 1;

      const otherVal = normalize(raw.considerOther);
      if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
    });

    return {
      labels: [
        "Environmental",
        "Social",
        "Individual",
        "Economic",
        "Technical",
        "Other",
      ],
      values: [environmental, social, individual, economic, technical, other],
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
      margin: { t: 30, r: 0, b: 80, l: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Sustainability Dimensions in Software Development Projects",
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

export default SustainabilityDimensions;
