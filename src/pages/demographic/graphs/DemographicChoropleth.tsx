import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import type { RespondentStat } from "../demographicTypes";
import useThemeColor from "../../../hooks/useThemeColor";

type DemographicChoroplethProps = {
  respondentStats: RespondentStat[];
};

const DemographicChoropleth = ({
  respondentStats,
}: DemographicChoroplethProps) => {
  const titleColor = useThemeColor("--color-ink-900");
  const landColor = useThemeColor("--color-lavender-50");
  const coastlineColor = useThemeColor("--color-ink-900");
  const lakeColor = useThemeColor("--color-lavender-100");
  const markerLineColor = useThemeColor("--color-lavender-100");
  const choroplethData = useMemo<Data[]>(
    () => [
      {
        type: "choropleth",
        locationmode: "country names",
        locations: respondentStats.map((item) => item.country),
        z: respondentStats.map((item) => item.count),
        text: respondentStats.map(
          (item) => `${item.country}: ${item.count} respondents`
        ),
        hovertemplate: "%{text}<extra></extra>",
        colorscale: "YlGnBu",
        marker: {
          line: {
            width: 0.5,
            color: markerLineColor,
          },
        },
        colorbar: {
          title: {
            text: "Respondents",
          },
        },
      },
    ],
    [respondentStats, markerLineColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      geo: {
        scope: "world",
        projection: {
          type: "natural earth",
        },
        showcoastlines: true,
        coastlinecolor: coastlineColor,
        landcolor: landColor,
        bgcolor: "rgba(0,0,0,0)",
        lakecolor: lakeColor,
      },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { t: 40, r: 0, l: 0, b: 0 },
      title: {
        text: "Respondents by Country",
        font: {
          family: "Inter, sans-serif",
          size: 20,
          color: titleColor,
        },
      },
    }),
    [titleColor, landColor, coastlineColor, lakeColor]
  );

  return (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Plot
        data={choroplethData}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DemographicChoropleth;
