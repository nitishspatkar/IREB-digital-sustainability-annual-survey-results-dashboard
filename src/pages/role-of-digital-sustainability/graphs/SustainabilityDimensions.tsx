import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- SHARED DATA LOGIC ---
const useSustainabilityDimensionsData = () => {
    const surveyResponses = useSurveyData();
    const barColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");

    const counts = useMemo(() => {
        const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

        let environmental = 0;
        let social = 0;
        let individual = 0;
        let economic = 0;
        let technical = 0;
        let other = 0;
        let notSure = 0;
        let eligibleParticipants = 0;
        let respondentsWithAnyAnswer = 0;

        surveyResponses.forEach((response) => {
            const raw = response.raw;
            let hasAny = false;

            // Wer die Vorfrage mit "Yes" beantwortet hat, ist "eligible"
            if (normalize(raw.organizationIncorporatesSustainablePractices) === "yes") {
                eligibleParticipants += 1;
            }

            if (normalize(raw.considerEnvironmental) === "yes") {
                environmental += 1;
                hasAny = true;
            }
            if (normalize(raw.considerSocial) === "yes") {
                social += 1;
                hasAny = true;
            }
            if (normalize(raw.considerIndividual) === "yes") {
                individual += 1;
                hasAny = true;
            }
            if (normalize(raw.considerEconomic) === "yes") {
                economic += 1;
                hasAny = true;
            }
            if (normalize(raw.considerTechnical) === "yes") {
                technical += 1;
                hasAny = true;
            }

            if(normalize(raw.considerEnvironmental) === "no" && normalize(raw.considerSocial) === "no" && normalize(raw.considerIndividual) === "no" && normalize(raw.considerEconomic) === "no" && normalize(raw.considerTechnical) === "no") {
                hasAny = true;
            }

            if (normalize(raw.considerNotSure) === "yes") {
                notSure += 1;
                hasAny = true;
            }

            const otherVal = normalize(raw.considerOther);
            if (otherVal.length > 0 && otherVal !== "n/a") {
                other += 1;
                hasAny = true;
            }

            if (hasAny) {
                respondentsWithAnyAnswer += 1;
            }
        });

        const items = [
            { label: "Environmental", value: environmental },
            { label: "Social", value: social },
            { label: "Individual", value: individual },
            { label: "Economic", value: economic },
            { label: "Technical", value: technical },
            { label: "Not sure", value: notSure },
            { label: "Other", value: other },
        ];

        items.sort((a, b) => a.value - b.value);

        return {
            labels: items.map((item) => item.label),
            values: items.map((item) => item.value),
            respondentsWithAnyAnswer,
            eligibleParticipants
        };
    }, [surveyResponses]);

    const otherTexts = useMemo(() => {
        return surveyResponses
            .map((r) => (r.raw.considerOther ?? "").trim())
            .filter((value) => {
                if (!value) return false;
                const lower = value.toLowerCase();
                return lower.length > 0 && lower !== "n/a";
            });
    }, [surveyResponses]);

    return { counts, otherTexts, barColor, tickColor, surveyResponses };
};

// --- COMPONENT 1: Main Chart ---
export const SustainabilityDimensions = ({
                                             onExplore,
                                             className,
                                         }: {
    onExplore?: () => void;
    className?: string;
}) => {
    const { counts, otherTexts, barColor, tickColor } =
        useSustainabilityDimensionsData();

    const questionHeader =
        "Which dimensions of sustainability are actively considered in your organization's software development projects?";

    // Chart Logic
    const data = useMemo<Data[]>(
        () => [
            {
                type: "bar",
                orientation: "h",
                x: counts.values,
                y: counts.labels,
                marker: { color: barColor },
                text: counts.values.map((v) => v.toString()),
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
        [counts, barColor, tickColor]
    );

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 40, l: 120 },
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

    const numberOfRespondents = counts.respondentsWithAnyAnswer;
    const responseRate = counts.eligibleParticipants > 0
        ? (numberOfRespondents / counts.eligibleParticipants) * 100
        : 0;

    return (
        <SurveyChart
            className={className}
            question={questionHeader}
            description="Shows which dimensions of sustainability are actively considered in software development projects."
            numberOfResponses={numberOfRespondents}
            responseRate={responseRate}
            data={data}
            layout={layout}
            hasExploreData={otherTexts.length > 0}
            onExplore={onExplore}
        />
    );
};

// --- COMPONENT 2: Detail List ---
export const SustainabilityDimensionsDetails = ({
                                                    onBack,
                                                }: {
    onBack: () => void;
}) => {
    const { counts, otherTexts } = useSustainabilityDimensionsData();

    const questionHeader =
        "Which dimensions of sustainability are actively considered in your organization's software development projects?";
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "considerOther"
    )?.header;

    const wrapperQuestion = questionHeaderOther ?? "";

    // Calculate relative rate: Count of "Other" texts / Count of "Other" category selections
    // Note: Finding the count for "Other" in the sorted counts object
    const otherIndex = counts.labels.indexOf("Other");
    const numberOfOtherSelections = otherIndex >= 0 ? counts.values[otherIndex] : 0;

    const responseRate = numberOfOtherSelections > 0
        ? (otherTexts.length / numberOfOtherSelections) * 100
        : 0;

    return (
        <SurveyExploreList
            title={questionHeader}
            items={otherTexts}
            question={wrapperQuestion}
            description="Lists the free-text dimensions supplied under the Other option."
            numberOfResponses={otherTexts.length}
            responseRate={responseRate}
            onBack={onBack}
        />
    );
};

export default SustainabilityDimensions;