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
      <main className="flex flex-1 flex-col p-12">
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
