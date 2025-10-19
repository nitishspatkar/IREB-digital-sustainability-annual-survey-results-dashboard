import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type DiscussionFrequencyStat = {
  frequency: string;
  count: number;
};

const normalizeFrequency = (value: string) => value.replace(/\s+/g, " ").trim();

const DiscussionFrequency = () => {
  const chartBarColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");
  const surveyResponses = useSurveyData();

  const frequencyStats = useMemo<DiscussionFrequencyStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const frequency = normalizeFrequency(
        response.raw.discussionFrequency ?? ""
      );
      if (
        frequency.length > 0 &&
        frequency.toLowerCase() !== "n/a" &&
        !frequency.toLowerCase().includes("other")
      ) {
        counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([frequency, count]) => ({ frequency, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const chartData = useMemo<Data[]>(() => {
    // Define the expected order for frequency responses
    const frequencyOrder = [
      "Daily",
      "Weekly",
      "Monthly",
      "Quarterly",
      "Rarely",
      "Never",
    ];

    // Sort the stats based on the predefined order
    const sortedStats = [...frequencyStats].sort((a, b) => {
      const aIndex = frequencyOrder.indexOf(a.frequency);
      const bIndex = frequencyOrder.indexOf(b.frequency);

      // If both are in the predefined order, sort by index
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one is in the order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // Otherwise, sort alphabetically
      return a.frequency.localeCompare(b.frequency);
    });

    return [
      {
        x: sortedStats.map((item) => item.frequency),
        y: sortedStats.map((item) => item.count),
        type: "bar",
        marker: {
          color: chartBarColor,
        },
        hoverinfo: "none",
      },
    ];
  }, [frequencyStats, chartBarColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 80, l: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Discussion Frequency in Professional Environment",
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
        title: {
          text: "Number of Respondents",
          font: {
            family: "Inter, sans-serif",
            size: 12,
            color: tickColor,
          },
        },
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

export default DiscussionFrequency;
