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
    { label: "I was not aware such programs existed", key: "notMoreTrainingNotAware" },
    { label: "My organization does not offer such programs", key: "notMoreTrainingNoOrganization" },
    { label: "I have not had the opportunity to attend", key: "notMoreTrainingNoOpportunity" },
    { label: "I don't see the need for such training", key: "notMoreTrainingNoNeed" },
    { label: "The cost is too high", key: "notMoreTrainingTooExpensive" },
    { label: "Other", key: "notMoreTrainingOther" },
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

// --- SHARED DATA LOGIC ---
const useTrainingReasonsNotMoreData = () => {
    const responses = useSurveyData();
    const barColor = useThemeColor("--color-plum-400");
    const tickColor = useThemeColor("--color-ink-700");

    // 1. Filter for users who answered "Yes" to Q10 (Participated in Training)
    const participants = useMemo(() =>
            responses.filter(
                (r) => normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
            ),
        [responses]);

    // 2. Calculate Stats based on participants
    const stats = useMemo<ReasonStat[]>(() => {
        const counts = new Map<string, number>();
        reasonsList.forEach((r) => counts.set(r.key, 0));

        participants.forEach((r) => {
            reasonsList.forEach((reason) => {
                const rawValue = r.raw[reason.key as keyof typeof r.raw] ?? "";
                const normalized = normalize(rawValue);

                // Logic for multi-select checkboxes
                if (reason.key === "notMoreTrainingOther") {
                    // For 'Other', any text is a "yes"
                    if (normalized.length > 0) {
                        counts.set(reason.key, (counts.get(reason.key) ?? 0) + 1);
                    }
                } else {
                    // For standard checkboxes, "Yes" means selected
                    if (normalized.toLowerCase() === "yes") {
                        counts.set(reason.key, (counts.get(reason.key) ?? 0) + 1);
                    }
                }
            });
        });

        return reasonsList
            .map((reason) => ({
                ...reason,
                count: counts.get(reason.key) ?? 0,
            }))
            .sort((a, b) => a.count - b.count);
    }, [participants]);

    // 3. Extract "Other" Texts
    const otherTexts = useMemo(() => {
        return participants
            .map((r) => normalize(r.raw.notMoreTrainingOther ?? ""))
            .filter((value) => value.length > 0);
    }, [participants]);

    return { stats, otherTexts, participants, barColor, tickColor, responses };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const TrainingReasonsNotMore = ({
                                           onExplore,
                                           className
                                       }: {
    onExplore?: () => void;
    className?: string;
}) => {
    const { stats, otherTexts, participants, responses, barColor, tickColor } = useTrainingReasonsNotMoreData();

    // Stats Logic
    const numberOfResponses = participants.length;
    const totalResponses = responses.length;
    const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

    // Chart Logic
    const chartData = useMemo<Data[]>(() => [{
        type: "bar",
        orientation: "h",
        x: stats.map((s) => s.count),
        y: stats.map((s) => s.label),
        marker: { color: barColor },
        text: stats.map((s) => s.count.toString()),
        textposition: "outside",
        textfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
        cliponaxis: false,
        hoverinfo: "none",
    }], [stats, barColor, tickColor]);

    const layout = useMemo<Partial<Layout>>(() => ({
        margin: { t: 60, r: 40, b: 60, l: 300 }, // Preserved large left margin
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: {
            title: { text: "Number of Respondents", font: { family: "Inter, sans-serif", size: 12, color: tickColor } },
            tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
        yaxis: {
            tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
        },
    }), [tickColor]);

    const question = "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?";
    const description = "Reasons why respondents haven't participated in more digital sustainability training.";

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
export const TrainingReasonsNotMoreDetails = ({ onBack }: { onBack: () => void }) => {
    const { stats, otherTexts } = useTrainingReasonsNotMoreData();

    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "notMoreTrainingOther"
    )?.header;

    const mainQuestion = "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?";
    const wrapperQuestion = questionHeaderOther ?? "What are the reasons you haven’t participated in more training or educational programs on digital sustainability? [Other]";

    // Calculate rate relative to the "Other" bar count (Checkbox selection vs Text provided)
    const numberOfOtherTexts = otherTexts.length;
    const numberOfOtherSelections = stats.find(s => s.key === "notMoreTrainingOther")?.count ?? 0;

    const responseRate = numberOfOtherSelections > 0
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

export default TrainingReasonsNotMore;