import { useMemo } from "react";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingDescriptionList = () => {
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");
    const borderColor = useThemeColor("--color-ink-200");

    const responses = useSurveyData();

    const descriptions = useMemo<string[]>(() => {
        // 1. Filter for users who answered "Yes" to Q10
        const participants = responses.filter(
            (r) =>
                normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
        );

        // 2. Get their descriptions
        return participants
            .map((r) => normalize(r.raw.trainingDescription ?? ""))
            .filter(
                (desc) =>
                    desc.length > 0 && desc.toLowerCase() !== "n/a" // Remove empty/n.a.
            );
    }, [responses]);

    return (
        <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3
                className="mb-4 text-lg font-semibold"
                style={{ color: titleColor }}
            >
                Training Program Descriptions ({descriptions.length} responses)
            </h3>
            {descriptions.length === 0 ? (
                <div
                    className="flex h-full items-center justify-center"
                    style={{ color: tickColor }}
                >
                    No descriptions provided.
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default TrainingDescriptionList;