import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- TYPES & CONSTANTS ---
type ReasonStat = {
  label: string;
  key: string;
  count: number;
};

const reasonsList: Omit<ReasonStat, "count">[] = [
  { label: "I was not aware such programs existed", key: "trainingNotAware" },
  {
    label: "My organization does not offer such programs",
    key: "trainingNoOrganizationOffer",
  },
  {
    label: "I have not had the opportunity to attend",
    key: "trainingNoOpportunity",
  },
  { label: "I don't see the need for such training", key: "trainingNoNeed" },
  { label: "The cost is too high", key: "trainingTooExpensive" },
  { label: "Other", key: "trainingOtherReason" },
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

// --- SHARED DATA LOGIC ---
const useTrainingReasonsData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor("--color-ireb-berry");
  const tickColor = useThemeColor("--color-ireb-grey-01");

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    reasonsList.forEach((r) => counts.set(r.key, 0));

    let eligibleParticipants = 0;
    let respondentsWithAnyAnswer = 0;

    responses.forEach((r) => {
        const participated = normalize(r.raw.participatedInTraining ?? "").toLowerCase();

        // Wer mit "No" geantwortet hat, ist berechtigt
        if (participated === "no") {
            eligibleParticipants++;

            let hasAny = false;
            reasonsList.forEach((reason) => {
                const rawValue = r.raw[reason.key as keyof typeof r.raw] ?? "";
                const normalized = normalize(rawValue);

                const isSelected = reason.key === "trainingOtherReason"
                    ? normalized.length > 0
                    : normalized.toLowerCase() === "yes";

                if (isSelected) {
                    counts.set(reason.key, (counts.get(reason.key) ?? 0) + 1);
                    hasAny = true;
                }
            });

            if (hasAny) {
                respondentsWithAnyAnswer++;
            }
        }
    });

    const stats = reasonsList
      .map((reason) => ({
        ...reason,
        count: counts.get(reason.key) ?? 0,
      }))
      .sort((a, b) => a.count - b.count);

    return { stats, eligibleParticipants, respondentsWithAnyAnswer };
  }, [responses]);

  const otherTexts = useMemo(() => {
     return responses
      .filter(r => normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "no")
      .map((r) => normalize(r.raw.trainingOtherReason ?? ""))
      .filter((value) => value.length > 0);
  }, [responses]);

    return { ...data, otherTexts, barColor, tickColor };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const TrainingReasonsNo = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const { stats, otherTexts, eligibleParticipants, respondentsWithAnyAnswer, barColor, tickColor } =
    useTrainingReasonsData();

  const numberOfResponses = respondentsWithAnyAnswer;
  const responseRate =
    eligibleParticipants > 0
      ? (numberOfResponses / eligibleParticipants) * 100
      : 0;

  // Chart Logic
  const chartData = useMemo<Data[]>(
    () => [
      {
        type: "bar",
        orientation: "h",
        x: stats.map((s) => s.count),
        y: stats.map((s) => s.label),
        marker: { color: barColor },
        text: stats.map((s) => s.count.toString()),
        textposition: "outside",
        textfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
        cliponaxis: false,
        hoverinfo: "none",
      },
    ],
    [stats, barColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 40, b: 60, l: 300 }, // Preserved large left margin for labels
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: {
          text: "Number of Respondents",
          font: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
        },
        tickfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
      },
      yaxis: {
        tickfont: {
          family: "PP Mori, sans-serif",
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: "outside",
        ticklen: 10,
        tickcolor: "rgba(0,0,0,0)",
      },
    }),
    [tickColor]
  );

  const question =
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?";
  const description =
    "Reasons why respondents haven't participated in digital sustainability training.";

  return (
    <SurveyChart
      className={className}
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={otherTexts.length > 0}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List (Explore Page) ---
export const TrainingReasonsNoDetails = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const { stats, otherTexts } = useTrainingReasonsData();

  const questionHeaderOther = columnDefinitions.find(
    (c) => c.key === "trainingOtherReason"
  )?.header;

  const mainQuestion =
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?";
  const wrapperQuestion =
    questionHeaderOther ??
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before? [Other]";

  // Calculate rate relative to the "Other" bar count
  const numberOfOtherTexts = otherTexts.length;
  const numberOfOtherSelections =
    stats.find((s) => s.key === "trainingOtherReason")?.count ?? 0;

  const responseRate =
    numberOfOtherSelections > 0
      ? (numberOfOtherTexts / numberOfOtherSelections) * 100
      : 0;

  return (
    <SurveyExploreList
      title={mainQuestion}
      items={otherTexts}
      question={wrapperQuestion}
      description="Lists the free-text reasons supplied under the Other option."
      numberOfResponses={numberOfOtherTexts}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};

export default TrainingReasonsNo;
