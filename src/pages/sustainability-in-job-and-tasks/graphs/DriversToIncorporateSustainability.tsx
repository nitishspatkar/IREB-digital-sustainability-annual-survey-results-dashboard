import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

// Make sure these paths are correct in your project
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- SHARED DATA LOGIC ---
const useDriversData = () => {
    const surveyResponses = useSurveyData();
    const barColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");

    // We extract all calculation logic into useMemo to prevent re-calc on every render
    const { stats, driveOtherTexts, totalRespondentsWithAnswer, totalResponses } = useMemo(() => {
        const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

        let orgPolicies = 0;
        let personalBeliefs = 0;
        let clientReqs = 0;
        let userReqs = 0;
        let legalReqs = 0;
        let other = 0;
        let respondentsWithAnyAnswer = 0;

        // --- Precondition: Q28 = Yes ---
        const filteredResponses = surveyResponses.filter(
            (r) => normalize(r.raw.personIncorporatesSustainability) === "yes"
        );

        filteredResponses.forEach((response) => {
            const raw = response.raw;
            let hasAnswer = false;

            if (normalize(raw.driveOrganizationalPolicies) === "yes") {
                orgPolicies += 1;
                hasAnswer = true;
            }
            if (normalize(raw.drivePersonalBeliefs) === "yes") {
                personalBeliefs += 1;
                hasAnswer = true;
            }
            if (normalize(raw.driveClientRequirements) === "yes") {
                clientReqs += 1;
                hasAnswer = true;
            }
            if (normalize(raw.driveUserRequirements) === "yes") {
                userReqs += 1;
                hasAnswer = true;
            }
            if (normalize(raw.driveLegalRequirements) === "yes") {
                legalReqs += 1;
                hasAnswer = true;
            }

            if(normalize(raw.driveOrganizationalPolicies) === "no" && normalize(raw.drivePersonalBeliefs) === "no" && normalize(raw.driveClientRequirements) === "no" && normalize(raw.driveUserRequirements) === "no" && normalize(raw.driveLegalRequirements) === "no") {
                hasAnswer = true;
            }

            const otherVal = normalize(raw.driveOther);
            if (otherVal.length > 0 && otherVal !== "n/a") {
                other += 1;
                hasAnswer = true;
            }

            if (hasAnswer) respondentsWithAnyAnswer += 1;
        });

        const items = [
            { label: "Organizational policies", value: orgPolicies },
            { label: "Personal beliefs", value: personalBeliefs },
            { label: "Client requirements", value: clientReqs },
            { label: "User requirements", value: userReqs },
            { label: "Legal requirements", value: legalReqs },
            { label: "Other", value: other },
        ];

        // Sort ascending by value (so largest bar is at the bottom in a horizontal chart)
        // Switch to b.value - a.value if you want largest at top
        items.sort((a, b) => a.value - b.value);

        // Extract texts
        // Note: We map over 'filteredResponses' here to ensure consistency with the precondition
        const texts = filteredResponses
            .map((r) => (r.raw.driveOther ?? "").trim())
            .filter((value) => {
                if (!value) return false;
                const lower = value.toLowerCase();
                return lower.length > 0 && lower !== "n/a" && lower !== "yes";
            });

        return {
            stats: items,
            driveOtherTexts: texts,
            totalRespondentsWithAnswer: respondentsWithAnyAnswer,
            totalResponses: filteredResponses.length, // <--- FIXED: Calculated inside scope
        };
    }, [surveyResponses]);

    return {
        stats,
        driveOtherTexts,
        totalRespondentsWithAnswer,
        totalResponses, // <--- Passed through from useMemo
        barColor,
        tickColor,
    };
};

// --- COMPONENT 1: Main Chart ---
export const DriversToIncorporateSustainability = ({
                                                       onExplore,
                                                       className,
                                                   }: {
    onExplore?: () => void;
    className?: string;
}) => {
    const {
        stats,
        driveOtherTexts,
        totalRespondentsWithAnswer,
        totalResponses,
        barColor,
        tickColor,
    } = useDriversData();

    const questionHeader =
        "What drives you to incorporate digital sustainability in your role-related tasks?";

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
                    family: "PP Mori, sans-serif",
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
            margin: { t: 50, r: 40, b: 60, l: 180 },
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
            autosize: true, // Recommended for responsive layouts
        }),
        [tickColor]
    );

    const responseRate =
        totalResponses > 0
            ? (totalRespondentsWithAnswer / totalResponses) * 100
            : 0;

    return (
        <SurveyChart
            className={className}
            question={questionHeader}
            description="Shows which factors motivate respondents to integrate digital sustainability into their role-specific tasks."
            numberOfResponses={totalRespondentsWithAnswer}
            responseRate={responseRate}
            data={data}
            layout={layout}
            hasExploreData={driveOtherTexts.length > 0}
            onExplore={onExplore}
        />
    );
};

// --- COMPONENT 2: Detail List ---
export const DriversToIncorporateSustainabilityDetails = ({
                                                              onBack,
                                                          }: {
    onBack: () => void;
}) => {
    const { stats, driveOtherTexts } = useDriversData();

    const questionHeader =
        "What drives you to incorporate digital sustainability in your role-related tasks?";

    // Safety check in case columnDefinitions is missing the key
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "driveOther"
    )?.header ?? "Other Comments";

    const wrapperQuestion = questionHeaderOther;

    // Calculate rate relative to "Other" checkbox selection
    const otherStat = stats.find((s) => s.label === "Other");
    const numberOfOtherSelections = otherStat ? otherStat.value : 0;

    const responseRate =
        numberOfOtherSelections > 0
            ? (driveOtherTexts.length / numberOfOtherSelections) * 100
            : 0;

    return (
        <SurveyExploreList
            title={questionHeader}
            items={driveOtherTexts}
            question={wrapperQuestion}
            description="Lists the free-text drivers supplied under the Other option."
            numberOfResponses={driveOtherTexts.length}
            responseRate={responseRate}
            onBack={onBack}
        />
    );
};

export default DriversToIncorporateSustainability;