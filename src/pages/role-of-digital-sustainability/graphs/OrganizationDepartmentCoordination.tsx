import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import GraphWrapper from "../../../components/GraphWrapper";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const OrganizationDepartmentCoordination = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "organizationDepartmentCoordination"
  )?.header;
  const yesColor = useThemeColor("--color-ireb-spring");
  const noColor = useThemeColor("--color-ireb-mandarin");
  const barColor = useThemeColor("--color-ireb-grey-02");
  const tickColor = useThemeColor("--color-ireb-grey-01");

  const responses = useSurveyData();

  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("Yes", 0);
    counts.set("No", 0);
    counts.set("Not sure", 0);

    // --- Precondition: Q17 = Yes ---
    const filteredResponses = responses.filter(
      (r) =>
        normalize(
          r.raw.organizationIncorporatesSustainablePractices ?? ""
        ).toLowerCase() === "yes"
    );

    filteredResponses.forEach((r) => {
      // Key for Q20
      const raw = normalize(r.raw.organizationDepartmentCoordination ?? "");
      const lower = raw.toLowerCase();

      if (lower === "yes") {
        counts.set("Yes", (counts.get("Yes") ?? 0) + 1);
      } else if (lower === "no") {
        counts.set("No", (counts.get("No") ?? 0) + 1);
      } else if (lower === "not sure") {
        counts.set("Not sure", (counts.get("Not sure") ?? 0) + 1);
      }
    });

    const labels = ["Yes", "No", "Not sure"];
    return {
      labels,
      values: labels.map((label) => counts.get(label) ?? 0),
      totalEligible: filteredResponses.length,
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
                } else {
                    return barColor;
                }
            }),
        },
        text: stats.values.map((v) => v.toString()),
        textposition: "outside",
        textfont: {
          family: "PP Mori, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: "none",
      },
    ],
    [stats, barColor, yesColor, noColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 20, b: 60, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        tickfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        title: {
          text: "Number of Respondents",
          font: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
        },
        tickfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
      },
    }),
    [tickColor]
  );

  const total = stats.values.reduce((a, b) => a + b, 0);
  const responseRate =
    stats.totalEligible > 0
      ? (total / stats.totalEligible) * 100
      : 0;

  const question =
    questionHeader ??
    "Is there coordination between departments on sustainability goals?";
  const description =
    "Shows whether organizations coordinate between departments on sustainability goals (filtered for organizations with goals).";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={total}
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

export default OrganizationDepartmentCoordination;
