import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

interface Props {
  className?: string;
}

const normalizeApplicationDomain = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const DemographicApplicationDomain = ({ className }: Props) => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "primaryApplicationDomain"
  )?.header;
  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "primaryApplicationDomainOther"
  )?.header;
  const chartBarColor = useThemeColor("--color-plum-400");
  const tickColor = useThemeColor("--color-ink-700");
  const surveyResponses = useSurveyData();
  const borderColor = useThemeColor("--color-ink-200");

  const applicationDomainStats = useMemo(() => {
    const counts = new Map<string, number>();

    surveyResponses.forEach((response) => {
      const primaryDomain = normalizeApplicationDomain(
        response.raw.primaryApplicationDomain ?? ""
      );

      const domain = primaryDomain;

      if (domain.length > 0 && domain.toLowerCase() !== "n/a") {
        counts.set(domain, (counts.get(domain) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  }, [surveyResponses]);

  const otherApplicationDomainTexts = useMemo(() => {
    return surveyResponses
      .map((response) =>
        normalizeApplicationDomain(
          response.raw.primaryApplicationDomainOther ?? ""
        )
      )
      .filter((value) => value.length > 0);
  }, [surveyResponses]);

  const numberOfResponses = applicationDomainStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );
  const totalResponses = surveyResponses.length;
  const responseRate =
    totalResponses > 0
      ? (numberOfResponses / totalResponses) * 100
      : 0;

  const chartData = useMemo<Data[]>(
    () => [
      {
        x: applicationDomainStats.map((item) => item.count),
        y: applicationDomainStats.map((item) => item.domain),
        type: "bar",
        orientation: "h",
        marker: {
          color: chartBarColor,
        },
        text: applicationDomainStats.map((item) => item.count.toString()),
        textposition: "outside",
        hoverinfo: "y+x",
        textfont: {
          color: tickColor,
        },
      },
    ],
    [applicationDomainStats, chartBarColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 40, r: 40, b: 40, l: 250 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        tickangle: 0,
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        zeroline: false,
      },
      yaxis: {
        autorange: "reversed",
        tickfont: {
          family: "Inter, sans-serif",
          size: 12,
          color: tickColor,
        },
        showline: false,
        automargin: true,
      },
      showlegend: false,
    }),
    [tickColor]
  );

  const question =
    questionHeader ??
    "In which application domain do you currently primarily work?";
  const description =
    "Breaks down the primary application domains represented by respondents.";

  const otherQuestion =
    questionHeaderOther ??
    "In which application domain do you currently primarily work? [Other]";
  const otherDescription =
    "Lists the free-text application domains supplied under the Other option.";

  const chartContent = (
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
  );

  return (
    <>
      {className ? (
        <div className={className}>{chartContent}</div>
      ) : (
        chartContent
      )}

      {otherApplicationDomainTexts.length > 0 && (
        <GraphWrapper
          question={otherQuestion}
          description={otherDescription}
        >
          <div className="h-[520px] overflow-y-auto">
            <ul style={{ color: tickColor }}>
              {otherApplicationDomainTexts.map((text, index) => (
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

export default DemographicApplicationDomain;
