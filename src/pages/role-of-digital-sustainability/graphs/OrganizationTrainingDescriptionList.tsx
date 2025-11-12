import { useMemo } from "react";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import {columnDefinitions} from "../../../data/SurveyColumnDefinitions.ts";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const OrganizationTrainingDescriptionList = () => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "organizationTrainingDescription")?.header
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");
    const borderColor = useThemeColor("--color-ink-200");

    const responses = useSurveyData();

    const descriptions = useMemo<string[]>(() => {
        // --- Precondition: Q23 = Yes ---
        const filteredResponses = responses.filter(
            (r) =>
                normalize(r.raw.organizationOffersTraining ?? "").toLowerCase() === "yes"
        );

        // 2. Get their descriptions from Q24
        return filteredResponses
            .map((r) => normalize(r.raw.organizationTrainingDescription ?? ""))
            .filter(
                (desc) =>
                    desc.length > 0 && desc.toLowerCase() !== "n/a" // Remove empty/n.a.
            );
    }, [responses]);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3
                className="mb-4 text-lg text-center"
                style={{ color: titleColor }}
            >
                {questionHeader} ({descriptions.length} responses)
            </h3>
            {descriptions.length === 0 ? (
                <div
                    className="flex h-full items-center justify-center"
                    style={{ color: tickColor }}
                >
                    No descriptions provided.
                </div>
            ) : (
                <div className="mt-4 h-[520px]">
                <ul
                    className="h-[calc(100%-40px)] overflow-y-auto"
                    style={{ color: tickColor }}
                >
                    {descriptions.map((desc, index) => (
                        <li
                            key={index}
                            className="border-b px-2 py-3 text-sm"
                            style={{ borderColor: borderColor }}
                        >
                            {desc}
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
    );
};

export default OrganizationTrainingDescriptionList;