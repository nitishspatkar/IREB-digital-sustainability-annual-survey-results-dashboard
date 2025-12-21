import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { SurveyProvider } from "./data/SurveyContext";
import { SurveyRepository } from "./data/SurveyRepository";
import "./index.css";
import { navigationSections, type SectionId } from "./constants/navigation";

const availableYears = SurveyRepository.getAvailableYears();
const sortedYears = [...availableYears].sort((a, b) => Number(b) - Number(a));

const currentYear = new Date().getFullYear().toString();
const initialYear = availableYears.includes(currentYear)
    ? currentYear
    : sortedYears[0];

function App() {
    const [activeSectionId, setActiveSectionId] = useState<SectionId>(
        navigationSections[0].id
    );
    const [activeYear, setActiveYear] = useState<string>(initialYear);

    const surveyData = SurveyRepository.getSurvey(activeYear);

    useEffect(() => {
        console.log(`Data for year ${activeYear}:`, surveyData);
    }, [activeYear, surveyData]);

    const activeSection = navigationSections.find(
        (section) => section.id === activeSectionId
    );

    const ActiveSectionComponent = activeSection?.component ?? (() => null);

    return (
        <div className="flex min-h-screen bg-transparent text-ink-900">
            <Sidebar
                activeSectionId={activeSectionId}
                setActiveSectionId={setActiveSectionId}
                availableYears={availableYears}
                activeYear={activeYear}
                setActiveYear={setActiveYear}
            />
            <main className="flex flex-1 flex-col px-4 pb-12 pt-20 md:p-12 bg-ireb-superlight-berry">
                <div className="w-full">
                    {sortedYears.length > 1 && (
                        <div className="mb-8 flex gap-4">
                            {sortedYears.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setActiveYear(year)}
                                    className={`font-mori flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 border-ireb-berry shadow-card ${
                                        year === activeYear
                                            ? "bg-ireb-berry text-white font-bold"
                                            : "bg-ireb-superlight-berry text-ireb-berry font-normal hover:bg-ireb-light-berry"
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    <SurveyProvider value={surveyData}>
                        <ActiveSectionComponent />
                    </SurveyProvider>
                </div>
            </main>
        </div>
    );
}

export default App;
