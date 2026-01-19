import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import YearSwitcher from './components/YearSwitcher'; // Import YearSwitcher
import { SurveyProvider } from './data/data-parsing-logic/SurveyContext';
import { YearProvider } from './data/data-parsing-logic/YearContext';
import { SurveyRepository } from './data/data-parsing-logic/SurveyRepository';
import { GraphExploreProvider } from './contexts/GraphExploreContext';
import './index.css';

const Demographic = lazy(() => import('./pages/demographic/DemographicPage'));
const GeneralAwareness = lazy(() => import('./pages/general-awareness/GeneralAwarenessPage'));
const DigitalSustainabilityRole = lazy(
  () => import('./pages/role-of-digital-sustainability/DigitalSustainabilityRolePage')
);
const SustainabilityTasks = lazy(
  () => import('./pages/sustainability-in-job-and-tasks/SustainabilityTasksPage')
);
const AllGraphsPage = lazy(() => import('./pages/dev/AllGraphsPage'));

const availableYears = SurveyRepository.getAvailableYears();
const currentYear = new Date().getFullYear().toString();
const initialYear = availableYears.includes(currentYear)
  ? currentYear
  : availableYears.length > 0
    ? [...availableYears].sort((a, b) => Number(b) - Number(a))[0]
    : ''; // Safely get the latest year if current is not available

const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center text-ireb-berry font-mori">
    Loading...
  </div>
);

function App() {
  const [activeYear, setActiveYear] = useState<string>(initialYear);

  const surveyData = SurveyRepository.getSurvey(activeYear);

  useEffect(() => {
    console.log(`Data for year ${activeYear}:`, surveyData);
  }, [activeYear, surveyData]);

  return (
    <BrowserRouter>
      <YearProvider value={activeYear}>
        <SurveyProvider value={surveyData}>
          <GraphExploreProvider>
            <div className="flex min-h-screen bg-transparent text-ink-900">
              <Sidebar activeYear={activeYear} />
              <main className="flex flex-1 flex-col px-4 pb-12 pt-20 md:p-12 bg-ireb-superlight-berry">
                <div className="w-full">
                  <YearSwitcher
                    availableYears={availableYears}
                    activeYear={activeYear}
                    setActiveYear={setActiveYear}
                  />

                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/demographics" replace />} />
                      <Route path="/demographics" element={<Demographic />} />
                      <Route path="/general-awareness" element={<GeneralAwareness />} />
                      <Route
                        path="/digital-sustainability-role"
                        element={<DigitalSustainabilityRole />}
                      />
                      <Route path="/sustainability-tasks" element={<SustainabilityTasks />} />
                      {(import.meta.env.DEV ||
                        new URLSearchParams(window.location.search).get('debug')) && (
                        <Route path="/dev/all-graphs" element={<AllGraphsPage />} />
                      )}
                      <Route path="*" element={<Navigate to="/demographics" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </main>
            </div>
          </GraphExploreProvider>
        </SurveyProvider>
      </YearProvider>
    </BrowserRouter>
  );
}

export default App;
