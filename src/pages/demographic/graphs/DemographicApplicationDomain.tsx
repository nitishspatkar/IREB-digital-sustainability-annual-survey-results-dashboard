import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const normalizeApplicationDomain = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const DemographicApplicationDomain = () => {
  const chartBarColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");
  const surveyResponses = useSurveyData();

  const applicationDomainStats = useMemo(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const primaryDomain = normalizeApplicationDomain(
        response.raw.primaryApplicationDomain ?? ""
      );
      const otherDomain = normalizeApplicationDomain(
        response.raw.primaryApplicationDomainOther ?? ""
      );

      // Use the "Other" field if primary domain is "Other" and there's a value
      const domain =
        primaryDomain.toLowerCase() === "other" && otherDomain.length > 0
          ? otherDomain
          : primaryDomain;

      if (domain.length > 0 && domain.toLowerCase() !== "n/a") {
        counts.set(domain, (counts.get(domain) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: applicationDomainStats.map((item) => item.domain),
        y: applicationDomainStats.map((item) => item.count),
        type: "bar",
        marker: {
          color: chartBarColor,
        },
        hoverinfo: "none",
      },
    ];
  }, [applicationDomainStats, chartBarColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 120, l: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Application Domain of Respondents",
        font: {
          family: "Inter, sans-serif",
          size: 18,
          color: titleColor,
        },
      },
      xaxis: {
        tickangle: -45,
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
      },
      yaxis: {
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
      },
    }),
    [titleColor, tickColor]
  );

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Plot
        data={chartData}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DemographicApplicationDomain;
