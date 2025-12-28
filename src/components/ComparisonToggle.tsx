interface ComparisonToggleProps {
  yearsToCompare: string[];
  selectedComparisonYear: string | null;
  onSelectComparisonYear: (year: string | null) => void;
}

const ComparisonToggle = ({
  yearsToCompare,
  selectedComparisonYear,
  onSelectComparisonYear,
}: ComparisonToggleProps) => {
  if (yearsToCompare.length === 0) {
    return null;
  }

  const handleToggle = (year: string) => {
    if (selectedComparisonYear === year) {
      onSelectComparisonYear(null);
    } else {
      onSelectComparisonYear(year);
    }
  };

  return (
    <div className="flex flex-col gap-1 px-4 py-3 border border-ireb-grey-04 bg-white">
      <span className="text-sm font-bold text-ireb-grey-01">Compare</span>
      <div className="flex gap-4">
        {yearsToCompare.map((year) => (
          <label
            key={year}
            className="flex items-center gap-2 cursor-pointer select-none font-mori text-ireb-grey-01"
          >
            <input
              type="checkbox"
              checked={selectedComparisonYear === year}
              onChange={() => handleToggle(year)}
              className="w-5 h-5 border-2 border-ireb-berry text-ireb-berry focus:ring-ireb-light-berry focus:ring-offset-0 cursor-pointer"
            />
            {year}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ComparisonToggle;
