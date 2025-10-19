import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type SatisfactionStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingSatisfaction = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const responses = useSurveyData();

  const stats = useMemo<SatisfactionStat[]>(() => {
    const counts = new Map<string, number>();

    const participants = responses.filter(
      (r) =>
        normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
    );

    participants.forEach((r) => {
      const raw = normalize(r.raw.trainingSatisfaction ?? "");
      if (!raw || raw.toLowerCase() === "n/a") return;

      // Standardize likely values
      let key = raw;
      const lower = raw.toLowerCase();
      if (lower === "yes" || lower === "satisfied") key = "Yes";
      else if (lower === "no" || lower === "not satisfied") key = "No";
      else if (lower.includes("not sure") || lower === "unsure")
        key = "Not sure";

      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const order = ["Yes", "No", "Not sure"]; // desired category order
    const items = Array.from(counts.entries()).map(([label, count]) => ({
      label,
      count,
    }));

    // Ensure all expected categories exist (for consistent axis)
    order.forEach((label) => {
      if (!counts.has(label)) items.push({ label, count: 0 });
    });

    return items.sort(
      (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
    );
  }, [responses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: "bar",
        marker: { color: barColor },
        hoverinfo: "none",
      },
    ];
  }, [stats, barColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 60, l: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Satisfaction with Number of Trainings (Participants Only)",
        font: { family: "Inter, sans-serif", size: 18, color: titleColor },
      },
      xaxis: {
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

  const total = stats.reduce((a, b) => a + b.count, 0);

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {total === 0 ? (
        <div className="flex h-full items-center justify-center text-ink-700">
          No data available
        </div>
      ) : (
        <Plot
          data={chartData}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default TrainingSatisfaction;
