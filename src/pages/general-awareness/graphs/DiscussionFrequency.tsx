import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
// Import der neuen generischen Views
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

type DiscussionFrequencyStat = {
    frequency: string;
    count: number;
};

const normalizeFrequency = (value: string) => value.replace(/\s+/g, " ").trim();

// --- SHARED DATA LOGIC ---
const useDiscussionFrequencyData = () => {
    const surveyResponses = useSurveyData();
    const chartBarColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");
    const titleColor = useThemeColor("--color-ireb-grey-01");

    const frequencyStats = useMemo<DiscussionFrequencyStat[]>(() => {
        const counts = new Map<string, number>();

        surveyResponses.forEach((response) => {
            const frequency = normalizeFrequency(
                response.raw.discussionFrequency ?? ""
            );
            if (frequency.length > 0 && frequency.toLowerCase() !== "n/a") {
                counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
            }
        });

        return Array.from(counts.entries())
            .map(([frequency, count]) => ({ frequency, count }))
            .sort((a, b) => a.count - b.count);
    }, [surveyResponses]);

    const otherFrequencyTexts = useMemo(() => {
        return surveyResponses
            .filter((response) => {
                // 1. Get the main frequency
                const frequency = normalizeFrequency(
                    response.raw.discussionFrequency ?? ""
                );
                // 2. Only keep this response if the frequency is actually "other"
                // (Adjust "other" to match exactly how your normalizeFrequency outputs it)
                return frequency.toLowerCase() === "other";
            })
            .map((response) =>
                normalizeFrequency(response.raw.discussionFrequencyOther ?? "")
            )
            .filter((value) => value.length > 0);
    }, [surveyResponses]);

    return {
        frequencyStats,
        otherFrequencyTexts,
        chartBarColor,
        tickColor,
        titleColor,
        surveyResponses,
    };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const DiscussionFrequency = ({
                                        onExplore,
                                        className,
                                    }: {
    onExplore: () => void;
    className?: string;
}) => {
    const { frequencyStats, otherFrequencyTexts, chartBarColor, tickColor, surveyResponses, titleColor } =
        useDiscussionFrequencyData();

    const questionHeader = columnDefinitions.find(
        (c) => c.key === "discussionFrequency"
    )?.header;

    // Stats Logic
    const numberOfResponses = frequencyStats.reduce(
        (sum, stat) => sum + stat.count,
        0
    );
    const responseRate =
        surveyResponses.length > 0
            ? (numberOfResponses / surveyResponses.length) * 100
            : 0;

    // Chart Configuration
    const chartData = useMemo<Data[]>(() => {
        return [
            {
                type: "bar",
                orientation: "h",
                x: frequencyStats.map((item) => item.count),
                y: frequencyStats.map((item) => item.frequency),
                marker: {
                    color: chartBarColor,
                },
                text: frequencyStats.map((item) => item.count.toString()),
                textposition: "outside",
                textfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                cliponaxis: false,
                hoverinfo: "none",
            },
        ];
    }, [frequencyStats, chartBarColor, tickColor]);

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 60, l: 240 }, // specific margins preserved
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                title: {
                    text: "Number of Respondents",
                    font: {
                        family: "Inter, sans-serif",
                        size: 12,
                        color: tickColor,
                    },
                },
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
            yaxis: {
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                automargin: true,
                ticks: "outside",
                ticklen: 10,
                tickcolor: "rgba(0,0,0,0)",
            },
        }),
        [titleColor, tickColor]
    );

    const question =
        questionHeader ??
        "How often do you discuss digital sustainability in your professional environment?";
    const description =
        "Shows the frequency of digital sustainability discussions among respondents.";

    return (
        <SurveyChart
            className={className}
            question={question}
            description={description}
            numberOfResponses={numberOfResponses}
            responseRate={responseRate}
            data={chartData}
            layout={layout}
            hasExploreData={otherFrequencyTexts.length > 0}
            onExplore={onExplore}
        />
    );
};

// --- COMPONENT 2: Detail List (Explore Page) ---
export const DiscussionFrequencyDetails = ({
                                               onBack,
                                           }: {
    onBack: () => void;
}) => {
    const { frequencyStats, otherFrequencyTexts } = useDiscussionFrequencyData();

    const mainQuestionHeader = columnDefinitions.find(
        (c) => c.key === "discussionFrequency"
    )?.header;
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "discussionFrequencyOther"
    )?.header;

    // Title Logic
    const mainQuestionTitle =
        mainQuestionHeader ??
        "How often do you discuss digital sustainability in your professional environment?";

    // Stats Logic for "Other"
    const numberOfResponsesOther = otherFrequencyTexts.length;
    const numberOfResponsesOtherAll = useMemo(() => {
        const otherStat = frequencyStats.find((s) =>
            s.frequency.toLowerCase().includes("other")
        );
        return otherStat ? otherStat.count : 0;
    }, [frequencyStats]);

    const otherResponseRate =
        numberOfResponsesOtherAll > 0
            ? (numberOfResponsesOther / numberOfResponsesOtherAll) * 100
            : 0;

    const wrapperQuestion = questionHeaderOther ?? ""; // Original code had empty fallback or specific string?
    // Note: Original code passed empty string if undefined for "Other" title in the list wrapper,
    // but usually we want the "Other" question text there.

    return (
        <SurveyExploreList
            title={mainQuestionTitle}
            items={otherFrequencyTexts}
            question={wrapperQuestion}
            description="Lists the free-text entries for the discussion frequency."
            numberOfResponses={numberOfResponsesOther}
            responseRate={otherResponseRate}
            onBack={onBack}
        />
    );
};

export default DiscussionFrequency;