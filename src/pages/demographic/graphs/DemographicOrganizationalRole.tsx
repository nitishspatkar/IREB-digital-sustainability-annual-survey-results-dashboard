import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

interface RoleStat {
  role: string;
  count: number;
}

const normalizeRole = (value: string) => value.replace(/\s+/g, " ").trim();

const DemographicOrganizationalRole = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "role"
  )?.header;
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "roleOther"
  )?.header;
  const chartBarColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");
  const surveyResponses = useSurveyData();

  const roleStats = useMemo<RoleStat[]>(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const role = normalizeRole(response.raw.role ?? "");
      if (role.length > 0 && role.toLowerCase() !== "n/a") {
        counts.set(role, (counts.get(role) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => a.count - b.count);
  }, [surveyResponses]);

  const otherRoleTexts = useMemo(() => {
    return surveyResponses
      .map((response) => normalizeRole(response.raw.roleOther ?? ""))
      .filter((value) => value.length > 0);
  }, [surveyResponses]);

  const numberOfResponses = roleStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );
  const totalResponses = surveyResponses.length;
  const responseRate =
    totalResponses > 0
      ? Math.round((numberOfResponses / totalResponses) * 100)
      : 0;

  const chartData = useMemo<Data[]>(
    () => [
      {
        x: roleStats.map((item) => item.count),
        y: roleStats.map((item) => item.role),
        type: "bar",
        orientation: "h",
        marker: { color: chartBarColor },
        text: roleStats.map((item) => item.count.toString()),
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
    [roleStats, chartBarColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 40, l: 200 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        title: {
          text: "Number of Respondents",
          font: {
            family: "Inter, sans-serif",
            size: 12,
            color: tickColor,
          },
        },
      },
      yaxis: {
        tickfont: {
          family: "Inter, sans-serif",
          size: 11,
          color: tickColor,
        },
        automargin: true,
      },
    }),
    [tickColor]
  );

  const question =
    questionHeader ??
    "Which of the following best describes your current role in the organization?";
  const description =
    "Shows how respondents distribute across the provided organizational role options.";

  const otherResponses = otherRoleTexts.length;
  const otherResponseRate =
    totalResponses > 0
      ? Math.round((otherResponses / totalResponses) * 100)
      : 0;
  const otherQuestion =
    questionHeaderOther ??
    "Which of the following best describes your current role in the organization? [Other]";
  const otherDescription =
    "Lists the free-text role descriptions supplied under the Other option.";

  return (
    <>
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
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </GraphWrapper>

      {otherRoleTexts.length > 0 && (
        <GraphWrapper
          question={otherQuestion}
          description={otherDescription}
          numberOfResponses={otherResponses}
          responseRate={otherResponseRate}
        >
          <div className="h-[520px] overflow-y-auto">
            <ul style={{ color: tickColor }}>
              {otherRoleTexts.map((text, index) => (
                <li
                  key={index}
                  className="border-b px-2 py-3 text-sm"
                  style={{ borderColor: borderColor }}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </GraphWrapper>
      )}
    </>
  );
};

export default DemographicOrganizationalRole;
