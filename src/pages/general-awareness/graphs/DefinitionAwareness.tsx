import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

type AwarenessStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const DefinitionAwareness = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "heardOfDigitalSustainabilityDefinition"
  )?.header;
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const responses = useSurveyData();

  const stats = useMemo<AwarenessStat[]>(() => {
    const counts = new Map<string, number>();
    counts.set("Yes", 0);
    counts.set("No", 0);

    responses.forEach((r) => {
      const raw = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? "");
      const lower = raw.toLowerCase();

      if (lower === "yes") {
        counts.set("Yes", (counts.get("Yes") ?? 0) + 1);
      } else if (lower === "no") {
        counts.set("No", (counts.get("No") ?? 0) + 1);
      }
    });

    return [
      { label: "Yes", count: counts.get("Yes") ?? 0 },
      { label: "No", count: counts.get("No") ?? 0 },
    ];
  }, [responses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: "bar",
        marker: {
          color: barColor,
        },
        // --- CHANGES START HERE ---
        text: stats.map((s) => s.count.toString()),
        textposition: "outside",
        textfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        // --- CHANGES END HERE ---
        hoverinfo: "none",
      },
    ];
  }, [stats, barColor, tickColor]); // Added tickColor

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 60, l: 48 }, // t: 60 is already good
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
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

  const numberOfResponses = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? (numberOfResponses / totalResponses) * 100
      : 0;

  const question =
    questionHeader ?? "Have you heard of the term 'digital sustainability'?";

  return (
    <GraphWrapper
      question={"Have you heard of the term 'digital sustainability'?"}
      description={
        question
      } /* the question is wayyy to long, so for now we put it into the description */
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

export default DefinitionAwareness;
