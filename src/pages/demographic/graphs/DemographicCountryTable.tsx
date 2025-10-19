import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import type { RespondentStat } from "../demographicTypes";
import useThemeColor from "../../../hooks/useThemeColor";

type DemographicCountryTableProps = {
  respondentStats: RespondentStat[];
};

const DemographicCountryTable = ({
  respondentStats,
}: DemographicCountryTableProps) => {
  const tableHeaderFillColor = useThemeColor("--color-lavender-50");
  const tableCellFillColor = useThemeColor("--color-lavender-100");
  const headerFontColor = useThemeColor("--color-ink-900");
  const cellFontColor = useThemeColor("--color-ink-700");
  const titleColor = useThemeColor("--color-ink-900");

  const tableData = useMemo<Data[]>(
    () => [
      {
        type: "table",
        columnwidth: [250, 100],
        header: {
          values: ["Country", "Respondents"],
          align: ["left", "right"],
          fill: {
            color: tableHeaderFillColor,
          },
          font: {
            family: "Inter, sans-serif",
            size: 14,
            color: headerFontColor,
            weight: 600,
          },
          line: {
            color: "rgba(148, 163, 184, 0.4)",
            width: 1,
          },
        },
        cells: {
          values: [
            respondentStats.map((item) => item.country),
            respondentStats.map((item) => item.count),
          ],
          align: ["left", "right"],
          fill: {
            color: tableCellFillColor,
          },
          font: {
            family: "Inter, sans-serif",
            size: 13,
            color: cellFontColor,
          },
          line: {
            color: "rgba(148, 163, 184, 0.2)",
            width: 1,
          },
          height: 28,
        },
        hoverinfo: "skip",
      },
    ],
    [
      respondentStats,
      tableHeaderFillColor,
      tableCellFillColor,
      headerFontColor,
      cellFontColor,
    ]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 30, r: 0, b: 0, l: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: {
        text: "Respondents by Country (Table)",
        font: {
          family: "Inter, sans-serif",
          size: 18,
          color: titleColor,
        },
      },
    }),
    [titleColor]
  );

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Plot
        data={tableData}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DemographicCountryTable;
