import React from 'react';

type YearSwitcherProps = {
  availableYears: readonly string[];
  activeYear: string;
  setActiveYear: (year: string) => void;
};

const YearSwitcher: React.FC<YearSwitcherProps> = ({
  availableYears,
  activeYear,
  setActiveYear,
}) => {
  const sortedYears = [...availableYears].sort((a, b) => Number(b) - Number(a));

  if (sortedYears.length <= 1) {
    return null; // No need for a switcher if there's only one or no year
  }

  return (
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
  );
};

export default YearSwitcher;
