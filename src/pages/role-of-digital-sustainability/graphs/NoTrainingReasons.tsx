import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- SHARED DATA LOGIC ---
const useNoTrainingReasonsData = () => {
    const surveyResponses = useSurveyData();
    const barColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");

    const { stats, otherTexts, eligibleResponses, totalRespondentsWithAnswer } =
        useMemo(() => {
            const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

            // 1. Filter: organizationOffersTraining != "yes" and not empty
            const filtered = surveyResponses.filter((r) => {
                const offer = normalize(r.raw.organizationOffersTraining);
                return offer !== "yes" && offer !== "";
            });

            // 2. Count Logic
            let lackAwareness = 0;
            let lackUnderstanding = 0;
            let noDemand = 0;
            let limitedBudget = 0;
            let notPriority = 0;
            let notSure = 0;
            let other = 0;
            let numberOfRespondents = 0;

            filtered.forEach((response) => {
                const raw = response.raw;
                let hasAnswer = false;

                if (normalize(raw.orgNoTrainingLackAwareness) === "yes") {
                    lackAwareness += 1;
                    hasAnswer = true;
                }
                if (normalize(raw.orgNoTrainingLackUnderstanding) === "yes") {
                    lackUnderstanding += 1;
                    hasAnswer = true;
                }
                if (normalize(raw.orgNoTrainingNoDemand) === "yes") {
                    noDemand += 1;
                    hasAnswer = true;
                }
                if (normalize(raw.orgNoTrainingLimitedBudget) === "yes") {
                    limitedBudget += 1;
                    hasAnswer = true;
                }
                if (normalize(raw.orgNoTrainingNotPriority) === "yes") {
                    notPriority += 1;
                    hasAnswer = true;
                }
                if (normalize(raw.orgNoTrainingNotSure) === "yes") {
                    notSure += 1;
                    hasAnswer = true;
                }

                const otherVal = normalize(raw.orgNoTrainingOther);
                if (otherVal.length > 0 && otherVal !== "n/a") {
                    other += 1;
                    hasAnswer = true;
                }

                if (hasAnswer) numberOfRespondents += 1;
            });

            const items = [
                { label: "Lack of awareness", value: lackAwareness },
                { label: "Lack of understanding", value: lackUnderstanding },
                { label: "No demand from employees", value: noDemand },
                { label: "Limited budget/resources", value: limitedBudget },
                { label: "Not a priority", value: notPriority },
                { label: "Not sure", value: notSure },
                { label: "Other", value: other },
            ];

            // Sort ascending by value
            items.sort((a, b) => a.value - b.value);

            // 3. Extract Other Texts
            const texts = filtered
                .map((r) => (r.raw.orgNoTrainingOther ?? "").trim())
                .filter((value) => {
                    if (!value) return false;
                    const lower = value.toLowerCase();
                    return lower.length > 0 && lower !== "n/a";
                });

            return {
                stats: items,
                otherTexts: texts,
                eligibleResponses: filtered,
                totalRespondentsWithAnswer: numberOfRespondents,
            };
        }, [surveyResponses]);

    return {
        stats,
        otherTexts,
        eligibleResponses,
        totalRespondentsWithAnswer,
        barColor,
        tickColor,
    };
};

// --- COMPONENT 1: Main Chart ---
export const NoTrainingReasons = ({
                                      onExplore,
                                      className,
                                  }: {
    onExplore?: () => void;
    className?: string;
}) => {
    const {
        stats,
        otherTexts,
        eligibleResponses,
        totalRespondentsWithAnswer,
        barColor,
        tickColor,
    } = useNoTrainingReasonsData();

    const questionHeader =
        "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?";

    const data = useMemo<Data[]>(
        () => [
            {
                type: "bar",
                orientation: "h",
                x: stats.map((i) => i.value),
                y: stats.map((i) => i.label),
                marker: { color: barColor },
                text: stats.map((i) => i.value.toString()),
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
        [stats, barColor, tickColor]
    );

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 40, l: 200 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                title: {
                    text: "Number of Respondents",
                    font: { family: "Inter, sans-serif", size: 12, color: tickColor },
                },
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
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
        [tickColor]
    );

    const totalEligible = eligibleResponses.length;
    const responseRate =
        totalEligible > 0
            ? (totalRespondentsWithAnswer / totalEligible) * 100
            : 0;

    return (
        <SurveyChart
            className={className}
            question={questionHeader}
            description="Shows the reasons why organizations do not offer training on sustainable digital solutions."
            numberOfResponses={totalRespondentsWithAnswer}
            responseRate={responseRate}
            data={data}
            layout={layout}
            hasExploreData={otherTexts.length > 0}
            onExplore={onExplore}
        />
    );
};

// --- COMPONENT 2: Detail List ---
export const NoTrainingReasonsDetails = ({ onBack }: { onBack: () => void }) => {
    const { stats, otherTexts } = useNoTrainingReasonsData();

    const questionHeader =
        "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?";
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "orgNoTrainingOther"
    )?.header;

    const wrapperQuestion = questionHeaderOther ?? "";

    // Calculate rate relative to how many people selected "Other" checkbox
    const otherStat = stats.find((s) => s.label === "Other");
    const numberOfOtherSelections = otherStat ? otherStat.value : 0;

    const responseRate = numberOfOtherSelections > 0
        ? (otherTexts.length / numberOfOtherSelections) * 100
        : 0;

    return (
        <SurveyExploreList
            title={questionHeader}
            items={otherTexts}
            question={wrapperQuestion}
            description="Lists the free-text reasons provided under the Other option."
            numberOfResponses={otherTexts.length}
            responseRate={responseRate}
            onBack={onBack}
        />
    );
};

export default NoTrainingReasons;