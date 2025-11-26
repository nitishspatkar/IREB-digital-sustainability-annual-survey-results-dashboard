import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- SHARED DATA LOGIC ---
const useKnowledgeGapsData = () => {
    const responses = useSurveyData();
    const barColor = useThemeColor("--color-plum-400");
    const tickColor = useThemeColor("--color-ink-700");

    const { stats, otherTexts, totalRespondentsWithAnswer, totalEligible } =
        useMemo(() => {
            const norm = (v: string) => v?.trim().toLowerCase() ?? "";

            let environmental = 0;
            let social = 0;
            let individual = 0;
            let economic = 0;
            let technical = 0;
            let none = 0;
            let other = 0;
            let numberOfRespondents = 0;

            responses.forEach((r) => {
                const raw = r.raw;
                let hasAnswer = false;

                if (norm(raw.lackKnowledgeEnvironmental) === "yes") {
                    environmental += 1;
                    hasAnswer = true;
                }
                if (norm(raw.lackKnowledgeSocial) === "yes") {
                    social += 1;
                    hasAnswer = true;
                }
                if (norm(raw.lackKnowledgeIndividual) === "yes") {
                    individual += 1;
                    hasAnswer = true;
                }
                if (norm(raw.lackKnowledgeEconomic) === "yes") {
                    economic += 1;
                    hasAnswer = true;
                }
                if (norm(raw.lackKnowledgeTechnical) === "yes") {
                    technical += 1;
                    hasAnswer = true;
                }
                if (norm(raw.lackKnowledgeNone) === "yes") {
                    none += 1;
                    hasAnswer = true;
                }

                const otherVal = norm(raw.lackKnowledgeOther);
                if (otherVal.length > 0 && otherVal !== "n/a") {
                    other += 1;
                    hasAnswer = true;
                }

                if (hasAnswer) numberOfRespondents += 1;
            });

            const items = [
                { label: "Environmental", value: environmental },
                { label: "Social", value: social },
                { label: "Individual", value: individual },
                { label: "Economic", value: economic },
                { label: "Technical", value: technical },
                { label: "None", value: none },
                { label: "Other", value: other },
            ];

            // Sort ascending by value for horizontal chart
            items.sort((a, b) => a.value - b.value);

            // Extract texts
            const texts = responses
                .map((r) => (r.raw.lackKnowledgeOther ?? "").trim())
                .filter((value) => {
                    if (!value) return false;
                    const lower = value.toLowerCase();
                    return lower.length > 0 && lower !== "n/a";
                });

            return {
                stats: items,
                otherTexts: texts,
                totalRespondentsWithAnswer: numberOfRespondents,
                totalEligible: responses.length,
            };
        }, [responses]);

    return {
        stats,
        otherTexts,
        totalRespondentsWithAnswer,
        totalEligible,
        barColor,
        tickColor,
    };
};

// --- COMPONENT 1: Main Chart ---
export const KnowledgeGapsByDimension = ({
                                             onExplore,
                                             className,
                                         }: {
    onExplore?: () => void;
    className?: string;
}) => {
    const {
        stats,
        otherTexts,
        totalRespondentsWithAnswer,
        totalEligible,
        barColor,
        tickColor,
    } = useKnowledgeGapsData();

    const questionHeader =
        "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?";

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
            margin: { t: 50, r: 40, b: 60, l: 120 }, // Preserved margin
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
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
        }),
        [tickColor]
    );

    const responseRate =
        totalEligible > 0
            ? Math.round((totalRespondentsWithAnswer / totalEligible) * 100)
            : 0;

    return (
        <SurveyChart
            className={className}
            question={questionHeader}
            description="Shows which sustainability dimensions respondents feel they lack knowledge or tools to address."
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
export const KnowledgeGapsByDimensionDetails = ({
                                                    onBack,
                                                }: {
    onBack: () => void;
}) => {
    const { stats, otherTexts } = useKnowledgeGapsData();

    const questionHeader =
        "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?";
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "lackKnowledgeOther"
    )?.header;

    const wrapperQuestion = questionHeaderOther ?? "";

    // Calculate rate relative to "Other" checkbox selection
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
            description="Lists the free-text dimensions provided under the Other option."
            numberOfResponses={otherTexts.length}
            responseRate={responseRate}
            onBack={onBack}
        />
    );
};

export default KnowledgeGapsByDimension;