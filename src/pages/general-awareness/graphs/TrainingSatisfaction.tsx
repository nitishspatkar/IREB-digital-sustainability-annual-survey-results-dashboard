import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

type SatisfactionStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingSatisfaction = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "trainingSatisfaction"
  )?.header;
  const yesColor = useThemeColor("--color-ireb-spring");
  const noColor = useThemeColor("--color-ireb-mandarin");
  const titleColor = useThemeColor("--color-ireb-grey-01");
  const tickColor = useThemeColor("--color-ireb-grey-01");

  const responses = useSurveyData();

  const stats = useMemo<SatisfactionStat[]>(() => {
    const counts = new Map<string, number>();

    const participants = responses.filter(
      (r) =>
        normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
    );

    participants.forEach((r) => {
      const raw = normalize(r.raw.trainingSatisfaction ?? "");
      if (!raw || raw.toLowerCase() === "n/a") return;

      let key = raw;
      const lower = raw.toLowerCase();
      if (lower === "yes") key = "Yes";
      else if (lower === "no") key = "No";

      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const order = ["Yes", "No"];
    const items = Array.from(counts.entries()).map(([label, count]) => ({
      label,
      count,
    }));

    order.forEach((label) => {
      if (!counts.has(label)) items.push({ label, count: 0 });
    });

    return items.sort(
      (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
    );
  }, [responses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: "bar",
        marker: {
            color: stats.map((s) => (s.label === "Yes" ? yesColor : noColor)),
        },
        // --- CHANGES START HERE ---
        text: stats.map((s) => s.count.toString()),
        textposition: "outside",
        textfont: {
          family: "PP Mori, sans-serif",
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        // --- CHANGES END HERE ---
        hoverinfo: "none",
      },
    ];
  }, [stats, yesColor, noColor, tickColor]); // Added tickColor

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 40 }, // Changed t: 30 to t: 50
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
    [titleColor, tickColor]
  );


  const eligibleParticipants = responses.filter(
      (r) => normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
  ).length;

  const numberOfResponses = stats.reduce((sum, s) => sum + s.count, 0);

  const responseRate =
      eligibleParticipants > 0
          ? (numberOfResponses / eligibleParticipants) * 100
          : 0;

  const question =
    questionHeader ?? "Are you satisfied with the training you received?";
  const description =
    "Shows satisfaction levels with digital sustainability training programs.";

  return (
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
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </GraphWrapper>
  );
};

export default TrainingSatisfaction;
