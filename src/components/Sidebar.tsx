import { navigationSections, type SectionId } from "../constants/navigation";
import irebLogo from "../assets/IREB_RGB.png"; // Image import added

type SidebarProps = {
  activeSectionId: SectionId;
  setActiveSectionId: (id: SectionId) => void;
  availableYears: readonly string[];
  activeYear: string;
  setActiveYear: (year: string) => void;
  isSidebarOpen: boolean; // Neu
  setIsSidebarOpen: (isOpen: boolean) => void; // Neu
};

function Sidebar({
  activeSectionId,
  setActiveSectionId,
  availableYears,
  activeYear,
  setActiveYear,
  isSidebarOpen, // Neu
  setIsSidebarOpen, // Neu
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col gap-6 overflow-y-auto 
        rounded-r-3xl border-r border-plum-200/60 bg-lavender-100 px-8 py-8 shadow-card
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:sticky md:translate-x-0
      `}
    >
      {/* --- Schließen-Button (nur mobil) --- */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(false)}
        className="absolute right-4 top-4 z-50 block rounded-md p-2 text-plum-600 md:hidden"
        aria-label="Menü schließen"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {/* Image added here */}
      <img src={irebLogo} alt="IREB Logo" className="mb-4 mt-8 md:mt-0" />{" "}
      {/* Oben etwas Platz für den X-Button auf mobil */}
      <div className="text-lg font-semibold tracking-tight text-plum-600">
        Sustainability Survey
      </div>
      <div className="mt-4">
        <label
          htmlFor="year-select"
          className="block text-sm font-medium text-ink-700"
        >
          Select Year
        </label>
        <select
          id="year-select"
          value={activeYear}
          onChange={(e) => setActiveYear(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <nav className="mt-6">
        <ul className="flex flex-col gap-2 text-sm font-medium text-ink-700">
          {navigationSections.map((section) => {
            const isActive = section.id === activeSectionId;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setIsSidebarOpen(false); // Menü bei Klick schließen (mobil)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-400/50 ${
                    isActive
                      ? "bg-plum-500 text-white shadow-card"
                      : "text-ink-700 hover:bg-plum-200/30 hover:text-plum-600"
                  }`}
                >
                  <span className="pr-2 leading-snug">{section.label}</span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-white" : "text-plum-400"
                    }`}
                  >
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
