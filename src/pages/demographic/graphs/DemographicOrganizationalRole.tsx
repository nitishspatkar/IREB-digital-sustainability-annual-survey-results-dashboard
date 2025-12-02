import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

interface RoleStat {
    role: string;
    count: number;
}

const normalizeRole = (value: string) => value.replace(/\s+/g, " ").trim();

// --- SHARED DATA LOGIC (Bleibt unverändert) ---
const useRoleData = () => {
    const surveyResponses = useSurveyData();
    const chartBarColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");

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

    // --- CHANGED SECTION ---
    const otherRoleTexts = useMemo(() => {
        return surveyResponses
            .filter((response) => {
                // 1. Get the primary role
                const role = normalizeRole(response.raw.role ?? "");
                // 2. Check if the primary role is "other"
                return role.toLowerCase() === "other";
            })
            .map((response) => normalizeRole(response.raw.roleOther ?? ""))
            .filter((value) => value.length > 0);
    }, [surveyResponses]);
    // -----------------------

    return { roleStats, otherRoleTexts, chartBarColor, tickColor, surveyResponses };
};

// --- COMPONENT 1: The Main Chart (Dashboard View) ---
export const DemographicOrganizationalRole = ({onExplore, className}: {
    onExplore: () => void;
    className?: string;
}) => {

    const { roleStats, otherRoleTexts, chartBarColor, tickColor, surveyResponses } = useRoleData();
    const questionHeader = columnDefinitions.find((c) => c.key === "role")?.header;

    const numberOfResponses = roleStats.reduce(
        (sum, stat) => sum + stat.count,
        0
    );
    const responseRate =
        surveyResponses.length > 0
            ? (numberOfResponses / surveyResponses.length) * 100
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
                textfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
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
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
                title: {
                    text: "Number of Respondents",
                    font: { family: "Inter, sans-serif", size: 12, color: tickColor },
                },
            },
            yaxis: {
                tickfont: { family: "Inter, sans-serif", size: 11, color: tickColor },
                automargin: true,
            },
        }),
        [tickColor]
    );


    // Render Generic Chart Component
    return (
        <SurveyChart
            className={className}
            question={questionHeader ?? "Which of the following best describes your current role in the organization?"}
            description={"Shows how respondents distribute across the provided organizational role options."}
            numberOfResponses={numberOfResponses}
            responseRate={responseRate}
            data={chartData}
            layout={layout}
            hasExploreData={otherRoleTexts.length > 0}
            onExplore={onExplore}
        />
    );
};

// --- COMPONENT 2: The Detailed View (Explore Page) ---
export const DemographicOrganizationalRoleDetails = ({onBack}: {
    onBack: () => void;
}) => {
    const { roleStats, otherRoleTexts } = useRoleData();

    // Get headers
    const mainQuestionHeader = columnDefinitions.find(
        (c) => c.key === "role"
    )?.header;
    const questionHeaderOther = columnDefinitions.find(
        (c) => c.key === "roleOther"
    )?.header;

    const numberOfResponsesOther = otherRoleTexts.length;
    const numberOfResponsesOtherAll = useMemo(() => {
        const otherStat = roleStats.find((s) =>
            s.role.toLowerCase().includes("other")
        );
        return otherStat ? otherStat.count : 0;
    }, [roleStats]);

    const otherResponseRate =
        numberOfResponsesOtherAll > 0
            ? (numberOfResponsesOther / numberOfResponsesOtherAll) * 100
            : 0;

    return (
        <SurveyExploreList
            title={mainQuestionHeader ?? "Which of the following best describes your current role in the organization?"}
            items={otherRoleTexts}
            question={questionHeaderOther ?? "Which of the following best describes your current role in the organization? [Other]"}
            description={"Lists the free-text role descriptions supplied under the Other option."}
            numberOfResponses={numberOfResponsesOther}
            responseRate={otherResponseRate}
            onBack={onBack}
        />
    );
};