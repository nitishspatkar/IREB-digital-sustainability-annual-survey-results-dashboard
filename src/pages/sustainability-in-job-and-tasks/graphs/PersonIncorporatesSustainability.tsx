import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const PersonIncorporatesSustainability = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "personIncorporatesSustainability"
  )?.header;
  const yesColor = useThemeColor("--color-ireb-spring");
  const noColor = useThemeColor("--color-ireb-mandarin");
  const tickColor = useThemeColor("--color-ireb-grey-01");

  const responses = useSurveyData();

  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("Yes", 0);
    counts.set("No", 0);

    responses.forEach((r) => {
      // Key for Q28
      const raw = normalize(r.raw.personIncorporatesSustainability ?? "");
      const lower = raw.toLowerCase();

      if (lower === "yes") {
        counts.set("Yes", (counts.get("Yes") ?? 0) + 1);
      } else if (lower === "no") {
        counts.set("No", (counts.get("No") ?? 0) + 1);
      }
    });

    const labels = ["Yes", "No"];
    return {
      labels,
      values: labels.map((label) => counts.get(label) ?? 0),
    };
  }, [responses]);

  const data = useMemo<Data[]>(
    () => [
      {
        x: stats.labels,
        y: stats.values,
        type: "bar",
        marker: {
            color: stats.labels.map((label) => {
                if (label === "Yes") {
                    return yesColor;
                } else if (label === "No") {
                    return noColor;
                }
            }),
        },
        text: stats.values.map((v) => v.toString()),
        textposition: "outside",
        textfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: "none",
      },
    ],
    [stats, yesColor, noColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 20, b: 60, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
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
    [tickColor]
  );

  const numberOfResponses = stats.values.reduce((a, b) => a + b, 0);
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? (numberOfResponses / totalResponses) * 100
      : 0;

  const question =
    questionHeader ??
    "Do you incorporate digital sustainability in your role-related tasks?";
  const description =
    "Shows the proportion of respondents who incorporate digital sustainability in their tasks.";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </GraphWrapper>
  );
};

export default PersonIncorporatesSustainability;
