import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

interface RoleStat {
  role: string;
  count: number;
}

const normalizeRole = (value: string) => value.replace(/\s+/g, " ").trim();

const DemographicOrganizationalRole = () => {
  const chartBarColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");
  const surveyResponses = useSurveyData();

  const roleStats = useMemo<RoleStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const role = normalizeRole(response.raw.role ?? "");
      if (role.length > 0 && role.toLowerCase() !== "n/a") {
        counts.set(role, (counts.get(role) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: roleStats.map((item) => item.count),
        y: roleStats.map((item) => item.role),
        type: "bar",
        orientation: "h",
        marker: {
          color: chartBarColor,
        },
        hoverinfo: "none",
      },
    ];
  }, [roleStats, chartBarColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 20, b: 40, l: 200 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Current Role in Organization",
        font: {
          family: "Inter, sans-serif",
          size: 18,
          color: titleColor,
        },
      },
      xaxis: {
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        title: {
          text: "Number of Respondents",
          font: {
            family: "Inter, sans-serif",
            size: 12,
            color: tickColor,
          },
        },
      },
      yaxis: {
        tickfont: {
          family: "Inter, sans-serif",
          size: 11,
          color: tickColor,
        },
        automargin: true,
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

export default DemographicOrganizationalRole;
