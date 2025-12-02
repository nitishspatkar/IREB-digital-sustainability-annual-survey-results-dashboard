import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import type { RespondentStat } from "../demographicTypes";

type DemographicCountryTableProps = {
  respondentStats: RespondentStat[];
};

const DemographicCountryTable = ({
  respondentStats,
}: DemographicCountryTableProps) => {
  const tableHeaderFillColor = useThemeColor("--color-ireb-light-berry");
  const tableCellFillColor = useThemeColor("--color-ireb-superlight-berry");
  const headerFontColor = useThemeColor("--color-ireb-grey-01");
  const cellFontColor = useThemeColor("--color-ireb-grey-01");
  const surveyResponses = useSurveyData();

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
    }),
    []
  );

  const numberOfResponses = respondentStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );
  const totalResponses = surveyResponses.length;
  const responseRate =
    totalResponses > 0
      ? (numberOfResponses / totalResponses) * 100
      : 0;

  const question =
    columnDefinitions.find((c) => c.key === "countryOfResidence")?.header ??
    "What is your current country of residence?";
  const description =
    "Tabulates how many respondents we received from each country.";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={tableData}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </GraphWrapper>
  );
};

export default DemographicCountryTable;
