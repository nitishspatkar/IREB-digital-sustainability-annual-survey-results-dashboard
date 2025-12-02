import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";

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

  if (/^\d+$/.test(value)) {
    const n = Number(value);
    return { label: String(n), sortKey: n };
  }

  const lower = value.toLowerCase();

  const plusMatch = value.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const n = Number(plusMatch[1]);
    return { label: value, sortKey: n + 0.001 };
  }
  const moreThanMatch = lower.match(/more than\s*(\d+)/);
  if (moreThanMatch) {
    const n = Number(moreThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }
  const greaterThanMatch = value.match(/>\s*(\d+)/);
  if (greaterThanMatch) {
    const n = Number(greaterThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }

  const rangeMatch = value.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return { label: value, sortKey: lo + (hi - lo) / 100 };
  }

  const firstNum = value.match(/(\d+)/);
  if (firstNum) {
    const n = Number(firstNum[1]);
    return { label: value, sortKey: n };
  }

  return { label: value, sortKey: Number.POSITIVE_INFINITY };
}

const TrainingProgramsCount = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "trainingCount"
  )?.header;
  const barColor = useThemeColor("--color-ireb-berry");
  const titleColor = useThemeColor("--color-ireb-grey-01");
  const tickColor = useThemeColor("--color-ireb-grey-01");

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
        text: stats.map((s) => s.count.toString()),
        textposition: "outside",
        textfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: "none",
      },
    ];
  }, [stats, barColor, tickColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 48 }, // Changed b: 80 to b: 60
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        type: "category",
        title: {
          text: "Number of trainings",
          font: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        // --- REMOVED tickangle: -30 ---
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

  const participants = responses.filter(
    (r) => normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
  );
  const numberOfResponses = participants.length;
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? (numberOfResponses / totalResponses) * 100
      : 0;

  const question =
    questionHeader?.replace("times", "") ?? "How many training programs have you attended?";
  const description =
    "Distribution of the number of training programs attended by respondents.";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={chartData}
          layout={layout}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </GraphWrapper>
  );
};

export default TrainingProgramsCount;
