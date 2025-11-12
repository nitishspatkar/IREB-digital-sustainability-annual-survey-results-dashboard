import { useMemo } from "react";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import {columnDefinitions} from "../../../data/SurveyColumnDefinitions.ts";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const CustomerNotRequestingReasons = () => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "customerNotRequestingReasons")?.header
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");
    const borderColor = useThemeColor("--color-ink-200");

    const responses = useSurveyData();

    const reasons = useMemo<string[]>(() => {
        // Precondition: Q26 = "Rarely..." or "Never"
        const rarely = "rarely, but it has happened";
        const never = "never";

        const filteredResponses = responses.filter((r) => {
            const freq = normalize(r.raw.customerRequirementFrequency ?? "").toLowerCase();
            return freq === rarely || freq === never;
        });

        // 2. Get their descriptions from Q27
        return filteredResponses
            .map((r) => normalize(r.raw.customerNotRequestingReasons ?? ""))
            .filter(
                (reason) =>
                    reason.length > 0 && reason.toLowerCase() !== "n/a" // Remove empty/n.a.
            );
    }, [responses]);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3
                className="mb-4 text-lg text-center"
                style={{ color: titleColor }}
            >
                {questionHeader} ({reasons.length} responses)
            </h3>
            {reasons.length === 0 ? (
                <div
                    className="flex h-full items-center justify-center"
                    style={{ color: tickColor }}
                >
                    No reasons provided.
                </div>
            ) : (
                <div className="mt-4 h-[520px]">
                <ul
                    className="h-[calc(100%-40px)] overflow-y-auto"
                    style={{ color: tickColor }}
                >
                    {reasons.map((reason, index) => (
                        <li
                            key={index}
                            className="border-b px-2 py-3 text-sm"
                            style={{ borderColor: borderColor }}
                        >
                            {reason}
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
    );
};

export default CustomerNotRequestingReasons;