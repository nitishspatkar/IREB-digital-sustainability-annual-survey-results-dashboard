import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

/**
 * Bar chart: Does your organization offer training or resources to employees on sustainable software development practices?
 * Maps column `organizationOffersTraining` to counts by option.
 * Expected values include: "Yes", "No", "Not sure" (case-insensitive). Unknown/empty are grouped as "Unknown".
 */
const OrganizationOffersTraining = () => {
  const barColor = useThemeColor("--color-plum-400");
  const titleColor = useThemeColor("--color-ink-900");
  const tickColor = useThemeColor("--color-ink-700");

  const responses = useSurveyData();

  const counts = useMemo(() => {
    const norm = (v: string) => (v ?? "").trim().toLowerCase();

    let yes = 0;
    let no = 0;
    let notSure = 0;
    let unknown = 0;

    responses.forEach((r) => {
      const v = norm(r.raw.organizationOffersTraining as unknown as string);
      if (v === "yes") yes += 1;
      else if (v === "no") no += 1;
      else if (v === "not sure") notSure += 1;
      else if (v === "") {
        // empty -> ignore completely (do not count respondent)
        return;
      } else if (v !== "n/a") {
        // Any other free text or unexpected value -> Unknown bucket
        unknown += 1;
      }
    });

    const labels: string[] = ["Yes", "No", "Not sure"];
    const values: number[] = [yes, no, notSure];
    if (unknown > 0) {
      labels.push("Unknown");
      values.push(unknown);
    }
    return { labels, values } as const;
  }, [responses]);

  const data = useMemo<Data[]>(
    () => [
      {
        x: counts.labels,
        y: counts.values,
        type: "bar",
        marker: { color: barColor },
        hoverinfo: "none",
      },
    ],
    [counts, barColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 80, l: 48 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Does your organization offer sustainability training/resources?",
        font: { family: "Inter, sans-serif", size: 18, color: titleColor },
      },
      xaxis: {
        tickangle: -10,
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

  const total = counts.values.reduce((a, b) => a + b, 0);

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {total === 0 ? (
        <div className="flex h-full items-center justify-center text-ink-700">
          No data available
        </div>
      ) : (
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default OrganizationOffersTraining;
