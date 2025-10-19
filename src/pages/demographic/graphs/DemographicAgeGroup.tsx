import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import type { AgeGroupStat } from "../demographicTypes";
import useThemeColor from "../../../hooks/useThemeColor";

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, " ").trim();

const DemographicAgeGroup = () => {
  const chartBarColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");
  const surveyResponses = useSurveyData();

  const ageGroupStats = useMemo<AgeGroupStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? "");
      if (ageGroup.length > 0 && ageGroup.toLowerCase() !== "n/a") {
        counts.set(ageGroup, (counts.get(ageGroup) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const chartData = useMemo<Data[]>(() => {
    const sortedStats = [...ageGroupStats].sort((a, b) => {
      const aMatch = a.ageGroup.match(/^(\d+)/);
      const bMatch = b.ageGroup.match(/^(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }

      return a.ageGroup.localeCompare(b.ageGroup);
    });

    return [
      {
        x: sortedStats.map((item) => item.ageGroup),
        y: sortedStats.map((item) => item.count),
        type: "bar",
        marker: {
          color: chartBarColor,
        },
        hoverinfo: "none",
      },
    ];
  }, [ageGroupStats, chartBarColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 80, l: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Respondents by Age Group",
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

export default DemographicAgeGroup;
