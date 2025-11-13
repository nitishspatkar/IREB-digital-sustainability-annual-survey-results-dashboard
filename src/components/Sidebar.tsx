import { useState } from "react";
import { navigationSections, type SectionId } from "../constants/navigation";
import irebLogo from "../assets/IREB_RGB.png"; // Image import added

type SidebarProps = {
  activeSectionId: SectionId;
  setActiveSectionId: (id: SectionId) => void;
  availableYears: readonly string[];
  activeYear: string;
  setActiveYear: (year: string) => void;
};

function Sidebar({
  activeSectionId,
  setActiveSectionId,
  availableYears,
  activeYear,
  setActiveYear,
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <>
      {/* --- Mobile-Menü-Button (Hamburger) --- */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 block rounded-md bg-ireb-superlight-berry p-2 text-ireb-berry shadow-md ring-1 ring-ireb-light-berry/40 md:hidden"
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

      <aside
        style={{
          fontFamily:
            '"GT Pressura Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
        className={`
        fixed top-0 left-0 z-50 flex h-screen w-100 shrink-0 flex-col gap-6 overflow-y-auto 
        border-r border-ireb-light-berry/60 md:border-r-0 bg-white px-8 py-8
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:sticky md:translate-x-0
      `}
      >
        {/* --- Schließen-Button (nur mobil) --- */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-4 top-4 z-50 block rounded-md p-2 text-ireb-berry md:hidden"
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
        <img
          src={irebLogo}
          alt="IREB Logo"
          className="mb-4 mt-8 md:mt-0"
        />{" "}
        {/* Oben etwas Platz für den X-Button auf mobil */}
        <div className="text-4xl md:text-4xl font-semibold tracking-tight text-ireb-berry">
          Sustainability Survey
        </div>
        <div className="mt-4">
          <label
            htmlFor="year-select"
            className="block text-sm font-medium text-ireb-grey-01"
          >
            Select Year
          </label>
          <select
            id="year-select"
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
            className="mt-1 block w-full rounded-md border-ireb-light-berry bg-ireb-superlight-berry py-2 pl-3 pr-10 text-base focus:border-ireb-berry focus:outline-none focus:ring-ireb-berry sm:text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <nav className="mt-6">
          <ul className="flex flex-col gap-4 text-base font-semibold">
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
                    className={`flex w-full items-center justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 ${
                      isActive
                        ? "bg-ireb-berry text-white border-ireb-berry shadow-card"
                        : "bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry"
                    }`}
                  >
                    <span className="pr-2 leading-snug">{section.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Footer contact block at the bottom */}
        <div className="mt-auto pt-4 text-sm md:text-lg leading-tight text-ireb-berry font-semibold">
          <div>IREB GmbH</div>
          <div>Mahlbergstrasse 25</div>
          <div>76189 Karlsruhe (Germany)</div>
          <div>+49 (0) 721 98 23 45 90</div>
          <div>info@ireb.org</div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
