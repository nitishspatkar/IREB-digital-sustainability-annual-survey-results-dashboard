import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { SurveyProvider } from "./data/SurveyContext";
import { SurveyRepository } from "./data/SurveyRepository";
import "./index.css";
import { navigationSections, type SectionId } from "./constants/navigation";

const availableYears = SurveyRepository.getAvailableYears();

function App() {
    const [activeSectionId, setActiveSectionId] = useState<SectionId>(
        navigationSections[0].id
    );
    const [activeYear, setActiveYear] = useState<string>(availableYears[0]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Status für mobile Sidebar

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
            {/* --- Mobile-Menü-Button (Hamburger) --- */}
            <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-40 block rounded-md bg-lavender-100 p-2 text-plum-600 shadow-md ring-1 ring-plum-200/40 md:hidden"
                aria-label="Menü öffnen"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                </svg>
            </button>

            {/* --- Backdrop-Overlay (nur mobil) --- */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    aria-hidden="true"
                />
            )}

            <Sidebar
                activeSectionId={activeSectionId}
                setActiveSectionId={setActiveSectionId}
                availableYears={availableYears}
                activeYear={activeYear}
                setActiveYear={setActiveYear}
                isSidebarOpen={isSidebarOpen} // Prop übergeben
                setIsSidebarOpen={setIsSidebarOpen} // Prop übergeben
            />
            <main className="flex flex-1 flex-col px-4 pb-12 pt-20 md:p-12">
                {" "}
                {/* Padding oben für mobil angepasst */}
                <div className="w-full rounded-[var(--radius-card)] border border-plum-200/60 bg-lavender-100 px-10 py-12 shadow-card ring-1 ring-plum-200/40 backdrop-blur-sm">
                    <SurveyProvider value={surveyData}>
                        <ActiveSectionComponent />
                    </SurveyProvider>
                </div>
            </main>
        </div>
    );
}

export default App;