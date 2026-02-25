import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { navigationSections } from '../constants/navigation';
import irebLogo from '../assets/IREB_RGB.png';
import { useGraphExplore } from '../contexts/GraphExploreContext';

type SidebarProps = {
  activeYear: string;
};

function Sidebar({ activeYear }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setActiveExploreId } = useGraphExplore();
  return (
    <>
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

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
        font-pressura fixed top-0 left-0 z-50 flex h-screen w-100 shrink-0 flex-col gap-6 overflow-y-auto 
        border-r border-ireb-light-berry/60 md:border-r-0 bg-white px-8 py-8
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:sticky md:translate-x-0
      `}
      >
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Link
          to="/"
          onClick={() => {
            setIsSidebarOpen(false);
            setActiveExploreId(null);
          }}
          className="mt-8 w-64 max-w-full cursor-pointer border-none bg-transparent p-0 text-left md:mt-0"
        >
          <img
            src={irebLogo}
            alt="IREB Logo"
            className="mb-4 mt-8 w-64 max-w-full h-auto md:mt-0"
          />
        </Link>
        <div className="text-4xl md:text-4xl tracking-tight text-ireb-berry font-bold">
          Digital Sustainability Survey {activeYear}
        </div>
        <nav className="mt-6">
          <ul className="flex flex-col gap-4 text-base">
            {navigationSections.map((section) => {
              return (
                <li key={section.id}>
                  <NavLink
                    to={section.path}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setActiveExploreId(null);
                    }}
                    className={({ isActive }) => `
                      flex w-full items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50
                      ${
                        isActive
                          ? 'bg-ireb-berry text-white border-ireb-berry shadow-card'
                          : 'bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry'
                      }
                    `}
                  >
                    <span className="pr-2 leading-snug">{section.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        {(import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug')) && (
          <div className="mt-6 pt-4 border-t-2 border-ireb-light-berry">
            <NavLink
              to="/dev/all-graphs"
              onClick={() => {
                setIsSidebarOpen(false);
                setActiveExploreId(null);
              }}
              className={({ isActive }) => `
                flex w-full items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50
                ${
                  isActive
                    ? 'bg-ireb-berry text-white border-ireb-berry shadow-card'
                    : 'bg-amber-100 text-amber-800 border-amber-500 hover:bg-amber-200 hover:text-amber-900'
                }
              `}
            >
              <span className="pr-2 leading-snug">🔧 All Graphs (Dev)</span>
            </NavLink>
          </div>
        )}
        <div className="mt-auto pt-4 text-sm md:text-lg leading-tight text-ireb-berry">
          <div>IREB GmbH</div>
          <div>Mahlbergstrasse 25</div>
          <div>76189 Karlsruhe (Germany)</div>
          <div>+49 (0) 721 98 23 45 90</div>
          <div>info@ireb.org</div>
          {/* --- Option 1: Current (Link icon) --- */}
          <div className="mt-4 mb-6">
            <div className="text-xs font-bold mb-2 opacity-50">Option 1: Current</div>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm">
              <a
                href="https://ireb.org/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                Privacy
              </a>
              <a
                href="https://ireb.org/en/imprint"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                Imprint
              </a>
              <a
                href="https://ireb.org/en/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                Disclaimer
              </a>
            </div>
          </div>

          {/* --- Option 2: Simple Underlined --- */}
          <div className="mb-6">
            <div className="text-xs font-bold mb-2 opacity-50">Option 2: Simple Underlined</div>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm">
              <a
                href="https://ireb.org/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ireb-light-berry transition-colors"
              >
                Privacy
              </a>
              <a
                href="https://ireb.org/en/imprint"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ireb-light-berry transition-colors"
              >
                Imprint
              </a>
              <a
                href="https://ireb.org/en/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ireb-light-berry transition-colors"
              >
                Disclaimer
              </a>
            </div>
          </div>

          {/* --- Option 3: Specific Icons --- */}
          <div className="mb-6">
            <div className="text-xs font-bold mb-2 opacity-50">Option 3: Specific Icons</div>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm">
              <a
                href="https://ireb.org/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Privacy
              </a>
              <a
                href="https://ireb.org/en/imprint"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                Imprint
              </a>
              <a
                href="https://ireb.org/en/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"
                  />
                </svg>
                Disclaimer
              </a>
            </div>
          </div>

          {/* --- Option 4: External Link Icon --- */}
          <div className="mb-6">
            <div className="text-xs font-bold mb-2 opacity-50">Option 4: External Link Icon</div>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm">
              <a
                href="https://ireb.org/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                Privacy
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 ml-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
              <a
                href="https://ireb.org/en/imprint"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                Imprint
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 ml-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
              <a
                href="https://ireb.org/en/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                Disclaimer
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 ml-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* --- Option 5: Arrow Icon --- */}
          <div className="mb-6">
            <div className="text-xs font-bold mb-2 opacity-50">Option 5: Arrow Icon</div>
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm">
              <a
                href="https://ireb.org/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                Privacy
              </a>
              <a
                href="https://ireb.org/en/imprint"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                Imprint
              </a>
              <a
                href="https://ireb.org/en/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
