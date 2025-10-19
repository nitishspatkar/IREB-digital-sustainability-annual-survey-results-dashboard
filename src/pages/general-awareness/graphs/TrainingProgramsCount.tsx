import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type CountStat = {
  label: string;
  sortKey: number;
  count: number;
};

const normalize = (v: string) => v.replace(/\s+/g, " ").trim();

function categorizeCount(
  rawValue: string
): { label: string; sortKey: number } | null {
  const value = normalize(rawValue);
  if (!value || value.toLowerCase() === "n/a") return null;

  // Exact integer like "0", "1", "2"
  if (/^\d+$/.test(value)) {
    const n = Number(value);
    return { label: String(n), sortKey: n };
  }

  const lower = value.toLowerCase();

  // Patterns like "6+", "+6", "more than 6", ">6"
  const plusMatch = value.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const n = Number(plusMatch[1]);
    return { label: `${n}+`, sortKey: n + 0.001 }; // ensure it appears after exact n if present
  }
  const moreThanMatch = lower.match(/more than\s*(\d+)/);
  if (moreThanMatch) {
    const n = Number(moreThanMatch[1]);
    return { label: `${n + 1}+`, sortKey: n + 1 + 0.001 };
  }
  const greaterThanMatch = value.match(/>\s*(\d+)/);
  if (greaterThanMatch) {
    const n = Number(greaterThanMatch[1]);
    return { label: `${n + 1}+`, sortKey: n + 1 + 0.001 };
  }

  // Ranges like "2-3", "2 – 3"
  const rangeMatch = value.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return { label: `${lo}-${hi}`, sortKey: lo + (hi - lo) / 100 };
  }

  // Fallback: extract any first number and use it, otherwise keep the label as-is
  const firstNum = value.match(/(\d+)/);
  if (firstNum) {
    const n = Number(firstNum[1]);
    return { label: value, sortKey: n };
  }

  // Unknown format, keep but sort last
  return { label: value, sortKey: Number.POSITIVE_INFINITY };
}

const TrainingProgramsCount = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const responses = useSurveyData();

  const stats = useMemo<CountStat[]>(() => {
    const counts = new Map<string, CountStat>();

    const participants = responses.filter(
      (r) =>
        normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
    );

    participants.forEach((r) => {
      const cat = categorizeCount(r.raw.trainingCount ?? "");
      if (!cat) return;
      const key = cat.label;
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: cat.label, sortKey: cat.sortKey, count: 1 });
      }
    });

    return Array.from(counts.values()).sort((a, b) => a.sortKey - b.sortKey);
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
      margin: { t: 30, r: 0, b: 80, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "How many trainings did you attend? (Participants Only)",
        font: { family: "Inter, sans-serif", size: 18, color: titleColor },
      },
      xaxis: {
        title: {
          text: "Number of trainings",
          font: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        tickangle: -30,
        tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        title: {
          text: "Number of respondents",
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

export default TrainingProgramsCount;
